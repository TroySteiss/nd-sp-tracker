/* Property-manager API — a deliberately small surface for the /pm view.
 *
 * This router is separate from the main api router on purpose. The PM view must
 * never see cash, GL, budgets or variance, so rather than filtering the full
 * /api/state blob (one missed key leaks a dollar figure), PM state is assembled
 * from scratch here with only the fields the view renders.
 *
 * Every route re-reads the caller's role and covered sites from the DB — the
 * session carries a username, never a role, so a stale session can't retain
 * access after an admin changes the roster.
 *
 * Writes a PM may perform, and nothing else:
 *   - create a project (name/category/description/anticipated cost/notes)
 *   - add a progress note, with optional attachments
 *   - upload/remove bid files on their own projects
 *   - request review once bids are collected
 *   - add a property-level note
 *   - set their covered sites
 * Lifecycle steps, approvals, costs-after-create, contractors and every
 * financial field are unreachable from here.
 */
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { query, tx } from './db.js';
import { isOfficeDoc, officeToPdf } from './convert.js';
import { requestContractRevision } from './revision.js';
import { getUserRecord, roleOf, normUser } from './auth.js';
import { LIFECYCLE, CATEGORIES, STEP_KEYS, CONTRACT_STEPS } from '../shared/domain.js';

const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });
const uid = (p: string) => p + Math.random().toString(36).slice(2, 9);

/* pg returns `date` columns as JS Date objects, so String(v).slice(0,10) yields
   "Mon Apr 13" rather than an ISO date. Same helper as db.ts. */
const isoDate = (v: any): string => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? '' : String(v).slice(0, 10));

export const pmApi = Router();

/* Async handlers must not crash the process (same reasoning as routes.ts). */
for (const m of ['get', 'post', 'patch', 'delete'] as const) {
  const orig = (pmApi as any)[m].bind(pmApi);
  (pmApi as any)[m] = (path: string, ...hs: any[]) =>
    orig(path, ...hs.map((h: any) =>
      typeof h === 'function' && h.length <= 3
        ? (req: Request, res: Response, next: NextFunction) => { try { const r = h(req, res, next); if (r?.catch) r.catch(next); } catch (e) { next(e); } }
        : h));
}

interface PMCtx { username: string; key: string; role: string; sites: string[]; }

/** Resolve the caller fresh on every request. Admins may browse the PM view
 *  (handy for support) and see every site; a PM sees only their roster sites. */
async function ctx(req: Request): Promise<PMCtx | null> {
  const username = (req.session as any)?.username;
  if (!username) return null;
  const role = await roleOf(username);
  const rec = await getUserRecord(username);
  if (role === 'admin') {
    const all = (await query<{ code: string }>('select code from properties order by code')).rows.map(r => r.code);
    return { username, key: normUser(username), role, sites: rec?.sites?.length ? rec.sites : all };
  }
  return { username, key: normUser(username), role, sites: rec?.sites || [] };
}

async function requirePmCtx(req: Request, res: Response): Promise<PMCtx | null> {
  const c = await ctx(req);
  if (!c) { res.status(401).json({ error: 'unauthorized' }); return null; }
  if (c.role !== 'pm' && c.role !== 'admin') {
    res.status(403).json({ error: 'The property-manager view is limited to PM accounts' });
    return null;
  }
  return c;
}

/** Guard every project route: the project must sit on one of the caller's sites. */
async function projectOnSite(id: string, sites: string[]) {
  const r = (await query<any>('select * from projects where id=$1', [id])).rows[0];
  if (!r) return { err: 404 as const, row: null };
  if (!sites.includes(r.property_code)) return { err: 403 as const, row: null };
  return { err: null, row: r };
}

function logChange(req: Request, e: { action: string; entityId?: string; property?: string; summary: string; details?: any }) {
  const user = (req.session as any)?.username || 'unknown';
  query(
    'insert into change_log(id,username,action,entity_type,entity_id,property_code,summary,details) values($1,$2,$3,$4,$5,$6,$7,$8)',
    [uid('L') + Date.now().toString(36), user, e.action, 'project', e.entityId || '', e.property || '', e.summary,
     e.details != null ? JSON.stringify(e.details) : null]
  ).catch(err => console.error('change_log insert failed:', err?.message || err));
}

/* ---------- state ---------- */

pmApi.get('/state', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;

  const props = (await query<any>(
    'select code, name, region, color from properties where code = any($1) order by code', [c.sites]
  )).rows;

  // Only the columns the PM view renders. No cost/budget/GL columns are selected.
  const projects = c.sites.length ? (await query<any>(
    `select id, property_code, category, name, description, contractor, anticipated_cost,
            date_added, planned_start, planned_end, steps, notes, on_hold, in_house,
            contract_file_key, contract_file_name,
            contractor_signed_file_key, contractor_signed_file_name,
            executed_contract_file_key, executed_contract_file_name,
            pm_review_requested_at, pm_review_requested_by,
            revision_requested_at, revision_requested_by, revision_reason, superseded_contracts
       from projects where property_code = any($1) order by date_added desc nulls last, id desc`,
    [c.sites]
  )).rows : [];

  const ids = projects.map(p => p.id);
  const bids = ids.length ? (await query<any>(
    'select id, project_id, slot, contractor, amount, approved, file_key, file_name, file_size, files from bids where project_id = any($1) order by slot', [ids]
  )).rows : [];
  const notes = ids.length ? (await query<any>(
    'select id, project_id, date, note, username, ts, files from progress_notes where project_id = any($1) order by ts nulls last, id', [ids]
  )).rows : [];

  const bidsFor = (pid: string) => bids.filter(b => b.project_id === pid).map(b => ({
    id: b.id, slot: b.slot, contractor: b.contractor || '', amount: b.amount == null ? null : Number(b.amount),
    approved: !!b.approved, fileKey: b.file_key, fileName: b.file_name, fileSize: b.file_size,
    files: b.files || [],
  }));

  res.json({
    me: { username: c.username, role: c.role, sites: c.sites },
    lifecycle: LIFECYCLE,
    categories: CATEGORIES,
    properties: props.map(p => ({ code: p.code, name: p.name, region: p.region, color: p.color })),
    projects: projects.map(p => ({
      id: p.id, property: p.property_code, category: p.category, name: p.name,
      description: p.description || '', contractor: p.contractor || '',
      anticipatedCost: p.anticipated_cost == null ? null : Number(p.anticipated_cost),
      dateAdded: isoDate(p.date_added),
      plannedStart: isoDate(p.planned_start),
      plannedEnd: isoDate(p.planned_end),
      steps: p.steps || {}, notes: p.notes || '', onHold: !!p.on_hold, inHouse: !!p.in_house,
      contractFileKey: p.contract_file_key, contractFileName: p.contract_file_name,
      contractorSignedFileKey: p.contractor_signed_file_key, contractorSignedFileName: p.contractor_signed_file_name,
      executedFileKey: p.executed_contract_file_key, executedFileName: p.executed_contract_file_name,
      reviewRequestedAt: p.pm_review_requested_at, reviewRequestedBy: p.pm_review_requested_by,
      revisionRequestedAt: p.revision_requested_at, revisionRequestedBy: p.revision_requested_by,
      revisionReason: p.revision_reason || '',
      supersededContracts: p.superseded_contracts || [],
      bids: bidsFor(p.id),
      progressNotes: notes.filter(n => n.project_id === p.id).map(n => ({
        id: n.id, date: isoDate(n.date), note: n.note || '',
        username: n.username || '', ts: n.ts, files: n.files || [],
      })),
    })),
  });
});

/** All sites, for the first-run picker. Codes and names only. */
pmApi.get('/sites', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const rows = (await query<any>('select code, name, region from properties order by region, code')).rows;
  res.json({ sites: rows, mine: c.sites });
});

pmApi.patch('/sites', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const wanted: string[] | null = Array.isArray(req.body?.sites) ? req.body.sites.map((s: any) => String(s)) : null;
  if (!wanted) return res.status(400).json({ error: 'sites array required' });
  const valid = (await query<{ code: string }>('select code from properties')).rows.map(r => r.code);
  const sites = wanted.filter((s) => valid.includes(s));
  await query(
    `insert into app_users(key, display, role, sites) values($1,$2,'pm',$3::jsonb)
     on conflict (key) do update set sites=excluded.sites, updated_at=now()`,
    [c.key, c.username, JSON.stringify(sites)]
  );
  logChange(req, { action: 'pm.sites', summary: `${c.username} set covered sites: ${sites.join(', ') || '(none)'}` });
  res.json({ ok: true, sites });
});

/* ---------- project log ---------- */

pmApi.get('/projects/:id/log', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const rows = (await query<any>(
    `select id, ts, username, action, summary, details from change_log
      where entity_id=$1 order by ts desc limit 200`, [req.params.id]
  )).rows;
  res.json(rows);
});

/* ---------- writes ---------- */

pmApi.post('/projects', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const b = req.body || {};
  const property = String(b.property || '');
  if (!c.sites.includes(property)) return res.status(403).json({ error: 'Not one of your sites' });
  const name = String(b.name || '').trim().slice(0, 200);
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  const category = CATEGORIES.includes(String(b.category)) ? String(b.category) : 'GENERAL';
  const cost = b.anticipatedCost == null || b.anticipatedCost === '' ? null : Number(b.anticipatedCost);
  if (cost != null && !isFinite(cost)) return res.status(400).json({ error: 'Anticipated cost must be a number' });

  const id = uid('P') + Date.now().toString(36);
  const today = new Date().toISOString().slice(0, 10);
  // No cost plugged in ⇒ domain.phase() reads 'note', which is the tracker's
  // Notes group. Don't tick `planned` in that case — a note isn't planned work.
  const steps = cost != null ? { planned: true } : {};
  await query(
    `insert into projects(id, property_code, category, name, description, anticipated_cost,
                          date_added, steps, notes, on_hold, in_house)
     values($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,false,false)`,
    [id, property, category, name, String(b.description || '').slice(0, 4000), cost, today,
     JSON.stringify(steps), String(b.notes || '').slice(0, 4000)]
  );
  logChange(req, { action: 'project.create', entityId: id, property,
    summary: `${c.username} created "${name}" (${category}) at ${property} via the PM view`,
    details: { anticipatedCost: cost } });
  res.json({ ok: true, id });
});

/* Edit the handful of fields a PM owns. These write the SAME columns the admin
   view reads (projects.anticipated_cost, bids.amount/contractor) — there is no
   PM-only copy, so a PM's estimate and bid amounts show up in the full view,
   the cash model and the exports with no sync step. */
pmApi.patch('/projects/:id', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const b = req.body || {};
  const sets: string[] = []; const params: any[] = [row.id]; const diff: any = {};
  const put = (col: string, val: any, label: string, was: any) => {
    params.push(val); sets.push(`${col}=$${params.length}`); diff[label] = { from: was, to: val };
  };
  if (typeof b.name === 'string' && b.name.trim() && b.name.trim() !== row.name) put('name', b.name.trim().slice(0, 200), 'name', row.name);
  if (typeof b.description === 'string' && b.description !== row.description) put('description', b.description.slice(0, 4000), 'description', row.description);
  if (typeof b.notes === 'string' && b.notes !== row.notes) put('notes', b.notes.slice(0, 4000), 'notes', row.notes);
  if (typeof b.category === 'string' && CATEGORIES.includes(b.category) && b.category !== row.category) put('category', b.category, 'category', row.category);
  if (b.anticipatedCost !== undefined) {
    const cost = b.anticipatedCost === null || b.anticipatedCost === '' ? null : Number(b.anticipatedCost);
    if (cost != null && !isFinite(cost)) return res.status(400).json({ error: 'Anticipated cost must be a number' });
    const was = row.anticipated_cost == null ? null : Number(row.anticipated_cost);
    if (cost !== was) put('anticipated_cost', cost, 'anticipatedCost', was);
  }
  // Schedule. Empty string clears the date; anything else must be YYYY-MM-DD so a
  // bad value can't reach a date column (see the dnull() gotcha in PROJECT_MAP).
  for (const [field, col] of [['plannedStart', 'planned_start'], ['plannedEnd', 'planned_end']] as const) {
    if (b[field] === undefined) continue;
    const raw = String(b[field] || '').trim();
    if (raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return res.status(400).json({ error: `${field} must be YYYY-MM-DD` });
    const was = isoDate(row[col]);
    if (raw !== was) put(col, raw || null, field, was || null);
  }
  if (!sets.length) return res.json({ ok: true, unchanged: true });
  await query(`update projects set ${sets.join(', ')}, updated_at=now() where id=$1`, params);
  logChange(req, { action: 'project.update', entityId: row.id, property: row.property_code,
    summary: `${c.username} edited ${Object.keys(diff).join(', ')} on "${row.name}"`, details: diff });
  res.json({ ok: true });
});

/** Set a bid's contractor/amount without re-uploading the document. */
pmApi.patch('/projects/:id/bids/:slot', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const slot = Math.max(0, Math.min(9, Number(req.params.slot) || 0));
  const contractor = String(req.body?.contractor ?? '').trim().slice(0, 200);
  const amountRaw = req.body?.amount;
  const amount = amountRaw == null || amountRaw === '' ? null : Number(amountRaw);
  if (amount != null && !isFinite(amount)) return res.status(400).json({ error: 'Bid amount must be a number' });
  const existing = (await query<any>('select id from bids where project_id=$1 and slot=$2', [row.id, slot])).rows[0];
  if (existing) {
    await query('update bids set contractor=$2, amount=$3 where id=$1', [existing.id, contractor, amount]);
  } else {
    await query(
      `insert into bids(id, project_id, slot, contractor, amount, approved, files)
       values($1,$2,$3,$4,$5,false,'[]'::jsonb)`,
      [uid('B') + Date.now().toString(36), row.id, slot, contractor, amount]);
  }
  logChange(req, { action: 'project.bid.update', entityId: row.id, property: row.property_code,
    summary: `${c.username} set bid ${slot + 1} on "${row.name}"${contractor ? ` to ${contractor}` : ''}${amount != null ? ` at $${amount.toLocaleString()}` : ''}`,
    details: { slot, contractor, amount } });
  res.json({ ok: true });
});

pmApi.post('/projects/:id/note', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const note = String(req.body?.note || '').trim().slice(0, 4000);
  if (!note) return res.status(400).json({ error: 'Note text is required' });
  const id = uid('N') + Date.now().toString(36);
  await query(
    `insert into progress_notes(id, project_id, date, note, username, ts, files)
     values($1,$2,$3,$4,$5,now(),'[]'::jsonb)`,
    [id, row.id, new Date().toISOString().slice(0, 10), note, c.username]
  );
  logChange(req, { action: 'project.note', entityId: row.id, property: row.property_code,
    summary: `${c.username} added a note to "${row.name}"`, details: { note: note.slice(0, 200) } });
  res.json({ ok: true, id });
});

pmApi.post('/projects/:id/note-file', memUpload.single('file'), async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const f = (req as any).file;
  if (!f) return res.status(400).json({ error: 'No file' });
  const noteId = String(req.body?.noteId || '');
  const key = uid('F') + Date.now().toString(36);
  await tx(async (cx) => {
    await cx.query('insert into files(key, name, mime, size, bytes) values($1,$2,$3,$4,$5)',
      [key, f.originalname, f.mimetype || 'application/octet-stream', f.size, f.buffer]);
    await cx.query(
      `update progress_notes set files = coalesce(files,'[]'::jsonb) || $2::jsonb
        where id=$1 and project_id=$3`,
      [noteId, JSON.stringify([{ fileKey: key, fileName: f.originalname, fileSize: f.size }]), row.id]
    );
  });
  logChange(req, { action: 'project.note.file', entityId: row.id, property: row.property_code,
    summary: `${c.username} attached ${f.originalname} to a note on "${row.name}"` });
  res.json({ ok: true, fileKey: key, fileName: f.originalname, fileSize: f.size });
});

pmApi.post('/projects/:id/bids/:slot/file', memUpload.single('file'), async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const f = (req as any).file;
  if (!f) return res.status(400).json({ error: 'No file' });
  const slot = Math.max(0, Math.min(9, Number(req.params.slot) || 0));
  const contractor = String(req.body?.contractor || '').trim().slice(0, 200);
  const amountRaw = req.body?.amount;
  const amount = amountRaw == null || amountRaw === '' ? null : Number(amountRaw);
  if (amount != null && !isFinite(amount)) return res.status(400).json({ error: 'Bid amount must be a number' });

  // 'scope' is the Applicable Scope & Contract Totals doc and must stay at
  // files[0] — the contract generator embeds files in this order, and the
  // legacy file_key/file_name/file_size columns mirror files[0]. Anything else
  // is supporting documentation appended after it.
  const role = String(req.body?.role || 'scope') === 'doc' ? 'doc' : 'scope';

  // Bid documents embed into the contract, so Office files convert to PDF here
  // exactly as the full view's upload does (original kept for the record). Without
  // this a PM could attach a .docx that contract.ts then refuses to embed.
  let pdf: Buffer | null = null;
  if (isOfficeDoc(f.originalname)) {
    pdf = await officeToPdf(f.buffer, f.originalname);
    if (!pdf) {
      return res.status(400).json({
        error: `"${f.originalname}" could not be converted to PDF on this server — save it as a PDF and attach that instead.`,
      });
    }
  }
  const pdfName = pdf ? f.originalname.replace(/\.[^.]+$/, '') + '.pdf' : f.originalname;
  const key = uid('F') + Date.now().toString(36);
  const origKey = pdf ? uid('F') + Date.now().toString(36) : null;
  const entry: any = { fileKey: key, fileName: pdfName, fileSize: pdf ? pdf.length : f.size };
  if (origKey) { entry.originalFileKey = origKey; entry.originalFileName = f.originalname; }

  await tx(async (cx) => {
    await cx.query('insert into files(key, name, mime, size, bytes) values($1,$2,$3,$4,$5)',
      [key, pdfName, pdf ? 'application/pdf' : (f.mimetype || 'application/octet-stream'),
       pdf ? pdf.length : f.size, pdf || f.buffer]);
    if (origKey) {
      await cx.query('insert into files(key, name, mime, size, bytes) values($1,$2,$3,$4,$5)',
        [origKey, f.originalname, f.mimetype || 'application/octet-stream', f.size, f.buffer]);
    }
    // Bids are addressed by slot, so re-uploading slot 2 edits slot 2 rather
    // than appending a fourth bid.
    const existing = (await cx.query('select id, files from bids where project_id=$1 and slot=$2', [row.id, slot])).rows[0];
    if (existing) {
      const files = Array.isArray(existing.files) ? existing.files.slice() : [];
      if (role === 'scope') files.length ? (files[0] = entry) : files.push(entry);
      else files.push(entry);
      const head = files[0] || entry;
      await cx.query(
        `update bids set contractor=coalesce(nullif($2,''),contractor), amount=coalesce($3,amount),
                         files=$4::jsonb, file_key=$5, file_name=$6, file_size=$7 where id=$1`,
        [existing.id, contractor, amount, JSON.stringify(files), head.fileKey, head.fileName, head.fileSize]);
    } else {
      await cx.query(
        `insert into bids(id, project_id, slot, contractor, amount, approved, file_key, file_name, file_size, files)
         values($1,$2,$3,$4,$5,false,$6,$7,$8,$9::jsonb)`,
        [uid('B') + Date.now().toString(36), row.id, slot, contractor, amount,
         key, entry.fileName, entry.fileSize, JSON.stringify([entry])]);
    }
  });
  logChange(req, { action: 'project.bid.file', entityId: row.id, property: row.property_code,
    summary: `${c.username} uploaded ${role === 'scope' ? 'the scope & cost document' : 'a supporting document'} for bid ${slot + 1}${contractor ? ` (${contractor})` : ''} on "${row.name}"${pdf ? ' (converted to PDF)' : ''}`,
    details: { fileName: f.originalname, role, amount, converted: !!pdf } });
  res.json({ ok: true, fileKey: key, fileName: entry.fileName, role, converted: !!pdf });
});

/** Detach a file from a bid. The bytes stay in `files` (same as the full view) —
 *  this only removes the reference, and it is recorded in the project log. */
pmApi.post('/projects/:id/bids/:slot/remove-file', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const slot = Math.max(0, Math.min(9, Number(req.params.slot) || 0));
  const fileKey = String(req.body?.fileKey || '');
  const bid = (await query<any>('select id, files from bids where project_id=$1 and slot=$2', [row.id, slot])).rows[0];
  if (!bid) return res.status(404).json({ error: 'No such bid slot' });
  const files = (Array.isArray(bid.files) ? bid.files : []).filter((f: any) => f.fileKey !== fileKey);
  const head = files[0] || null;
  await query('update bids set files=$2::jsonb, file_key=$3, file_name=$4, file_size=$5 where id=$1',
    [bid.id, JSON.stringify(files), head?.fileKey || null, head?.fileName || null, head?.fileSize || null]);
  logChange(req, { action: 'project.bid.file.remove', entityId: row.id, property: row.property_code,
    summary: `${c.username} removed a file from bid ${slot + 1} on "${row.name}"`, details: { fileKey } });
  res.json({ ok: true });
});

/* ---------- contract signature iterations ----------
   Once a bid is approved the three drop-in slots stop being bids and become the
   signature chain: Generated → Contractor Signed → Countersigned. The lifecycle
   steps these imply are attachment-derived (see LIFECYCLE in domain.ts), so a PM
   still never ticks a step by hand — the document does it. Cascades mirror the
   full view's /contract-file, /contractor-signed and /executed-contract routes. */
const CONTRACT_SLOTS = {
  generated: { keyCol: 'contract_file_key', nameCol: 'contract_file_name',
               label: 'Generated contract', action: 'contract.upload' },
  contractorSigned: { keyCol: 'contractor_signed_file_key', nameCol: 'contractor_signed_file_name',
                      label: 'Contractor-signed contract', action: 'contract.contractorSigned' },
  countersigned: { keyCol: 'executed_contract_file_key', nameCol: 'executed_contract_file_name',
                   label: 'Countersigned contract', action: 'contract.executed' },
} as const;

pmApi.post('/projects/:id/contract/:kind/file', memUpload.single('file'), async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const kind = req.params.kind as keyof typeof CONTRACT_SLOTS;
  const spec = CONTRACT_SLOTS[kind];
  if (!spec) return res.status(400).json({ error: 'Unknown contract slot' });
  const f = (req as any).file;
  if (!f) return res.status(400).json({ error: 'No file' });

  const steps: Record<string, boolean> = { ...(row.steps || {}) };
  if (kind === 'countersigned') {
    steps.signed = true;                     // executed document ⇒ signed
  } else {
    steps.contractGenerated = true;          // generated or contractor-signed ⇒ contract exists
    const noContract = !!row.no_contract;
    STEP_KEYS.slice(0, STEP_KEYS.indexOf('contractGenerated')).forEach((k) => {
      if (!(noContract && CONTRACT_STEPS.includes(k))) steps[k] = true;
    });
  }

  const key = uid('F') + Date.now().toString(36);
  await tx(async (cx) => {
    await cx.query('insert into files(key, name, mime, size, bytes) values($1,$2,$3,$4,$5)',
      [key, f.originalname, f.mimetype || 'application/octet-stream', f.size, f.buffer]);
    await cx.query(
      `update projects set ${spec.keyCol}=$1, ${spec.nameCol}=$2, steps=$3::jsonb, updated_at=now() where id=$4`,
      [key, f.originalname, JSON.stringify(steps), row.id]);
  });
  logChange(req, { action: spec.action, entityId: row.id, property: row.property_code,
    summary: `${c.username} attached the ${spec.label.toLowerCase()} "${f.originalname}" to "${row.name}"`,
    details: { kind, fileName: f.originalname } });
  res.json({ ok: true, fileKey: key, fileName: f.originalname, kind });
});

/** Flag the contract as needing revision — rolls back past approval. */
pmApi.post('/projects/:id/request-revision', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const reason = String(req.body?.reason || '').trim().slice(0, 2000);
  if (!reason) return res.status(400).json({ error: 'Say what is wrong with the contract' });
  if (!(row.steps || {}).approved && !row.contract_file_key) {
    return res.status(400).json({ error: 'This project has no approved bid or contract to revise' });
  }

  let result!: Awaited<ReturnType<typeof requestContractRevision>>;
  await tx(async (cx) => {
    result = await requestContractRevision(cx, row, c.username, reason);
    // The reason belongs in the notes stream, same as the review hand-off.
    await cx.query(
      `insert into progress_notes(id, project_id, date, note, username, ts, files)
       values($1,$2,$3,$4,$5,now(),'[]'::jsonb)`,
      [uid('N') + Date.now().toString(36), row.id, new Date().toISOString().slice(0, 10),
       `Contract flagged as needing revision — ${reason}`, c.username]
    );
  });
  logChange(req, { action: 'contract.revision_requested', entityId: row.id, property: row.property_code,
    summary: `${c.username} flagged the contract on "${row.name}" as needing revision — ${reason.slice(0, 160)}`,
    details: { reason, archived: result.archived, clearedSteps: result.clearedSteps } });
  res.json({ ok: true, ...result });
});

pmApi.post('/projects/:id/request-review', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const { err, row } = await projectOnSite(req.params.id, c.sites);
  if (err) return res.status(err).json({ error: err === 404 ? 'not found' : 'not your site' });
  const n = (await query<{ n: string }>('select count(*)::text n from bids where project_id=$1 and file_key is not null', [row.id])).rows[0];
  const bidCount = Number(n?.n || 0);
  if (bidCount < 3) return res.status(400).json({ error: `Attach 3 bids before requesting review (${bidCount} so far)` });
  await query('update projects set pm_review_requested_at=now(), pm_review_requested_by=$2 where id=$1', [row.id, c.username]);
  // The hand-off also lands in the notes stream so it reads in sequence with
  // everything else on the project, flagged awaiting review. The main dashboard's
  // "Awaiting RM Review" queue will read pm_review_requested_at.
  await query(
    `insert into progress_notes(id, project_id, date, note, username, ts, files)
     values($1,$2,$3,$4,$5,now(),'[]'::jsonb)`,
    [uid('N') + Date.now().toString(36), row.id, new Date().toISOString().slice(0, 10),
     `Submitted for RM review — ${bidCount} bids attached. Awaiting review.`, c.username]
  );
  logChange(req, { action: 'project.review_requested', entityId: row.id, property: row.property_code,
    summary: `${c.username} requested review of "${row.name}" (${bidCount} bids attached)` });
  res.json({ ok: true });
});

/* Property-level notes are not a separate store: in this tracker a "note" IS a
   project with no cost plugged in (domain.phase → 'note', the NOTES group in the
   property view). So this just creates a costless project, which shows up in the
   office's existing Notes group with no extra plumbing. */
pmApi.post('/properties/:code/note', async (req, res) => {
  const c = await requirePmCtx(req, res); if (!c) return;
  const property = req.params.code;
  if (!c.sites.includes(property)) return res.status(403).json({ error: 'Not one of your sites' });
  const name = String(req.body?.name || '').trim().slice(0, 200);
  if (!name) return res.status(400).json({ error: 'Give the note a title' });
  const category = CATEGORIES.includes(String(req.body?.category)) ? String(req.body.category) : 'GENERAL';
  const id = uid('P') + Date.now().toString(36);
  await query(
    `insert into projects(id, property_code, category, name, description, anticipated_cost,
                          date_added, steps, notes, on_hold, in_house)
     values($1,$2,$3,$4,$5,null,$6,'{}'::jsonb,$7,false,false)`,
    [id, property, category, name, String(req.body?.description || '').slice(0, 4000),
     new Date().toISOString().slice(0, 10), String(req.body?.notes || '').slice(0, 4000)]
  );
  logChange(req, { action: 'project.create', entityId: id, property,
    summary: `${c.username} jotted a note at ${property}: "${name}"` });
  res.json({ ok: true, id });
});
