import { readFileSync } from 'node:fs';
import { pool, query } from './db.js';
import { loadStateInto, SEED_PATH } from './seed.js';
import type { AppState } from '../shared/domain.js';

const nnull = (v: any): number | null => (v == null || v === '' || isNaN(Number(v)) ? null : Number(v));
const dnull = (v: any): string | null => {
  if (v == null || v === '') return null;
  const raw = String(v).trim();
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // M/D/YY[YY] -> YYYY-MM-DD
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`; }
  const s = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

/**
 * On startup (after migrations):
 *  - If the database is empty (no properties), load the full seed.
 *  - Otherwise, top up reference data that may be missing on an already-seeded DB:
 *    the contract records and per-property owner entities (idempotent; never overwrites
 *    live data — owner entity is only set when blank, contracts only when none exist).
 */
export async function seedIfEmpty(): Promise<void> {
  const raw = JSON.parse(readFileSync(SEED_PATH, 'utf8')) as AppState & { contracts?: any[] };
  const propCount = (await query<{ n: number }>('select count(*)::int as n from properties')).rows[0]?.n ?? 0;

  if (propCount === 0) {
    console.log('seed: empty database — loading full seed/initial-data.json');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await loadStateInto(client, raw);
      await client.query('COMMIT');
      console.log(`seeded: ${raw.properties.length} properties, ${raw.projects.length} projects, ${(raw.contracts || []).length} contracts`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return;
  }

  // Already seeded — top up owner entities (only where blank) and contracts (only if none).
  for (const p of raw.properties || []) {
    const oe = (p as any).ownerEntity;
    if (oe) await query(`update properties set owner_entity=$1 where code=$2 and coalesce(owner_entity,'')=''`, [oe, p.code]);
    await query(`update properties set contract_code=$1 where code=$2 and coalesce(contract_code,'')=''`, [(p as any).contractCode || p.code, p.code]);
  }
  const cCount = (await query<{ n: number }>('select count(*)::int as n from contracts')).rows[0]?.n ?? 0;
  if (cCount === 0 && (raw.contracts || []).length) {
    const projIds = new Set((await query<{ id: string }>('select id from projects')).rows.map((r) => r.id));
    for (const ct of raw.contracts!) {
      const link = ct.projectId && projIds.has(ct.projectId) ? ct.projectId : null;
      await query(
        `insert into contracts(id,project_id,property_code,output_filename,owner_entity,contractor,total,effective_date,term_end,scope,file_key,created_at)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict (id) do nothing`,
        [ct.id, link, ct.property, ct.outputFilename || '', ct.ownerEntity || '', ct.contractor || '', nnull(ct.total), dnull(ct.effectiveDate), dnull(ct.termEnd), ct.scope || '', ct.fileKey || null, dnull(ct.createdAt) || dnull(ct.effectiveDate) || new Date().toISOString().slice(0, 10)]
      );
    }
    console.log(`seed top-up: inserted ${raw.contracts!.length} contract records`);
  } else {
    console.log(`seed: ${propCount} properties, ${cCount} contracts already present — no top-up needed`);
  }
}

// CLI entrypoint
if (process.argv[1] && (process.argv[1].endsWith('seed-if-empty.ts') || process.argv[1].endsWith('seed-if-empty.js'))) {
  seedIfEmpty().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
}
