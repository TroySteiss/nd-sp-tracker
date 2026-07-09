import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type pg from 'pg';
import { pool, query, tx, assembleState, rowToProject, propLookup } from './db.js';
import { loadStateInto } from './seed.js';
import { parseGL, parseCushion } from './importers.js';
import { buildContract, type ContractVars, type BidAttachment } from './contract.js';
import { applyCostRules, uid, STEP_KEYS, CONTRACT_STEPS, COLOR_PALETTE, type Project, type AppState } from '../shared/domain.js';

export const api = Router();

// Express 4 does not catch errors thrown in async handlers — an uncaught one
// becomes an unhandled rejection and kills the whole process. Wrap every
// handler registered on this router so errors flow to the JSON error middleware.
for (const m of ['get', 'post', 'patch', 'put', 'delete'] as const) {
  const orig = (api as any)[m].bind(api);
  (api as any)[m] = (path: any, ...handlers: any[]) => orig(path, ...handlers.map((h: any) =>
    typeof h === 'function' && h.length < 4
      ? (req: Request, res: Response, next: (e?: any) => void) => Promise.resolve(h(req, res, next)).catch(next)
      : h));
}

const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Files are stored in Postgres (so they persist across redeploys with no volume).
async function storeFile(name: string, mime: string, buffer: Buffer): Promise<string> {
  const key = `${randomUUID()}${extname(name) || ''}`;
  await query('insert into files(key,name,mime,size,bytes) values($1,$2,$3,$4,$5)', [key, name, mime || 'application/octet-stream', buffer.length, buffer]);
  return key;
}
async function readFile(key: string): Promise<{ name: string; mime: string; bytes: Buffer } | null> {
  const r = await query<{ name: string; mime: string; bytes: Buffer }>('select name,mime,bytes from files where key=$1', [key]);
  return r.rows[0] || null;
}

/* ---------- change log (who did what, when) ---------- */
interface LogEntry { action: string; entityType?: string; entityId?: string; property?: string; summary: string; details?: any; }
/** Fire-and-forget: a change-log failure must never fail the request. */
function logChange(req: Request, e: LogEntry): void {
  const user = (req.session as any)?.username || 'unknown';
  query(
    'insert into change_log(id,username,action,entity_type,entity_id,property_code,summary,details) values($1,$2,$3,$4,$5,$6,$7,$8)',
    [uid('L') + Date.now().toString(36), user, e.action, e.entityType || '', e.entityId || '', e.property || '', e.summary, e.details != null ? JSON.stringify(e.details) : null]
  ).catch((err) => console.error('change_log insert failed:', err?.message || err));
}

api.get('/changelog', async (req, res) => {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
  const conds: string[] = []; const params: any[] = [];
  if (req.query.before) { params.push(String(req.query.before)); conds.push(`ts < $${params.length}`); }
  if (req.query.user) { params.push(String(req.query.user)); conds.push(`username = $${params.length}`); }
  if (req.query.property) { params.push(String(req.query.property)); conds.push(`property_code = $${params.length}`); }
  const where = conds.length ? 'where ' + conds.join(' and ') : '';
  const r = await query(`select * from change_log ${where} order by ts desc limit ${limit}`, params);
  res.json(r.rows.map((c) => ({ id: c.id, ts: c.ts instanceof Date ? c.ts.toISOString() : c.ts, username: c.username, action: c.action, entityType: c.entity_type, entityId: c.entity_id, property: c.property_code, summary: c.summary, details: c.details })));
});

const nnull = (v: any): number | null => (v == null || v === '' || isNaN(Number(v)) ? null : Number(v));
const dnull = (v: any): string | null => {
  if (v == null || v === '') return null;
  const raw = String(v).trim();
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // M/D/YY[YY] -> YYYY-MM-DD
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`; }
  const s = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

/* ---------- bootstrap ---------- */
api.get('/state', async (_req, res) => { res.json(await assembleState()); });

/* ---------- projects ---------- */
async function writeProject(client: pg.PoolClient, p: Project, isNew: boolean): Promise<void> {
  // Server recomputes derived rules: cost→planned tick + no-contract auto-default (spec §10.4).
  applyCostRules(p);
  const cols = [
    p.property, p.category || 'GENERAL', p.name || '(untitled)', p.description || '', p.plan || '', p.actionItem || '',
    p.contractor || '', nnull(p.anticipatedCost), nnull(p.actualCost), dnull(p.dateAdded), dnull(p.plannedStart), dnull(p.plannedEnd),
    JSON.stringify(p.steps || {}), p.notes || '', !!p.onHold, !!p.pinned, !!p.inHouse, p.ihUnit === 'quantity' ? 'quantity' : 'budget',
    nnull(p.totalToComplete), nnull(p.amountCompleted), !!p.noContract, !!p.noContractSet, !!p.commitCash,
  ];
  if (isNew) {
    await client.query(
      `insert into projects(property_code,category,name,description,plan,action_item,contractor,anticipated_cost,actual_cost,
         date_added,planned_start,planned_end,steps,notes,on_hold,pinned,in_house,ih_unit,total_to_complete,amount_completed,
         no_contract,no_contract_set,commit_cash,id)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [...cols, p.id]
    );
  } else {
    await client.query(
      `update projects set property_code=$1,category=$2,name=$3,description=$4,plan=$5,action_item=$6,contractor=$7,
         anticipated_cost=$8,actual_cost=$9,date_added=$10,planned_start=$11,planned_end=$12,steps=$13,notes=$14,on_hold=$15,
         pinned=$16,in_house=$17,ih_unit=$18,total_to_complete=$19,amount_completed=$20,no_contract=$21,no_contract_set=$22,commit_cash=$23,
         updated_at=now() where id=$24`,
      [...cols, p.id]
    );
  }
  // sync bids + progress notes (record-level)
  await client.query('delete from bids where project_id=$1', [p.id]);
  let slot = 0;
  for (const b of p.bids || []) {
    const files = Array.isArray(b.files) && b.files.length ? b.files : (b.fileKey ? [{ fileKey: b.fileKey, fileName: b.fileName, fileSize: b.fileSize }] : []);
    const f0 = files[0] || {};
    await client.query(
      `insert into bids(id,project_id,slot,contractor,amount,approved,file_key,file_name,file_size,files) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [b.id || `${p.id}-b${slot}`, p.id, slot, b.contractor || '', nnull(b.amount), !!b.approved, f0.fileKey || null, f0.fileName || null, f0.fileSize || null, JSON.stringify(files)]
    );
    slot++;
  }
  await client.query('delete from progress_notes where project_id=$1', [p.id]);
  for (const n of p.progressNotes || []) {
    await client.query('insert into progress_notes(id,project_id,date,note,username,ts,files) values($1,$2,$3,$4,$5,$6,$7)',
      [n.id || uid('N'), p.id, dnull(n.date), n.note || '', n.username || '', n.ts || null, JSON.stringify(Array.isArray(n.files) ? n.files : [])]);
  }
}

/** New notes arriving without an author get stamped with the session user + now. */
function stampNotes(req: Request, p: Project): void {
  for (const n of p.progressNotes || []) {
    if (!n.username) n.username = (req.session as any)?.username || '';
    if (!n.ts) n.ts = new Date().toISOString();
  }
}

/* Human-readable field-level diff between the stored project row and the incoming write. */
const fmtMoney = (v: any) => (v == null || v === '' ? '—' : '$' + Number(v).toLocaleString('en-US'));
const fmtStr = (v: any) => (v == null || String(v).trim() === '' ? '—' : String(v));
const isoD = (v: any): string => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? '' : String(v).slice(0, 10));
const STEP_LABELS: Record<string, string> = { planned: 'Planned', gotBids: 'Bids Received', approved: 'Bid Approved', contractGenerated: 'Contract Generated', signed: 'Signed', workStarted: 'Work Started', workCompleted: 'Work Completed', paid: 'Paid', completed: 'Completed', lienWaiver: 'Lien Waiver' };
function projectDiff(old: any, p: Project): string[] {
  const out: string[] = [];
  const cmp = (label: string, a: any, b: any, f: (x: any) => string = fmtStr) => { const fa = f(a), fb = f(b); if (fa !== fb) out.push(`${label} ${fa} → ${fb}`); };
  cmp('property', old.property_code, p.property);
  cmp('name', old.name, p.name);
  cmp('category', old.category, p.category || 'GENERAL');
  cmp('contractor', old.contractor, p.contractor || '');
  cmp('anticipated cost', old.anticipated_cost, nnull(p.anticipatedCost), fmtMoney);
  cmp('actual cost', old.actual_cost, nnull(p.actualCost), fmtMoney);
  cmp('planned start', isoD(old.planned_start), dnull(p.plannedStart) || '');
  cmp('planned end', isoD(old.planned_end), dnull(p.plannedEnd) || '');
  cmp('total to complete', old.total_to_complete, nnull(p.totalToComplete), fmtMoney);
  cmp('completed to date', old.amount_completed, nnull(p.amountCompleted), fmtMoney);
  if (!!old.on_hold !== !!p.onHold) out.push(p.onHold ? 'put on hold' : 'taken off hold');
  if (!!old.pinned !== !!p.pinned) out.push(p.pinned ? 'pinned' : 'unpinned');
  if (!!old.in_house !== !!p.inHouse) out.push(p.inHouse ? 'marked in-house' : 'no longer in-house');
  if (!!old.no_contract !== !!p.noContract) out.push(p.noContract ? 'marked no-contract' : 'contract required');
  if (!!old.commit_cash !== !!p.commitCash) out.push(p.commitCash ? 'cash committed pre-approval' : 'cash commitment removed');
  const oldSteps = old.steps || {}, newSteps = p.steps || {};
  const ticked = STEP_KEYS.filter((k) => !oldSteps[k] && newSteps[k]).map((k) => STEP_LABELS[k] || k);
  const unticked = STEP_KEYS.filter((k) => oldSteps[k] && !newSteps[k]).map((k) => STEP_LABELS[k] || k);
  if (ticked.length) out.push(`step${ticked.length > 1 ? 's' : ''} ticked: ${ticked.join(', ')}`);
  if (unticked.length) out.push(`step${unticked.length > 1 ? 's' : ''} cleared: ${unticked.join(', ')}`);
  if ((old.description || '') !== (p.description || '')) out.push('description edited');
  if ((old.plan || '') !== (p.plan || '')) out.push('plan edited');
  if ((old.action_item || '') !== (p.actionItem || '')) out.push('action item edited');
  if ((old.notes || '') !== (p.notes || '')) out.push('notes edited');
  return out;
}

api.post('/projects', async (req, res) => {
  const p = req.body as Project;
  if (!p || !p.property || !p.name) return res.status(400).json({ error: 'property and name are required' });
  p.id = p.id || uid('P');
  p.dateAdded = p.dateAdded || new Date().toISOString().slice(0, 10);
  stampNotes(req, p);
  await tx((c) => writeProject(c, p, true));
  logChange(req, { action: 'project.create', entityType: 'project', entityId: p.id, property: p.property, summary: `Project "${p.name}" created${p.anticipatedCost != null ? ` (${fmtMoney(p.anticipatedCost)})` : ''}` });
  const r = await query('select * from projects where id=$1', [p.id]);
  res.json(rowToProject(r.rows[0], p.bids || [], p.progressNotes || [], await propLookup()));
});

api.patch('/projects/:id', async (req, res) => {
  const existing = await query('select * from projects where id=$1', [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ error: 'not found' });
  const p = { ...(req.body as Project), id: req.params.id };
  if (!p.property || !p.name) return res.status(400).json({ error: 'property and name are required' });
  const oldNoteCount = (await query('select count(*)::int as n from progress_notes where project_id=$1', [p.id])).rows[0]?.n ?? 0;
  const oldBids = (await query('select contractor, amount, approved from bids where project_id=$1 order by slot', [p.id])).rows
    .map((b) => ({ contractor: b.contractor || '', amount: b.amount == null ? null : Number(b.amount), approved: !!b.approved }));
  stampNotes(req, p);
  await tx((c) => writeProject(c, p, false));
  const changes = projectDiff(existing.rows[0], p);   // p.steps reflects post-write rules (applyCostRules mutates)
  const newBids = (p.bids || []).map((b) => ({ contractor: b.contractor || '', amount: nnull(b.amount), approved: !!b.approved }));
  if (JSON.stringify(oldBids) !== JSON.stringify(newBids)) changes.push('bids updated');
  const newNoteCount = (p.progressNotes || []).length;
  if (newNoteCount > oldNoteCount) changes.push(`progress note added`);
  if (changes.length) logChange(req, { action: 'project.update', entityType: 'project', entityId: p.id, property: p.property, summary: `Project "${p.name}": ${changes.join('; ')}` });
  const r = await query('select * from projects where id=$1', [p.id]);
  res.json(rowToProject(r.rows[0], p.bids || [], p.progressNotes || [], await propLookup()));
});

api.delete('/projects/:id', async (req, res) => {
  const old = (await query('select name, property_code from projects where id=$1', [req.params.id])).rows[0];
  await query('delete from projects where id=$1', [req.params.id]);
  if (old) logChange(req, { action: 'project.delete', entityType: 'project', entityId: req.params.id, property: old.property_code, summary: `Project "${old.name}" deleted` });
  res.json({ ok: true });
});

/* ---------- bid file upload / download (stored in Postgres) ---------- */
api.post('/projects/:id/bids/:slot/file', memUpload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'no file' });
  const key = await storeFile(f.originalname, f.mimetype, f.buffer);
  const proj = (await query('select name, property_code from projects where id=$1', [req.params.id])).rows[0];
  if (proj) logChange(req, { action: 'bid.file', entityType: 'project', entityId: req.params.id, property: proj.property_code, summary: `Bid file "${f.originalname}" uploaded on "${proj.name}"` });
  res.json({ fileKey: key, fileName: f.originalname, fileSize: f.size });
});

/* ---------- note attachment upload (stored like bid files; the note object
   carries the returned fileKey and persists with the project save) ---------- */
api.post('/projects/:id/note-file', memUpload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'no file' });
  const key = await storeFile(f.originalname, f.mimetype, f.buffer);
  res.json({ fileKey: key, fileName: f.originalname, fileSize: f.size });
});

api.get('/bids/file/:key', async (req, res) => {
  const r = await readFile(req.params.key);
  if (!r) return res.status(404).send('not found');
  res.setHeader('Content-Type', r.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', 'inline');
  res.send(r.bytes);
});

// Download a stored file (used for generated contracts). ?name sets the filename.
api.get('/files/:key', async (req, res) => {
  const r = await readFile(req.params.key);
  if (!r) return res.status(404).send('not found');
  const name = String(req.query.name || r.name || 'file').replace(/[^a-zA-Z0-9._ -]/g, '');
  res.setHeader('Content-Type', r.mime || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.send(r.bytes);
});

/* ---------- Generate Independent Contractor Agreement (spec: Contract_Generation_Workflow) ---------- */
const camel = (s: string) => String(s || '').replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
const mmddyyyy = (d: string) => { const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return `${m[2]}${m[3]}${m[1]}`; const s = String(d || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return s ? `${s[1].padStart(2, '0')}${s[2].padStart(2, '0')}${s[3]}` : 'date'; };

api.post('/projects/:id/contract', async (req, res) => {
  const projRow = await query('select * from projects where id=$1', [req.params.id]);
  if (!projRow.rowCount) return res.status(404).json({ error: 'project not found' });
  const proj = projRow.rows[0];
  const b = req.body || {};
  const vars: ContractVars = {
    effectiveDate: b.effectiveDate || '', termEndDate: b.termEndDate || '', ownerEntity: b.ownerEntity || '',
    contractorName: b.contractorName || '', propertyName: b.propertyName || '', propertyAddr: b.propertyAddr || '',
    ownerNoticeAddr: b.ownerNoticeAddr || b.propertyAddr || '', contractorAddr: b.contractorAddr || '', contractTotal: b.contractTotal || '',
  };
  if (!vars.ownerEntity || !vars.contractorName || !vars.contractTotal) return res.status(400).json({ error: 'ownerEntity, contractorName and contractTotal are required' });

  // Gather bid attachments for this project (approved first), reading files from storage.
  // Each bid may carry multiple files in upload order: first = scope/contract totals, rest = supporting docs.
  const bidsRows = (await query('select * from bids where project_id=$1 order by approved desc, slot asc', [proj.id])).rows;
  const attachments: BidAttachment[] = [];
  for (const bd of bidsRows) {
    const files = Array.isArray(bd.files) && bd.files.length ? bd.files : (bd.file_key ? [{ fileKey: bd.file_key, fileName: bd.file_name }] : []);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f || !f.fileKey) continue;
      const fr = await readFile(f.fileKey);
      if (fr) attachments.push({ buffer: fr.bytes, name: f.fileName || f.fileKey, label: files.length > 1 ? (i === 0 ? 'Applicable Scope & Contract Totals' : 'Supporting document') : undefined });
    }
  }

  let pdf: Uint8Array;
  try { pdf = await buildContract(vars, attachments); }
  catch (e: any) { return res.status(500).json({ error: 'contract build failed: ' + (e?.message || e) }); }

  // Filename: [CONTRACT_CODE]_[Unit?]_[ContractorCamel]_[MMDDYYYY]_Unexecuted.pdf
  const propRow = (await query('select contract_code from properties where code=$1', [proj.property_code])).rows[0];
  const code = (propRow?.contract_code || proj.property_code);
  const unit = b.unit ? `Unit${String(b.unit).replace(/[^0-9A-Za-z]/g, '')}_` : '';
  const fileName = `${code}_${unit}${camel(vars.contractorName)}_${mmddyyyy(vars.effectiveDate)}_Unexecuted.pdf`;
  const fileKey = await storeFile(fileName, 'application/pdf', Buffer.from(pdf));
  const total = nnull(String(vars.contractTotal).replace(/[^0-9.\-]/g, ''));

  await tx(async (c) => {
    // attach the contract to the project
    let steps = proj.steps || {};
    if (b.tickStep !== false) {
      steps = { ...steps, contractGenerated: true };
      // cascade up: completing a post-approval step implies earlier non-N/A steps
      const noContract = !!proj.no_contract;
      STEP_KEYS.slice(0, STEP_KEYS.indexOf('contractGenerated')).forEach((k) => {
        if (!(noContract && CONTRACT_STEPS.includes(k))) steps[k] = true;
      });
    }
    await c.query('update projects set contract_file_key=$1, contract_file_name=$2, steps=$3, updated_at=now() where id=$4',
      [fileKey, fileName, JSON.stringify(steps), proj.id]);
    // record the contract in the contracts table
    await c.query(
      `insert into contracts(id,project_id,property_code,output_filename,owner_entity,contractor,total,effective_date,term_end,scope,file_key)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [uid('C'), proj.id, proj.property_code, fileName, vars.ownerEntity, vars.contractorName, total, dnull(vars.effectiveDate), dnull(vars.termEndDate), b.scope || proj.name || '', fileKey]
    );
    // remember legal fields on the property for next time
    if (b.rememberProperty !== false) {
      await c.query('update properties set owner_entity=$1, address=$2, owner_notice_addr=$3 where code=$4',
        [vars.ownerEntity, vars.propertyAddr, vars.ownerNoticeAddr, proj.property_code]);
    }
    // remember the contractor's address in the directory so it pre-fills next time
    if (vars.contractorName && vars.contractorAddr && vars.contractorAddr.trim()) {
      await c.query(
        `insert into contractors(id,name,address) values($1,$2,$3)
         on conflict(name) do update set address=case when excluded.address<>'' then excluded.address else contractors.address end`,
        [uid('CTR'), vars.contractorName.trim(), vars.contractorAddr.trim()]
      );
    }
  });

  logChange(req, { action: 'contract.generate', entityType: 'project', entityId: proj.id, property: proj.property_code, summary: `Contract generated for "${proj.name}" — ${vars.contractorName}, ${vars.contractTotal} (${fileName})` });
  res.json({ contractFileKey: fileKey, contractFileName: fileName, downloadUrl: `/api/files/${fileKey}?name=${encodeURIComponent(fileName)}` });
});

/* ---------- cash snapshot (mid-month edit) ---------- */
api.patch('/cash/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const c = req.body || {};
  const old = (await query('select * from cash_snapshots where property_code=$1', [code])).rows[0] || {};
  await query(
    `insert into cash_snapshots(property_code,as_of_date,cash,adj_cash,sp_budget,sp_spent,sp_remaining,noi,ds,dcr,market_value,loan_amount,ltv,loan_due,loan_rate,io_end)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     on conflict (property_code) do update set as_of_date=excluded.as_of_date,cash=excluded.cash,adj_cash=excluded.adj_cash,
       sp_budget=excluded.sp_budget,sp_spent=excluded.sp_spent,sp_remaining=excluded.sp_remaining,noi=excluded.noi,ds=excluded.ds,
       dcr=excluded.dcr,market_value=excluded.market_value,loan_amount=excluded.loan_amount,ltv=excluded.ltv,loan_due=excluded.loan_due,
       loan_rate=excluded.loan_rate,io_end=excluded.io_end`,
    [code, dnull(c.asOfDate), nnull(c.cash), nnull(c.adjCash), nnull(c.spBudget), nnull(c.spSpent), nnull(c.spRemaining),
     nnull(c.noi), nnull(c.ds), nnull(c.dcr), nnull(c.marketValue), nnull(c.loanAmount), nnull(c.ltv), c.loanDue || '', nnull(c.loanRate), c.ioEnd || '']
  );
  const diffs: string[] = [];
  const cmpN = (label: string, a: any, b: any) => { const na = a == null ? null : Number(a), nb = b == null ? null : Number(b); if (na !== nb) diffs.push(`${label} ${fmtMoney(na)} → ${fmtMoney(nb)}`); };
  cmpN('cash', old.cash, nnull(c.cash)); cmpN('adj cash', old.adj_cash, nnull(c.adjCash)); cmpN('SP budget', old.sp_budget, nnull(c.spBudget));
  cmpN('SP spent', old.sp_spent, nnull(c.spSpent)); cmpN('NOI', old.noi, nnull(c.noi)); cmpN('market value', old.market_value, nnull(c.marketValue));
  cmpN('loan amount', old.loan_amount, nnull(c.loanAmount));
  logChange(req, { action: 'cash.edit', entityType: 'cash', entityId: code, property: code, summary: `Cash snapshot edited${diffs.length ? ': ' + diffs.join('; ') : ''}` });
  res.json({ ok: true });
});

/* ---------- cash adjustments (mid-month deltas, preserved across imports) ---------- */
api.post('/cash-adjustments', async (req, res) => {
  const a = req.body || {};
  if (!a.property || a.amount == null) return res.status(400).json({ error: 'property and amount required' });
  const id = uid('A');
  await query('insert into cash_adjustments(id,property_code,date,amount,note) values($1,$2,$3,$4,$5)',
    [id, a.property, dnull(a.date) || new Date().toISOString().slice(0, 10), Number(a.amount) || 0, a.note || '']);
  logChange(req, { action: 'cash.adjustment.add', entityType: 'cash_adjustment', entityId: id, property: a.property, summary: `Cash adjustment ${fmtMoney(Number(a.amount) || 0)} added${a.note ? ` — ${a.note}` : ''}` });
  res.json({ id, property: a.property, date: dnull(a.date), amount: Number(a.amount) || 0, note: a.note || '' });
});
api.delete('/cash-adjustments/:id', async (req, res) => {
  const old = (await query('select property_code, amount, note from cash_adjustments where id=$1', [req.params.id])).rows[0];
  await query('delete from cash_adjustments where id=$1', [req.params.id]);
  if (old) logChange(req, { action: 'cash.adjustment.remove', entityType: 'cash_adjustment', entityId: req.params.id, property: old.property_code, summary: `Cash adjustment ${fmtMoney(old.amount)} removed${old.note ? ` — ${old.note}` : ''}` });
  res.json({ ok: true });
});

/* ---------- update-email recipients + greeting override (per property) ---------- */
api.patch('/properties/:code/recipients', async (req, res) => {
  const b = req.body || {};
  const code = req.params.code.toUpperCase();
  await query('update properties set update_to=$1, update_cc=$2, update_greeting=$3, update_enabled=$4, update_include_discussed=$5 where code=$6',
    [String(b.updateTo || ''), String(b.updateCc || ''), String(b.updateGreeting || ''), b.updateEnabled !== false, b.updateIncludeDiscussed === true, code]);
  logChange(req, { action: 'property.recipients', entityType: 'property', entityId: code, property: code, summary: 'Update-email settings changed (recipients / greeting / include flags)' });
  res.json({ ok: true });
});

/* ---------- property settings (editable accretion % + avg monthly interest) ---------- */
api.patch('/properties/:code/settings', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const b = req.body || {};
  await query(
    'update properties set accretion_pct=$1, avg_monthly_interest=$2, include_accretion_in_proj=$3, include_returns_in_proj=$4, distribution_quarters=$5::jsonb where code=$6',
    [nnull(b.accretionPct), nnull(b.avgMonthlyInterest) ?? 0,
     b.includeAccretionInProj !== false,
     b.includeReturnsInProj !== false,
     JSON.stringify(b.distributionQuarters || {}),
     code]);
  logChange(req, { action: 'property.settings', entityType: 'property', entityId: code, property: code, summary: 'Projection settings changed (accretion / interest / distributions)' });
  res.json({ ok: true });
});

/* ---------- GL link / partial ---------- */
api.patch('/gl/:id/link', async (req, res) => {
  const { linkedProjectId, partial } = req.body || {};
  await query('update gl_lines set linked_project_id=$1, partial=$2 where id=$3',
    [linkedProjectId || null, !!partial, req.params.id]);
  const g = (await query('select property_code, vendor, amount from gl_lines where id=$1', [req.params.id])).rows[0];
  if (g) {
    const pName = linkedProjectId ? (await query('select name from projects where id=$1', [linkedProjectId])).rows[0]?.name : null;
    logChange(req, { action: 'gl.link', entityType: 'gl_line', entityId: req.params.id, property: g.property_code, summary: linkedProjectId ? `GL line ${fmtMoney(g.amount)} (${g.vendor || 'no vendor'}) linked to "${pName || linkedProjectId}"${partial ? ' (partial)' : ''}` : `GL line ${fmtMoney(g.amount)} (${g.vendor || 'no vendor'}) unlinked` });
  }
  res.json({ ok: true });
});

/* ---------- imports: preview + confirm (server-side parse, spec §8/§10.4) ----------
   The raw workbook is kept with the confirmed import (files + imports tables) and
   ALL property rows are stored — including codes not configured yet — so a file
   never needs re-uploading when a property/region is added later. */
interface Pending { kind: 'gl' | 'cushion'; data: any; file?: { name: string; mime: string; buffer: Buffer }; ts: number; }
const pending = new Map<string, Pending>();
function stash(kind: 'gl' | 'cushion', data: any, file?: Pending['file']): string {
  const token = randomUUID();
  pending.set(token, { kind, data, file, ts: Date.now() });
  // expire entries older than 30 min
  for (const [k, v] of pending) if (Date.now() - v.ts > 30 * 60 * 1000) pending.delete(k);
  return token;
}
async function knownCodes(): Promise<string[]> {
  return (await query<{ code: string }>('select code from properties')).rows.map((r) => r.code);
}
async function recordImport(req: Request, kind: 'gl' | 'cushion', file: Pending['file'] | undefined, label: string, count: number, byProperty: Record<string, any>): Promise<void> {
  let fileKey: string | null = null;
  if (file) fileKey = await storeFile(file.name, file.mime, file.buffer);
  await query('insert into imports(id,kind,file_key,file_name,label,count,by_property,username) values($1,$2,$3,$4,$5,$6,$7,$8)',
    [uid('I') + Date.now().toString(36), kind, fileKey, file?.name || '', label, count, JSON.stringify(byProperty), (req.session as any)?.username || 'unknown']);
}

api.get('/imports', async (_req, res) => {
  const r = await query('select * from imports order by created_at desc limit 50');
  res.json(r.rows.map((i) => ({ id: i.id, kind: i.kind, fileKey: i.file_key, fileName: i.file_name, label: i.label, count: i.count, byProperty: i.by_property || {}, username: i.username, createdAt: i.created_at instanceof Date ? i.created_at.toISOString() : i.created_at })));
});

api.post('/import/gl', memUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const known = await knownCodes();
    const { tx, period, byProperty, unknownCodes } = parseGL(req.file.buffer, known);
    if (!tx.length) return res.status(400).json({ error: 'No SP ledger lines found — check the file format.' });
    const token = stash('gl', { tx, period, byProperty, unknownCodes }, { name: req.file.originalname, mime: req.file.mimetype, buffer: req.file.buffer });
    res.json({ token, count: tx.length, period, byProperty, unknownCodes });
  } catch (e: any) { res.status(400).json({ error: e.message || 'parse error' }); }
});

api.post('/import/gl/confirm', async (req, res) => {
  const p = pending.get(req.body?.token);
  if (!p || p.kind !== 'gl') return res.status(400).json({ error: 'preview expired — re-upload' });
  const { tx: lines, period, byProperty, unknownCodes } = p.data as { tx: any[]; period: string | null; byProperty: Record<string, number>; unknownCodes: string[] };
  const codes = [...new Set(lines.map((g: any) => g.property))];
  await tx(async (c) => {
    // Preserve GL→project links across re-imports: carry a line's link forward when
    // an identical line (property, control #, date, amount) appears in the new file.
    const linked = (await c.query(
      'select property_code, control, date, amount, linked_project_id, partial from gl_lines where property_code = any($1) and linked_project_id is not null', [codes])).rows;
    const keyOf = (prop: string, control: any, date: any, amount: any) =>
      `${prop}|${String(control || '')}|${(date instanceof Date ? date.toISOString().slice(0, 10) : String(date || '').slice(0, 10))}|${Number(amount) || 0}`;
    const carry = new Map<string, { linkedProjectId: string; partial: boolean }[]>();
    for (const r of linked) {
      const k = keyOf(r.property_code, r.control, r.date, r.amount);
      (carry.get(k) || carry.set(k, []).get(k)!).push({ linkedProjectId: r.linked_project_id, partial: !!r.partial });
    }
    // Replace only the properties present in this file; other regions' data stays.
    await c.query('delete from gl_lines where property_code = any($1)', [codes]);
    for (const g of lines) {
      const link = carry.get(keyOf(g.property, g.control, dnull(g.date), Number(g.amount) || 0))?.shift();
      await c.query(
        `insert into gl_lines(id,property_code,account,category,date,vendor,control,amount,remarks,linked_project_id,partial)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [g.id, g.property, g.account || null, g.category || null, dnull(g.date), g.vendor || null, g.control || null, Number(g.amount) || 0, g.remarks || null, link?.linkedProjectId || null, !!link?.partial]
      );
    }
    if (period) await c.query('update app_meta set gl_period=$1 where id=1', [period]);
  });
  await recordImport(req, 'gl', p.file, period || '', lines.length, byProperty);
  logChange(req, { action: 'import.gl', entityType: 'import', summary: `GL imported — ${lines.length} lines across ${codes.length} properties${period ? ` (${period})` : ''}${unknownCodes?.length ? `; kept for future properties: ${unknownCodes.join(', ')}` : ''}` });
  pending.delete(req.body.token);
  res.json({ ok: true, count: lines.length });
});

api.post('/import/cushion', memUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const metaRow = await query('select cash_as_of from app_meta where id=1');
    const fallback = metaRow.rows[0]?.cash_as_of ? new Date(metaRow.rows[0].cash_as_of).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const known = await knownCodes();
    const { found, asOf, unknownCodes } = parseCushion(req.file.buffer, fallback, known);
    const token = stash('cushion', { found, asOf, unknownCodes }, { name: req.file.originalname, mime: req.file.mimetype, buffer: req.file.buffer });
    res.json({ token, count: Object.keys(found).length, asOf, found, unknownCodes });
  } catch (e: any) { res.status(400).json({ error: e.message || 'parse error' }); }
});

api.post('/import/cushion/confirm', async (req, res) => {
  const p = pending.get(req.body?.token);
  if (!p || p.kind !== 'cushion') return res.status(400).json({ error: 'preview expired — re-upload' });
  const { found, asOf, unknownCodes } = p.data;
  await tx(async (c) => {
    for (const code of Object.keys(found)) {
      const v = found[code];
      // cushion import upserts snapshot + property sp_budget/units; must NOT touch cash_adjustments (spec §8.2)
      await c.query(
        `insert into cash_snapshots(property_code,as_of_date,cash,adj_cash,sp_budget,sp_spent,sp_remaining,noi,ds,dcr,market_value,loan_amount,ltv,loan_due,loan_rate,io_end,capital,return_earned,return_sent,units)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         on conflict (property_code) do update set as_of_date=excluded.as_of_date,cash=excluded.cash,adj_cash=excluded.adj_cash,
           sp_budget=excluded.sp_budget,sp_spent=excluded.sp_spent,sp_remaining=excluded.sp_remaining,noi=excluded.noi,ds=excluded.ds,
           dcr=excluded.dcr,market_value=excluded.market_value,loan_amount=excluded.loan_amount,ltv=excluded.ltv,loan_due=excluded.loan_due,
           loan_rate=excluded.loan_rate,io_end=excluded.io_end,capital=excluded.capital,return_earned=excluded.return_earned,return_sent=excluded.return_sent,units=excluded.units`,
        [code, dnull(asOf), nnull(v.cash), nnull(v.adjCash), nnull(v.spBudget), nnull(v.spSpent), nnull(v.spRemaining),
         nnull(v.noi), nnull(v.ds), nnull(v.dcr), nnull(v.marketValue), nnull(v.loanAmount), nnull(v.ltv), v.loanDue || '', nnull(v.loanRate), v.ioEnd || '',
         nnull(v.capital), nnull(v.returnEarned), nnull(v.returnSent), nnull(v.units)]
      );
      if (v.spBudget != null) await c.query('update properties set sp_budget=$1 where code=$2', [Number(v.spBudget), code]);
      if (v.units != null && v.units) await c.query('update properties set units=$1 where code=$2', [Number(v.units), code]);
    }
    await c.query('update app_meta set cash_as_of=$1 where id=1', [dnull(asOf)]);
  });
  const byProperty: Record<string, number | null> = {};
  for (const code of Object.keys(found)) byProperty[code] = found[code].cash ?? null;
  await recordImport(req, 'cushion', p.file, asOf || '', Object.keys(found).length, byProperty);
  logChange(req, { action: 'import.cushion', entityType: 'import', summary: `Cash cushion imported — ${Object.keys(found).length} properties (as of ${asOf})${unknownCodes?.length ? `; kept for future properties: ${unknownCodes.join(', ')}` : ''}` });
  pending.delete(req.body.token);
  res.json({ ok: true, count: Object.keys(found).length });
});

/* ---------- Externally generated contract upload (fills the "generated" slot) ---------- */
api.post('/projects/:id/contract-file', memUpload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'no file' });
  const projRow = await query('select * from projects where id=$1', [req.params.id]);
  if (!projRow.rowCount) return res.status(404).json({ error: 'not found' });
  const proj = projRow.rows[0];
  const key = await storeFile(f.originalname, f.mimetype, f.buffer);
  // Same cascade as generating in-app: contractGenerated + earlier non-N/A steps.
  const steps: Record<string, boolean> = { ...(proj.steps || {}), contractGenerated: true };
  const noContract = !!proj.no_contract;
  STEP_KEYS.slice(0, STEP_KEYS.indexOf('contractGenerated')).forEach((k) => {
    if (!(noContract && CONTRACT_STEPS.includes(k))) steps[k] = true;
  });
  await query(
    'update projects set contract_file_key=$1, contract_file_name=$2, steps=$3, updated_at=now() where id=$4',
    [key, f.originalname, JSON.stringify(steps), proj.id]
  );
  logChange(req, { action: 'contract.upload', entityType: 'project', entityId: proj.id, property: proj.property_code, summary: `Contract file "${f.originalname}" attached to "${proj.name}"` });
  res.json({ fileKey: key, fileName: f.originalname, steps });
});

/* ---------- Executed contract upload ---------- */
api.post('/projects/:id/executed-contract', memUpload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'no file' });
  const projRow = await query('select * from projects where id=$1', [req.params.id]);
  if (!projRow.rowCount) return res.status(404).json({ error: 'not found' });
  const proj = projRow.rows[0];
  const lwSigned = req.body?.lwSigned === 'true' || req.body?.lwSigned === true;
  const key = await storeFile(f.originalname, f.mimetype, f.buffer);
  let steps = { ...(proj.steps || {}), signed: true };
  if (lwSigned) { steps = { ...steps, lienWaiver: true }; }
  if (lwSigned) {
    // The lien waiver was signed within the executed contract, so that document
    // also fills the lien-waiver slot (keeps the attachment-derived step true).
    await query(
      `update projects set executed_contract_file_key=$1, executed_contract_file_name=$2,
         lien_waiver_file_key=$1, lien_waiver_file_name=$2, steps=$3, updated_at=now() where id=$4`,
      [key, f.originalname, JSON.stringify(steps), proj.id]
    );
  } else {
    await query(
      'update projects set executed_contract_file_key=$1, executed_contract_file_name=$2, steps=$3, updated_at=now() where id=$4',
      [key, f.originalname, JSON.stringify(steps), proj.id]
    );
  }
  logChange(req, { action: 'contract.executed', entityType: 'project', entityId: proj.id, property: proj.property_code, summary: `Executed contract "${f.originalname}" attached to "${proj.name}"${lwSigned ? ' (lien waiver signed within)' : ''}` });
  res.json({ fileKey: key, fileName: f.originalname, steps, lienWaiverFileKey: lwSigned ? key : null, lienWaiverFileName: lwSigned ? f.originalname : null });
});

/* ---------- Lien waiver upload ---------- */
api.post('/projects/:id/lien-waiver', memUpload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'no file' });
  const projRow = await query('select steps, name, property_code from projects where id=$1', [req.params.id]);
  if (!projRow.rowCount) return res.status(404).json({ error: 'not found' });
  const steps = JSON.stringify({ ...(projRow.rows[0].steps || {}), lienWaiver: true });
  const key = await storeFile(f.originalname, f.mimetype, f.buffer);
  await query(
    'update projects set lien_waiver_file_key=$1, lien_waiver_file_name=$2, steps=$3, updated_at=now() where id=$4',
    [key, f.originalname, steps, req.params.id]
  );
  logChange(req, { action: 'contract.lienwaiver', entityType: 'project', entityId: req.params.id, property: projRow.rows[0].property_code, summary: `Lien waiver "${f.originalname}" attached to "${projRow.rows[0].name}"` });
  res.json({ fileKey: key, fileName: f.originalname });
});

/* ---------- Contractor directory ---------- */
import * as XLSX from 'xlsx';

api.get('/contractors', async (_req, res) => {
  const r = await query('select * from contractors order by name');
  res.json(r.rows.map((c) => ({ id: c.id, name: c.name, address: c.address ?? '', phone: c.phone ?? '', email: c.email ?? '', category: c.category ?? '', notes: c.notes ?? '' })));
});

api.post('/contractors', async (req, res) => {
  const b = req.body || {};
  if (!b.name?.trim()) return res.status(400).json({ error: 'name required' });
  const id = uid('CTR');
  await query(
    'insert into contractors(id,name,address,phone,email,category,notes) values($1,$2,$3,$4,$5,$6,$7) on conflict(name) do update set address=excluded.address,phone=excluded.phone,email=excluded.email,category=excluded.category,notes=excluded.notes',
    [id, b.name.trim(), b.address || '', b.phone || '', b.email || '', b.category || '', b.notes || '']
  );
  logChange(req, { action: 'contractor.save', entityType: 'contractor', entityId: id, summary: `Contractor "${b.name.trim()}" added/updated` });
  const r = await query('select * from contractors where name=$1', [b.name.trim()]);
  res.json(r.rows[0]);
});

api.delete('/contractors/:id', async (req, res) => {
  const old = (await query('select name from contractors where id=$1', [req.params.id])).rows[0];
  await query('delete from contractors where id=$1', [req.params.id]);
  if (old) logChange(req, { action: 'contractor.delete', entityType: 'contractor', entityId: req.params.id, summary: `Contractor "${old.name}" deleted` });
  res.json({ ok: true });
});

api.post('/contractors/import', memUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  let wb: any;
  try { wb = XLSX.read(req.file.buffer, { type: 'buffer' }); }
  catch { return res.status(400).json({ error: 'could not parse Excel file' }); }
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  // Find header row: look for a row where col[0] contains 'code' or col[1] contains 'name' (case-insensitive)
  let dataStart = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const r = rows[i];
    if (String(r[1] || '').toLowerCase().includes('name') || String(r[0] || '').toLowerCase().includes('code')) {
      dataStart = i + 1; break;
    }
  }
  const imported: string[] = [];
  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r[1] || '').trim();
    if (!name || name.toLowerCase() === 'name') continue;
    const address = String(r[3] || '').trim();
    const phone = String(r[4] || '').trim();
    const id = uid('CTR');
    await query(
      'insert into contractors(id,name,address,phone) values($1,$2,$3,$4) on conflict(name) do update set address=excluded.address,phone=excluded.phone',
      [id, name, address, phone]
    );
    imported.push(name);
  }
  logChange(req, { action: 'contractor.import', entityType: 'contractor', summary: `Contractor directory imported — ${imported.length} contractors` });
  res.json({ count: imported.length });
});

/* ---------- regions & properties management (Settings view) ---------- */
async function ensureRegion(name: string, client?: pg.PoolClient): Promise<void> {
  const q = client ? client.query.bind(client) : pool.query.bind(pool);
  await q('insert into regions(name,sort) select $1, coalesce(max(sort),0)+1 from regions on conflict (name) do nothing', [name]);
}

api.post('/regions', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'region name required' });
  const exists = await query('select 1 from regions where name=$1', [name]);
  if (exists.rowCount) return res.status(400).json({ error: 'region already exists' });
  await ensureRegion(name);
  logChange(req, { action: 'region.create', entityType: 'region', entityId: name, summary: `Region "${name}" added` });
  res.json({ ok: true, name });
});

api.patch('/regions/:name', async (req, res) => {
  const oldName = req.params.name;
  const b = req.body || {};
  const exists = await query('select * from regions where name=$1', [oldName]);
  if (!exists.rowCount) return res.status(404).json({ error: 'region not found' });
  const newName = b.name != null ? String(b.name).trim() : oldName;
  if (!newName) return res.status(400).json({ error: 'region name required' });
  await tx(async (c) => {
    if (newName !== oldName) {
      await c.query('update regions set name=$1 where name=$2', [newName, oldName]);
      await c.query('update properties set region=$1 where region=$2', [newName, oldName]);
    }
    if (b.sort != null && !isNaN(Number(b.sort))) await c.query('update regions set sort=$1 where name=$2', [Number(b.sort), newName]);
  });
  if (newName !== oldName) logChange(req, { action: 'region.rename', entityType: 'region', entityId: newName, summary: `Region "${oldName}" renamed to "${newName}"` });
  res.json({ ok: true });
});

api.delete('/regions/:name', async (req, res) => {
  const n = (await query('select count(*)::int as n from properties where region=$1', [req.params.name])).rows[0]?.n ?? 0;
  if (n > 0) return res.status(400).json({ error: `region has ${n} propert${n === 1 ? 'y' : 'ies'} — move or delete them first` });
  await query('delete from regions where name=$1', [req.params.name]);
  logChange(req, { action: 'region.delete', entityType: 'region', entityId: req.params.name, summary: `Region "${req.params.name}" deleted` });
  res.json({ ok: true });
});

const PROP_CODE_RE = /^[A-Z0-9]{2,8}$/;
function propFromBody(b: any): Record<string, any> {
  return {
    name: String(b.name || '').trim(), region: String(b.region || '').trim(), manager: String(b.manager || '').trim(),
    color: String(b.color || '').trim(), portfolio: String(b.portfolio || '').trim(),
    contract_code: String(b.contractCode || '').trim(), owner_entity: String(b.ownerEntity || '').trim(),
    address: String(b.address || '').trim(), owner_notice_addr: String(b.ownerNoticeAddr || '').trim(),
    sp_budget: nnull(b.spBudget), units: nnull(b.units),
  };
}

api.post('/properties', async (req, res) => {
  const b = req.body || {};
  const code = String(b.code || '').trim().toUpperCase();
  if (!PROP_CODE_RE.test(code)) return res.status(400).json({ error: 'code must be 2–8 letters/digits' });
  const v = propFromBody(b);
  if (!v.name || !v.region) return res.status(400).json({ error: 'name and region are required' });
  const exists = await query('select 1 from properties where code=$1', [code]);
  if (exists.rowCount) return res.status(400).json({ error: `property ${code} already exists` });
  if (!v.color) {
    const n = (await query('select count(*)::int as n from properties')).rows[0]?.n ?? 0;
    v.color = COLOR_PALETTE[n % COLOR_PALETTE.length];
  }
  // A cushion imported before this property existed may already hold its budget/units.
  const snap = (await query('select sp_budget, units from cash_snapshots where property_code=$1', [code])).rows[0];
  if (v.sp_budget == null && snap?.sp_budget != null) v.sp_budget = Number(snap.sp_budget);
  if (v.units == null && snap?.units != null) v.units = Number(snap.units);
  const glCount = (await query('select count(*)::int as n from gl_lines where property_code=$1', [code])).rows[0]?.n ?? 0;
  await tx(async (c) => {
    await ensureRegion(v.region, c);
    await c.query(
      `insert into properties(code,name,region,manager,color,portfolio,sp_budget,units,owner_entity,address,owner_notice_addr,contract_code)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [code, v.name, v.region, v.manager, v.color, v.portfolio, v.sp_budget ?? 0, v.units ?? 0, v.owner_entity, v.address, v.owner_notice_addr, v.contract_code || code]
    );
  });
  logChange(req, { action: 'property.create', entityType: 'property', entityId: code, property: code, summary: `Property ${code} — "${v.name}" added to ${v.region}${glCount ? ` (${glCount} previously imported GL lines now visible)` : ''}${snap ? ' (cushion snapshot already on file)' : ''}` });
  res.json({ ok: true, code, existingGlLines: glCount, hadSnapshot: !!snap });
});

api.patch('/properties/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const old = (await query('select * from properties where code=$1', [code])).rows[0];
  if (!old) return res.status(404).json({ error: 'property not found' });
  const b = req.body || {};
  const v = propFromBody({ // merge: only overwrite fields present in the body
    name: b.name ?? old.name, region: b.region ?? old.region, manager: b.manager ?? old.manager,
    color: b.color ?? old.color, portfolio: b.portfolio ?? old.portfolio,
    contractCode: b.contractCode ?? old.contract_code, ownerEntity: b.ownerEntity ?? old.owner_entity,
    address: b.address ?? old.address, ownerNoticeAddr: b.ownerNoticeAddr ?? old.owner_notice_addr,
    spBudget: b.spBudget ?? old.sp_budget, units: b.units ?? old.units,
  });
  if (!v.name || !v.region) return res.status(400).json({ error: 'name and region are required' });
  await tx(async (c) => {
    await ensureRegion(v.region, c);
    await c.query(
      `update properties set name=$1, region=$2, manager=$3, color=$4, portfolio=$5, contract_code=$6,
         owner_entity=$7, address=$8, owner_notice_addr=$9, sp_budget=$10, units=$11 where code=$12`,
      [v.name, v.region, v.manager, v.color, v.portfolio, v.contract_code || code, v.owner_entity, v.address, v.owner_notice_addr, v.sp_budget ?? 0, v.units ?? 0, code]
    );
  });
  const diffs: string[] = [];
  const cmp = (label: string, a: any, bv: any) => { if (String(a ?? '') !== String(bv ?? '')) diffs.push(`${label} "${a ?? ''}" → "${bv ?? ''}"`); };
  cmp('name', old.name, v.name); cmp('region', old.region, v.region); cmp('manager', old.manager, v.manager);
  cmp('portfolio', old.portfolio, v.portfolio); cmp('color', old.color, v.color);
  if (Number(old.sp_budget ?? 0) !== Number(v.sp_budget ?? 0)) diffs.push(`SP budget ${fmtMoney(old.sp_budget)} → ${fmtMoney(v.sp_budget)}`);
  if (Number(old.units ?? 0) !== Number(v.units ?? 0)) diffs.push(`units ${old.units ?? 0} → ${v.units ?? 0}`);
  logChange(req, { action: 'property.update', entityType: 'property', entityId: code, property: code, summary: `Property ${code} updated${diffs.length ? ': ' + diffs.join('; ') : ''}` });
  res.json({ ok: true });
});

api.delete('/properties/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const [nProj, nContract, nAdj] = await Promise.all([
    query('select count(*)::int as n from projects where property_code=$1', [code]),
    query('select count(*)::int as n from contracts where property_code=$1', [code]),
    query('select count(*)::int as n from cash_adjustments where property_code=$1', [code]),
  ]);
  const blockers: string[] = [];
  if (nProj.rows[0].n) blockers.push(`${nProj.rows[0].n} projects`);
  if (nContract.rows[0].n) blockers.push(`${nContract.rows[0].n} contracts`);
  if (nAdj.rows[0].n) blockers.push(`${nAdj.rows[0].n} cash adjustments`);
  if (blockers.length) return res.status(400).json({ error: `cannot delete ${code} — it has ${blockers.join(', ')}` });
  // GL lines + cash snapshot are intentionally kept (imported data survives; the
  // property can be re-added later and its data reappears).
  await query('delete from properties where code=$1', [code]);
  logChange(req, { action: 'property.delete', entityType: 'property', entityId: code, property: code, summary: `Property ${code} deleted (imported GL/cushion data retained)` });
  res.json({ ok: true });
});

/* ---------- app meta (editable title) ---------- */
api.patch('/meta', async (req, res) => {
  const title = String(req.body?.appTitle || '').trim().slice(0, 80);
  if (!title) return res.status(400).json({ error: 'appTitle required' });
  const old = (await query('select app_title from app_meta where id=1')).rows[0]?.app_title || '';
  await query('update app_meta set app_title=$1 where id=1', [title]);
  if (old !== title) logChange(req, { action: 'meta.title', entityType: 'meta', summary: `App title changed "${old}" → "${title}"` });
  res.json({ ok: true, appTitle: title });
});

/* ---------- exports ---------- */
api.get('/export/backup.json', async (_req, res) => {
  const state = await assembleState();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="sp-tracker-${new Date().toISOString().slice(0, 10)}.json"`);
  res.send(JSON.stringify(state, null, 2));
});

api.get('/export/projects.csv', async (_req, res) => {
  const state = await assembleState();
  const cols = ['property', 'region', 'category', 'name', 'contractor', 'anticipatedCost', 'actualCost', 'dateAdded', 'onHold', ...STEP_KEYS];
  const lines = [cols.join(',')];
  for (const p of state.projects) {
    lines.push(cols.map((cc) => {
      let v: any = STEP_KEYS.includes(cc) ? (p.steps && (p.steps as any)[cc] ? 1 : 0) : (p as any)[cc];
      v = v == null ? '' : String(v).replace(/"/g, '""');
      return /[",\n]/.test(v) ? `"${v}"` : v;
    }).join(','));
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sp-projects-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(lines.join('\n'));
});

/* ---------- reset to seed / restore from backup ---------- */
api.post('/reset', async (req, res) => {
  const { readFileSync } = await import('node:fs');
  const { SEED_PATH } = await import('./seed.js');
  const raw = JSON.parse(readFileSync(SEED_PATH, 'utf8')) as AppState;
  await tx((c) => loadStateInto(c, raw));
  logChange(req, { action: 'admin.reset', entityType: 'meta', summary: 'All data reset to the starter seed' });
  res.json({ ok: true });
});

api.post('/restore', async (req, res) => {
  const state = req.body as AppState;
  if (!state || !state.properties || !state.projects) return res.status(400).json({ error: 'not a valid backup' });
  await tx((c) => loadStateInto(c, state));
  logChange(req, { action: 'admin.restore', entityType: 'meta', summary: `Backup restored — ${state.properties.length} properties, ${state.projects.length} projects` });
  res.json({ ok: true });
});
