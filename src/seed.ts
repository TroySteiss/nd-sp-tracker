import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type pg from 'pg';
import { pool } from './db.js';
import { PROPERTIES, pcolor, type AppState } from '../shared/domain.js';

export const SEED_PATH = join(process.cwd(), 'seed', 'initial-data.json');

const dnull = (v: any): string | null => {
  if (v == null || v === '') return null;
  const raw = String(v).trim();
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // M/D/YY[YY] -> YYYY-MM-DD
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`; }
  const s = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};
const nnull = (v: any): number | null => (v == null || v === '' || isNaN(Number(v)) ? null : Number(v));

/**
 * Replace all data with the given state, transactionally. Reused by the seed
 * script, the JSON-backup restore endpoint, and "reset to seed".
 * Properties/regions come from the blob (the DB is the runtime source of truth);
 * the static PROPERTIES list is only a fallback for blobs that predate it.
 */
export async function loadStateInto(client: pg.PoolClient, state: AppState): Promise<void> {
  await client.query('truncate contracts, files, gl_lines, cash_adjustments, cash_snapshots, progress_notes, bids, projects, properties restart identity cascade');
  await client.query('delete from regions').catch(() => { /* pre-migration DB */ });
  const projectIds = new Set((state.projects || []).map((p) => p.id));

  // properties — from the blob; static list fills gaps (old backups without color/portfolio)
  const blobProps = (state.properties || []).length ? state.properties : PROPERTIES;
  for (const p of blobProps) {
    const ref: any = PROPERTIES.find((r) => r.code === p.code) || {};
    const fromBlob: any = p;
    await client.query(
      `insert into properties(code,name,region,manager,color,portfolio,sp_budget,units,owner_entity,address,owner_notice_addr,contract_code,accretion_pct,avg_monthly_interest)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [p.code, fromBlob.name || ref.name || p.code, fromBlob.region || ref.region || '', fromBlob.manager || ref.manager || '',
       fromBlob.color || pcolor(p.code), fromBlob.portfolio || ref.portfolio || '',
       nnull(fromBlob.spBudget) ?? 0, fromBlob.units ?? 0,
       fromBlob.ownerEntity || '', fromBlob.address || '', fromBlob.ownerNoticeAddr || '', fromBlob.contractCode || p.code,
       nnull(fromBlob.accretionPct), nnull(fromBlob.avgMonthlyInterest) ?? 0]
    );
    // update-email settings round-trip (columns exist since migrations 011/012/015)
    await client.query(
      'update properties set update_to=$1, update_cc=$2, update_greeting=$3, update_enabled=$4, update_include_discussed=$5 where code=$6',
      [fromBlob.updateTo || '', fromBlob.updateCc || '', fromBlob.updateGreeting || '', fromBlob.updateEnabled !== false, fromBlob.updateIncludeDiscussed === true, p.code]
    ).catch(() => { /* pre-migration DB */ });
  }

  // regions — from the blob when present, otherwise derived from the properties in order
  const regionRows: { name: string; sort: number }[] = (state.regions || []).length
    ? state.regions!
    : [...new Set(blobProps.map((p) => p.region).filter(Boolean))].map((name, i) => ({ name: name as string, sort: i + 1 }));
  for (const r of regionRows) {
    await client.query('insert into regions(name,sort) values($1,$2) on conflict (name) do update set sort=excluded.sort', [r.name, r.sort])
      .catch(() => { /* pre-migration DB */ });
  }

  // projects + bids + progress notes
  for (const p of state.projects || []) {
    await client.query(
      `insert into projects(id,property_code,category,name,description,plan,action_item,contractor,
         anticipated_cost,actual_cost,date_added,planned_start,planned_end,steps,notes,on_hold,pinned,
         in_house,ih_unit,total_to_complete,amount_completed,no_contract,no_contract_set,split)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [
        p.id, p.property, p.category || 'GENERAL', p.name || '(untitled)', p.description || '', p.plan || '',
        p.actionItem || '', p.contractor || '', nnull(p.anticipatedCost), nnull(p.actualCost),
        dnull(p.dateAdded), dnull(p.plannedStart), dnull(p.plannedEnd), JSON.stringify(p.steps || {}),
        p.notes || '', !!p.onHold, !!p.pinned, !!p.inHouse, p.ihUnit === 'quantity' ? 'quantity' : 'budget',
        nnull(p.totalToComplete), nnull(p.amountCompleted), !!p.noContract, !!p.noContractSet,
        (p as any).split ? JSON.stringify((p as any).split) : null,
      ]
    );
    let slot = 0;
    for (const b of p.bids || []) {
      await client.query(
        `insert into bids(id,project_id,slot,contractor,amount,approved,file_key,file_name,file_size)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [b.id || `${p.id}-b${slot}`, p.id, slot, b.contractor || '', nnull(b.amount), !!b.approved, b.fileKey || null, b.fileName || null, b.fileSize || null]
      );
      slot++;
    }
    for (const n of p.progressNotes || []) {
      await client.query(`insert into progress_notes(id,project_id,date,note,username,ts,files) values($1,$2,$3,$4,$5,$6,$7)`,
        [n.id, p.id, dnull(n.date) || dnull(new Date().toISOString()), n.note || '', (n as any).username || '', (n as any).ts || null, JSON.stringify(Array.isArray((n as any).files) ? (n as any).files : [])]);
    }
  }

  // contracts (tracking records; project_id only kept if the project exists)
  for (const ct of (state as any).contracts || []) {
    const link = ct.projectId && projectIds.has(ct.projectId) ? ct.projectId : null;
    await client.query(
      `insert into contracts(id,project_id,property_code,output_filename,owner_entity,contractor,total,effective_date,term_end,scope,file_key,created_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [ct.id, link, ct.property, ct.outputFilename || '', ct.ownerEntity || '', ct.contractor || '', nnull(ct.total), dnull(ct.effectiveDate), dnull(ct.termEnd), ct.scope || '', ct.fileKey || null, dnull(ct.createdAt) || dnull(ct.effectiveDate) || new Date().toISOString().slice(0, 10)]
    );
  }

  // cash snapshots
  for (const code of Object.keys(state.cash || {})) {
    const c = state.cash[code];
    await client.query(
      `insert into cash_snapshots(property_code,as_of_date,cash,adj_cash,sp_budget,sp_spent,sp_remaining,
         noi,ds,dcr,market_value,loan_amount,ltv,loan_due,loan_rate,io_end,capital,return_earned,return_sent)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       on conflict (property_code) do update set as_of_date=excluded.as_of_date, cash=excluded.cash`,
      [code, dnull(c.asOfDate), nnull(c.cash), nnull(c.adjCash), nnull(c.spBudget), nnull(c.spSpent), nnull(c.spRemaining),
       nnull(c.noi), nnull(c.ds), nnull(c.dcr), nnull(c.marketValue), nnull(c.loanAmount), nnull(c.ltv), c.loanDue || '', nnull(c.loanRate), c.ioEnd || '',
       nnull((c as any).capital), nnull((c as any).returnEarned), nnull((c as any).returnSent)]
    );
  }

  // cash adjustments
  for (const a of state.cashAdjustments || []) {
    await client.query(`insert into cash_adjustments(id,property_code,date,amount,note) values($1,$2,$3,$4,$5)`,
      [a.id, a.property, dnull(a.date), Number(a.amount) || 0, a.note || '']);
  }

  // gl lines — drop links to projects that no longer exist (e.g. purged SP-COMPLETE archive)
  for (const g of state.gl || []) {
    const link = g.linkedProjectId && projectIds.has(g.linkedProjectId) ? g.linkedProjectId : null;
    await client.query(
      `insert into gl_lines(id,property_code,account,category,date,vendor,control,amount,remarks,linked_project_id,partial)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [g.id, g.property, g.account || null, g.category || null, dnull(g.date), g.vendor || null, g.control || null,
       Number(g.amount) || 0, g.remarks || null, link, !!g.partial]
    );
  }

  // meta (single row)
  const m = state.meta || {};
  await client.query(
    `insert into app_meta(id,gl_period,cash_as_of,version) values(1,$1,$2,$3)
     on conflict (id) do update set gl_period=excluded.gl_period, cash_as_of=excluded.cash_as_of, version=excluded.version`,
    [m.glPeriod || '', dnull(m.cashAsOf), m.version || 1]
  );
  if (m.appTitle) await client.query('update app_meta set app_title=$1 where id=1', [m.appTitle]).catch(() => { /* pre-migration DB */ });
}

async function run() {
  const raw = JSON.parse(readFileSync(SEED_PATH, 'utf8')) as AppState;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await loadStateInto(client, raw);
    await client.query('COMMIT');
    console.log(`Seeded: ${raw.properties.length} properties, ${raw.projects.length} projects, ${raw.gl.length} GL lines, ${Object.keys(raw.cash).length} cash snapshots.`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run only when invoked directly (not when imported by the reset endpoint).
if (process.argv[1] && process.argv[1].endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
