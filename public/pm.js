/* Property-manager view. Standalone from app.js on purpose: nothing financial
   beyond the PM's own estimate and bid amounts is loaded, so no dollar figure
   from the full tracker can leak through a missed conditional here.

   Everything renders from GET /api/pm/state. Writes go to /api/pm/* only. */

const $ = (t, a, ...kids) => {
  const e = document.createElement(t);
  for (const k in (a || {})) {
    const v = a[k];
    if (v == null) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  kids.flat().forEach(c => c != null && c !== false && e.append(c.nodeType ? c : document.createTextNode(String(c))));
  return e;
};
const root = document.getElementById('root');

let S = null;                                     // /api/pm/state payload
let ME = { username: '', role: '', sites: [] };
// view: 'dashboard' | 'list' (a status bucket) | 'property'
const VIEW = { view: 'dashboard', tab: 'active', prop: null, open: null, railOpen: false };

/* Theme — same key, same default and same toggle as the main tracker, so a PM
   switching between the two pages keeps their choice. */
function applyTheme(t) {
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}
const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  applyTheme(next);
  render();
}

/* phase() mirrored from shared/domain.ts, the same way app.js mirrors it.
   public/domain.js is an ESM bundle and can't be loaded as a classic script, and
   index.html doesn't use it either — the browser copy is kept in step by hand.
   Keep this in sync if the domain phases change.
   In-house progress fields aren't in the PM payload; those projects fall through
   to the cost rule, which is right for the PM view (they don't manage in-house). */
const hasCost = p => p.anticipatedCost != null || p.actualCost != null;
function phase(p) {
  if (p.onHold) return 'hold';
  if (p.steps && p.steps.completed) return 'done';
  if (p.steps && p.steps.paid) return 'paid';
  if (p.steps && p.steps.approved) return 'active';
  if (!hasCost(p)) return 'note';
  return 'discussed';
}

/* Per-property colour, mirrored from app.js so a site is the SAME colour in both
   views. The properties table is the source of truth; codes without a colour get
   a stable hash fallback — identical array and hash to the main tracker, so the
   two can never disagree. Keep in step if app.js changes. */
const FALLBACK_COLORS = ['#5e97cc','#e0973a','#4f9d69','#a2599c','#c05b4d','#3f7cb8','#8f6f3a','#2f8f8f','#7a5cc0','#b8501f'];
const pcolor = code => {
  const p = S && S.properties && S.properties.find(x => x.code === code);
  if (p && p.color) return p.color;
  let h = 0; for (const ch of String(code || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
};

const usd = n => n == null ? '—' : '$' + Math.round(n).toLocaleString();
const kb = n => n == null ? '' : n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
const when = ts => { if (!ts) return ''; const d = new Date(ts); return isNaN(d) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };

function toast(msg) {
  const t = $('div', { class: 'pm-toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 2600);
}

async function api(method, path, body, isForm) {
  const opts = { method, headers: {} };
  if (isForm) opts.body = body;
  else if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch('/api/pm' + path, opts);
  const txt = await r.text();
  let data = null; try { data = txt ? JSON.parse(txt) : null; } catch { /* non-JSON */ }
  if (!r.ok) throw new Error((data && data.error) || r.statusText);
  return data;
}

async function reload(msg) {
  // Every save refetches and rebuilds the DOM, which would otherwise throw you
  // back to the top of a long list. VIEW.open already survives; restore scroll.
  const y = window.scrollY;
  S = await api('GET', '/state');
  ME = S.me;
  render();
  window.scrollTo(0, y);
  if (msg) toast(msg);
}

/* ---------- lifecycle (read-only for a PM) ---------- */

/** Lifecycle rendered with the tracker's own .steps/.step rows — read-only here,
 *  so no toggle control, but visually identical to the full editor. */
function stepsPanel(p) {
  const list = $('div', { class: 'steps' });
  S.lifecycle.forEach((s, i) => {
    const on = !!(p.steps && p.steps[s.key]);
    list.append($('div', { class: 'step' + (on ? ' on' : '') + (s.key === 'lienWaiver' ? ' lien' : '') },
      $('div', { class: 'num' }, on ? '✓' : String(i + 1)),
      $('div', { style: 'min-width:0' },
        $('div', { class: 'nm' }, s.label),
        $('div', { class: 'ds' }, s.desc))));
  });
  return section('Lifecycle', list, 'The office advances these — a document you attach can tick one automatically.');
}

/** Status as the tracker's own phase chips. */
function statusChip(p) {
  if (p.onHold) return $('span', { class: 'chip hold' }, 'On hold');
  if (p.steps && p.steps.completed) return $('span', { class: 'chip done' }, 'Complete');
  if (p.revisionRequestedAt) return $('span', { class: 'chip hold' }, 'Needs revision');
  if (p.reviewRequestedAt) return $('span', { class: 'chip' }, 'Awaiting RM review');
  if (phase(p) === 'note') return $('span', { class: 'chip note' }, 'Note');
  if (!(p.steps && p.steps.approved)) {
    const n = readyCount(p);
    return $('span', { class: 'chip discussed' }, n >= 3 ? 'Bids ready' : `Bids ${n}/3`);
  }
  return $('span', { class: 'chip' }, 'In progress');
}

/* ---------- shared section shell ----------
   Every block inside a project is a .panel with a .ph header and .pad body —
   the same construction the main editor uses. */
function section(title, bodyEl, hint, right) {
  const panel = $('div', { class: 'panel', style: 'margin-bottom:14px' });
  panel.append($('div', { class: 'ph' }, $('h3', {}, title), $('div', { class: 'sp' }), right || null));
  const pad = $('div', { class: 'pad' });
  if (hint) pad.append($('p', { class: 'bs-hint' }, hint));
  pad.append(bodyEl);
  panel.append(pad);
  return panel;
}

/* ---------- files ---------- */

const dl = (key, name) => '/api/files/' + key + '?name=' + encodeURIComponent(name || 'file');

function uploadButton(label, onPick) {
  const inp = $('input', { type: 'file', style: 'display:none' });
  inp.addEventListener('change', () => { if (inp.files[0]) onPick(inp.files[0]); inp.value = ''; });
  const b = $('button', { class: 'btn sm', onclick: () => inp.click() }, label);
  return $('span', {}, b, inp);
}

/* ---------- bids ----------
   Mirrors the full view's model exactly: each bid holds an ordered files[] whose
   first entry is the Applicable Scope & Contract Totals document and whose rest
   are supporting documentation. Same class names as the main UI (bidslot / bs-*)
   so the section reads as the same product. */

const SLOTS_OF = p => {
  const s = [0, 1, 2];
  (p.bids || []).forEach(b => { if (b.slot != null && b.slot > 2 && !s.includes(b.slot)) s.push(b.slot); });
  return s.sort((a, b) => a - b);
};
const bidOf = (p, slot) => (p.bids || []).find(x => x.slot === slot) || {};
const filesOf = b => (b.files && b.files.length ? b.files : (b.fileKey ? [{ fileKey: b.fileKey, fileName: b.fileName, fileSize: b.fileSize }] : []));
const bidReady = b => filesOf(b).length > 0;
const readyCount = p => SLOTS_OF(p).filter(s => bidReady(bidOf(p, s))).length;
const fileLabel = (n, i) => n <= 1 ? 'Bid document' : (i === 0 ? 'Applicable Scope & Contract Totals' : 'Supporting document');

async function uploadBidFile(p, slot, file, role, contractor, amount) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('role', role);
  if (contractor != null) fd.append('contractor', contractor);
  if (amount != null) fd.append('amount', amount);
  await api('POST', `/projects/${p.id}/bids/${slot}/file`, fd, true);
}

/** Turn any element into a drop target for a bid slot. */
function dropZone(elm, onFiles) {
  elm.addEventListener('dragover', e => { e.preventDefault(); elm.classList.add('pm-drag'); });
  elm.addEventListener('dragleave', () => elm.classList.remove('pm-drag'));
  elm.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation(); elm.classList.remove('pm-drag');
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFiles(f);
  });
  return elm;
}

/** Full bid slot, used inside the expanded project. */
function bidSlot(p, slot) {
  const b = bidOf(p, slot);
  const files = filesOf(b);
  const box = $('div', { class: 'bidslot' + (b.approved ? ' win' : '') });

  box.append($('div', { class: 'bs-hd' },
    $('span', { class: 'bs-no' }, 'Bid ' + (slot + 1)),
    b.approved ? $('span', { class: 'chip done', style: 'margin-left:8px' }, 'Selected by office') : null,
    $('div', { style: 'flex:1' }),
    $('span', { style: 'font-size:11.5px;color:var(--ink-3)' }, files.length ? `${files.length} file${files.length === 1 ? '' : 's'}` : 'nothing attached')));

  const nameI = $('input', { type: 'text', placeholder: 'Contractor / vendor', value: b.contractor || '' });
  const amtI = $('input', { type: 'number', step: '1', placeholder: 'Bid amount ($)', value: b.amount == null ? '' : String(b.amount) });
  const save = async () => {
    try { await api('PATCH', `/projects/${p.id}/bids/${slot}`, { contractor: nameI.value, amount: amtI.value }); await reload('Bid saved'); }
    catch (e) { toast('Failed: ' + e.message); }
  };
  nameI.addEventListener('change', save);
  amtI.addEventListener('change', save);
  box.append($('div', { class: 'bs-row' }, nameI, amtI));

  files.forEach((fl, i) => box.append($('div', { class: 'bs-file', style: 'margin-bottom:6px' },
    $('span', { class: 'bs-doc' }, '📄'),
    $('div', { style: 'display:flex;flex-direction:column;min-width:0;flex:1' },
      $('span', { style: 'font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-3);font-weight:600' }, fileLabel(files.length, i)),
      $('div', { style: 'display:flex;gap:6px;align-items:center;min-width:0' },
        $('a', { href: dl(fl.fileKey, fl.fileName), target: '_blank' }, fl.fileName || 'bid'),
        $('span', { class: 'bs-sz' }, fl.fileSize ? kb(fl.fileSize) : ''))),
    $('a', { class: 'btn sm', href: dl(fl.fileKey, fl.fileName), download: fl.fileName || '' }, 'Download'),
    $('button', {
      class: 'btn sm', title: 'Remove this file from the bid — recorded in the project log',
      onclick: async () => {
        if (!confirm(`Remove "${fl.fileName || 'this file'}" from bid ${slot + 1}?`)) return;
        try { await api('POST', `/projects/${p.id}/bids/${slot}/remove-file`, { fileKey: fl.fileKey }); await reload('File removed'); }
        catch (e) { toast('Failed: ' + e.message); }
      },
    }, '✕'))));

  const pick = (role, label) => uploadButton(label, async (file) => {
    try { await uploadBidFile(p, slot, file, role, nameI.value, amtI.value); await reload('Uploaded'); }
    catch (e) { toast('Upload failed: ' + e.message); }
  });
  box.append($('div', { class: 'pm-inline', style: 'margin-top:8px' },
    pick('scope', files.length ? 'Replace scope & cost' : 'Attach scope & cost'),
    pick('doc', '＋ Add documentation'),
    $('span', { style: 'font-size:11.5px;color:var(--ink-3)' }, 'or drop a file here')));

  // Dropping on the slot fills the scope doc first, then adds documentation.
  dropZone(box, async (file) => {
    try { await uploadBidFile(p, slot, file, files.length ? 'doc' : 'scope', nameI.value, amtI.value); await reload('Uploaded'); }
    catch (e) { toast('Upload failed: ' + e.message); }
  });
  return box;
}

function submitRow(p) {
  if (p.reviewRequestedAt) {
    return $('div', { class: 'pm-banner', style: 'margin:10px 0 0' },
      `Submitted for RM review by ${p.reviewRequestedBy || 'a PM'} on ${when(p.reviewRequestedAt)} — awaiting review.`);
  }
  const n = readyCount(p);
  const ready = n >= 3;
  return $('div', { style: 'margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap' },
    $('button', {
      class: 'btn accent', disabled: ready ? null : 'disabled',
      onclick: async () => {
        try { await api('POST', `/projects/${p.id}/request-review`); await reload('Sent for RM review'); }
        catch (e) { toast(e.message); }
      },
    }, 'Submit for RM review'),
    $('span', { style: 'font-size:12.5px;color:var(--ink-3)' },
      ready ? 'Sends this to the office to pick a bid.' : `Attach ${3 - n} more bid${3 - n === 1 ? '' : 's'} to submit.`));
}

function bidSection(p) {
  const body = $('div', {});
  // Plenty of existing projects were awarded without bid rows — the contractor
  // and cost sit on the project itself. Say so, rather than showing three empty
  // slots that imply nothing was ever recorded.
  if (!readyCount(p) && (p.contractor || p.anticipatedCost != null)) {
    body.append($('div', { class: 'pm-banner', style: 'margin-bottom:12px' },
      'The office recorded ',
      $('strong', {}, p.contractor || 'a cost'),
      p.anticipatedCost != null ? ` at ${usd(p.anticipatedCost)}` : '',
      ' on this project without attaching bid documents. Add them below if you have them.'));
  }
  SLOTS_OF(p).forEach(slot => body.append(bidSlot(p, slot)));
  // Once a bid is approved the hand-off has already happened — nothing to submit.
  if (!inExecution(p)) body.append(submitRow(p));
  return section('Bids', body,
    'Three standard slots. The first file on a bid is the Applicable Scope & Contract Totals — that is what embeds into the contract — and anything after it is supporting documentation. Drop a file straight onto a slot, or use the buttons. The office approves the winning bid.',
    $('span', { class: 'chip' }, readyCount(p) + ' of 3'));
}

/* ---------- contract signature chain ----------
   Once the office approves a bid the project is in execution, so the three
   drop-in slots stop being bids and become the signature iterations. Same three
   boxes, same drag-and-drop, different meaning. */

const CONTRACT_CHAIN = [
  { kind: 'generated',        label: 'Generated',        keyF: 'contractFileKey',           nameF: 'contractFileName' },
  { kind: 'contractorSigned', label: 'Contractor signed', keyF: 'contractorSignedFileKey',  nameF: 'contractorSignedFileName' },
  { kind: 'countersigned',    label: 'Countersigned',    keyF: 'executedFileKey',           nameF: 'executedFileName' },
];

const inExecution = p => !!(p.steps && p.steps.approved);

async function uploadContract(p, kind, file) {
  const fd = new FormData();
  fd.append('file', file);
  await api('POST', `/projects/${p.id}/contract/${kind}/file`, fd, true);
}

/** Condensed contract slots for the collapsed card. */
function quickContract(p) {
  const wrap = $('div', { class: 'pm-quick' });
  CONTRACT_CHAIN.forEach((step, i) => {
    const key = p[step.keyF], name = p[step.nameF];
    const prevDone = i === 0 || p[CONTRACT_CHAIN[i - 1].keyF];
    const cell = $('div', { class: 'pm-qslot' + (key ? ' filled win' : '') });
    cell.append($('div', { class: 'pm-qhd' }, `${i + 1}. ${step.label}`,
      key ? $('span', { class: 'chip done', style: 'font-size:10px;padding:1px 6px' }, '✓') : null));
    const inp = $('input', { type: 'file', style: 'display:none' });
    inp.addEventListener('change', async () => {
      const f = inp.files[0]; inp.value = '';
      if (!f) return;
      try { await uploadContract(p, step.kind, f); await reload('Uploaded'); }
      catch (e) { toast('Upload failed: ' + e.message); }
    });

    // Same shape as the bid slots: file line under the header, and when empty
    // the drop target doubles as the browse button so there's no extra row.
    cell.append(key
      ? $('a', { class: 'pm-qfile', href: dl(key, name), target: '_blank', title: name,
                 onclick: e => e.stopPropagation() }, '📄 ' + (name || 'contract'))
      : $('button', { class: 'pm-qdrop', title: 'Click to browse, or drop a file here',
                      onclick: e => { e.stopPropagation(); inp.click(); } },
          prevDone ? '⇪ drop signed copy' : '⇪ waiting on previous step'));
    cell.append(inp);
    if (key) {
      cell.append($('button', {
        class: 'btn ghost sm', style: 'width:100%',
        onclick: e => { e.stopPropagation(); inp.click(); },
      }, 'Replace'));
    }

    dropZone(cell, async (file) => {
      try { await uploadContract(p, step.kind, file); await reload('Uploaded'); }
      catch (e) { toast('Upload failed: ' + e.message); }
    });
    cell.addEventListener('click', e => e.stopPropagation());
    wrap.append(cell);
  });
  return wrap;
}

/** Ask for a reason, then roll the project back past approval. */
function openRevisionDialog(p) {
  const scrim = $('div', { class: 'scrim', onclick: e => { if (e.target === scrim) scrim.remove(); } });
  const ta = $('textarea', { placeholder: 'What is wrong with it? e.g. scope omits the north elevation; price does not match the bid',
                             style: 'width:100%;min-height:96px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);resize:vertical' });
  scrim.append($('div', { class: 'sheet' },
    $('div', { class: 'sh' }, $('h2', {}, 'Flag contract for revision'),
      $('button', { class: 'btn', onclick: () => scrim.remove() }, 'Cancel')),
    $('div', { class: 'sb' },
      $('p', { class: 'bs-hint' },
        'This sends the project back to before approval. The bid approval is withdrawn, the contract chain is cleared, '+
        'and the office has to re-approve a bid and generate a new contract. Documents already attached are kept on '+
        'record as superseded — nothing is deleted.'),
      $('div', { class: 'field' }, $('label', {}, 'Reason (required)'), ta),
      $('button', {
        class: 'btn accent',
        onclick: async () => {
          if (!ta.value.trim()) return toast('A reason is required');
          try {
            await api('POST', `/projects/${p.id}/request-revision`, { reason: ta.value });
            scrim.remove();
            await reload('Sent back for revision');
          } catch (e) { toast('Failed: ' + e.message); }
        },
      }, 'Send back for revision'))));
  document.body.append(scrim);
}

/** Full contract chain inside the expanded project. */
function contractChainSection(p) {
  const wrap = $('div', {});
  const done = CONTRACT_CHAIN.filter(s => p[s.keyF]).length;
  CONTRACT_CHAIN.forEach((step, i) => {
    const key = p[step.keyF], name = p[step.nameF];
    const box = $('div', { class: 'bidslot' + (key ? ' win' : '') });
    box.append($('div', { class: 'bs-hd' },
      $('span', { class: 'bs-no' }, `${i + 1}. ${step.label}`),
      $('div', { style: 'flex:1' }),
      $('span', { style: 'font-size:11.5px;color:var(--ink-3)' }, key ? 'attached' : 'not attached')));
    if (key) box.append($('div', { class: 'bs-file' },
      $('span', { class: 'bs-doc' }, '📄'),
      $('a', { href: dl(key, name), target: '_blank', style: 'flex:1' }, name || 'contract'),
      $('a', { class: 'btn sm', href: dl(key, name), download: name || '' }, 'Download')));
    box.append($('div', { class: 'pm-inline', style: 'margin-top:8px' },
      uploadButton(key ? 'Replace' : 'Attach ' + step.label.toLowerCase(), async (file) => {
        try { await uploadContract(p, step.kind, file); await reload('Uploaded'); }
        catch (e) { toast('Upload failed: ' + e.message); }
      }),
      $('span', { style: 'font-size:11.5px;color:var(--ink-3)' }, 'or drop a file here')));
    dropZone(box, async (file) => {
      try { await uploadContract(p, step.kind, file); await reload('Uploaded'); }
      catch (e) { toast('Upload failed: ' + e.message); }
    });
    wrap.append(box);
  });
  wrap.append($('div', { style: 'margin-top:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap' },
    $('button', { class: 'btn danger', onclick: () => openRevisionDialog(p) }, 'Flag for revision'),
    $('span', { style: 'font-size:12.5px;color:var(--ink-3)' },
      'Wrong scope or price? This withdraws approval and sends it back to the office.')));
  return section('Contract', wrap,
    'The signature chain, in order: the office generates the contract, the contractor signs and returns it, then the office countersigns. Drop each version in as it comes back.',
    $('span', { class: 'chip' + (done === 3 ? ' done' : '') }, `${done} of 3`));
}

/** Banner shown while a revision is outstanding, plus the superseded history. */
function revisionSection(p) {
  const wrap = $('div', {});
  wrap.append($('div', { class: 'pm-banner' },
    $('strong', {}, 'Contract sent back for revision'),
    ` by ${p.revisionRequestedBy || 'someone'} on ${when(p.revisionRequestedAt)}.`,
    $('div', { style: 'margin-top:6px' }, p.revisionReason || ''),
    $('div', { style: 'margin-top:6px;font-size:12px' },
      'Approval was withdrawn — the office re-approves a bid and generates a new contract.')));
  (p.supersededContracts || []).slice().reverse().forEach(e => {
    const box = $('div', { class: 'pm-note review', style: 'margin-top:12px' },
      $('div', { class: 'who' }, `${e.by || 'unknown'} · ${when(e.at)}`),
      $('div', {}, e.reason || ''));
    (e.files || []).forEach(fl => box.append($('div', { class: 'bs-file', style: 'margin-top:4px' },
      $('span', { class: 'bs-doc' }, '📄'),
      $('a', { href: dl(fl.fileKey, fl.fileName), target: '_blank' }, fl.fileName || fl.slot),
      $('span', { class: 'bs-sz' }, fl.slot))));
    wrap.append(box);
  });
  return section('Revision requested', wrap, null, $('span', { class: 'chip hold' }, 'Needs office action'));
}

/** Condensed slots shown on the collapsed card so bids can be dropped and
 *  edited without opening the project — PM view only. */
function quickBids(p) {
  const wrap = $('div', { class: 'pm-quick' });
  SLOTS_OF(p).slice(0, 3).forEach(slot => {
    const b = bidOf(p, slot);
    const files = filesOf(b);
    const cell = $('div', { class: 'pm-qslot' + (files.length ? ' filled' : '') + (b.approved ? ' win' : '') });
    cell.append($('div', { class: 'pm-qhd' }, 'Bid ' + (slot + 1),
      b.approved ? $('span', { class: 'chip done', style: 'font-size:10px;padding:1px 6px' }, '✓') : null));

    const nameI = $('input', { type: 'text', placeholder: 'Contractor', value: b.contractor || '' });
    const amtI = $('input', { type: 'number', step: '1', placeholder: 'Amount', value: b.amount == null ? '' : String(b.amount) });
    const save = async () => {
      try { await api('PATCH', `/projects/${p.id}/bids/${slot}`, { contractor: nameI.value, amount: amtI.value }); await reload('Bid saved'); }
      catch (e) { toast('Failed: ' + e.message); }
    };
    nameI.addEventListener('change', save);
    amtI.addEventListener('change', save);
    // Clicks inside must not toggle the card open/closed.
    [nameI, amtI].forEach(i => i.addEventListener('click', e => e.stopPropagation()));

    const inp = $('input', { type: 'file', style: 'display:none' });
    inp.addEventListener('change', async () => {
      const f = inp.files[0]; inp.value = '';
      if (!f) return;
      try { await uploadBidFile(p, slot, f, files.length ? 'doc' : 'scope', nameI.value, amtI.value); await reload('Uploaded'); }
      catch (e) { toast('Upload failed: ' + e.message); }
    });

    // File line sits directly under the header. When empty the drop target is
    // itself the click-to-browse control, which removes the separate Attach
    // button and takes a row out of every unfilled slot.
    cell.append(files.length
      ? $('a', { class: 'pm-qfile', href: dl(files[0].fileKey, files[0].fileName), target: '_blank',
                 title: files[0].fileName, onclick: e => e.stopPropagation() }, '📄 ' + (files[0].fileName || 'bid'))
      : $('button', { class: 'pm-qdrop', title: 'Click to browse, or drop a file here',
                      onclick: e => { e.stopPropagation(); inp.click(); } }, '⇪ drop scope & cost'));
    cell.append(inp, nameI, amtI);
    if (files.length) {
      cell.append($('button', {
        class: 'btn ghost sm', style: 'width:100%',
        onclick: e => { e.stopPropagation(); inp.click(); },
      }, '＋ Add file'));
    }

    dropZone(cell, async (file) => {
      try { await uploadBidFile(p, slot, file, files.length ? 'doc' : 'scope', nameI.value, amtI.value); await reload('Uploaded'); }
      catch (e) { toast('Upload failed: ' + e.message); }
    });
    cell.addEventListener('click', e => e.stopPropagation());
    wrap.append(cell);
  });
  return wrap;
}

/* ---------- schedule ----------
   Start/end dates are how a PM reports that work is actually moving, so they sit
   in their own section rather than buried in the edit form. */
function scheduleSection(p) {
  const wrap = $('div', {});
  const startI = $('input', { type: 'date', value: p.plannedStart || '' });
  const endI = $('input', { type: 'date', value: p.plannedEnd || '' });
  const save = async () => {
    try { await api('PATCH', `/projects/${p.id}`, { plannedStart: startI.value, plannedEnd: endI.value }); await reload('Dates saved'); }
    catch (e) { toast('Failed: ' + e.message); }
  };
  startI.addEventListener('change', save);
  endI.addEventListener('change', save);
  wrap.append($('div', { class: 'pm-two' },
    $('div', { class: 'field', style: 'margin:0' }, $('label', {}, 'Start date'), startI),
    $('div', { class: 'field', style: 'margin:0' }, $('label', {}, 'Expected completion'), endI)));
  if (p.plannedStart && p.plannedEnd && p.plannedEnd < p.plannedStart) {
    wrap.append($('div', { style: 'font-size:12px;color:var(--rust);margin-top:8px' }, 'End date is before the start date.'));
  }
  return section('Schedule', wrap);
}

/* ---------- notes + log ---------- */

function noteSection(p) {
  const wrap = $('div', {});
  (p.progressNotes || []).slice().reverse().forEach(n => {
    const isReview = /awaiting review/i.test(n.note || '');
    const box = $('div', { class: 'pm-note' + (isReview ? ' review' : '') },
      $('div', { class: 'who' }, `${n.username || 'Unknown'} · ${n.date || when(n.ts)}`),
      $('div', {}, n.note));
    (n.files || []).forEach(f => box.append($('div', { class: 'bs-file', style: 'margin-top:4px' },
      $('span', { class: 'bs-doc' }, '📄'),
      $('a', { href: dl(f.fileKey, f.fileName), target: '_blank' }, f.fileName || 'file'),
      $('span', { class: 'bs-sz' }, kb(f.fileSize)))));
    wrap.append(box);
  });
  if (!(p.progressNotes || []).length) {
    wrap.append($('div', { style: 'font-size:13px;color:var(--ink-3);margin-bottom:12px' }, 'No notes yet.'));
  }
  const ta = $('textarea', { placeholder: 'Add a note — what happened, what is next…',
                             style: 'width:100%;min-height:78px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);resize:vertical' });
  wrap.append(ta, $('div', { style: 'margin-top:9px' },
    $('button', {
      class: 'btn accent',
      onclick: async () => {
        if (!ta.value.trim()) return toast('Write something first');
        try { await api('POST', `/projects/${p.id}/note`, { note: ta.value }); ta.value = ''; await reload('Note added'); }
        catch (e) { toast('Failed: ' + e.message); }
      },
    }, 'Add note')));
  return section('Notes & activity', wrap, null,
    p.reviewRequestedAt ? $('span', { class: 'chip' }, 'Awaiting RM review') : null);
}

async function logSection(p) {
  const holder = $('div', {}, $('div', { style: 'font-size:13px;color:var(--ink-3)' }, 'Loading…'));
  const panel = section('Project log', holder, 'Every change to this project, newest first.');
  try {
    const rows = await api('GET', `/projects/${p.id}/log`);
    holder.innerHTML = '';
    if (!rows.length) holder.append($('div', { style: 'font-size:13px;color:var(--ink-3)' }, 'Nothing recorded yet.'));
    rows.forEach(r => holder.append($('div', { class: 'pm-log' },
      $('div', { class: 'who' }, `${r.username || 'unknown'} · ${when(r.ts)}`),
      $('div', {}, r.summary))));
  } catch (e) {
    holder.innerHTML = '';
    holder.append($('div', { style: 'font-size:13px;color:var(--rust)' }, 'Could not load the log: ' + e.message));
  }
  return panel;
}

/* ---------- project row ----------
   A .panel per project. The .ph header is the click target, matching how the
   main UI builds every card. */

function projectCard(p) {
  const card = $('div', { class: 'panel pm-row' });
  const open = VIEW.open === p.id;
  const meta = [
    p.property, p.category,
    // Most existing projects carry the awarded contractor on the project record
    // itself rather than as a bid row — show it either way.
    p.contractor || null,
    p.anticipatedCost != null ? 'est ' + usd(p.anticipatedCost) : null,
    // Surface the schedule on ongoing work so the list answers "when" at a glance.
    p.plannedStart || p.plannedEnd ? `${p.plannedStart || '?'} → ${p.plannedEnd || '?'}` : null,
  ].filter(Boolean).join('  ·  ');

  card.append($('div', {
    class: 'ph',
    onclick: () => { VIEW.open = open ? null : p.id; render(); },
  },
    $('span', { class: 'chev', style: 'color:var(--ink-3);font-size:11px' }, open ? '▾' : '▸'),
    $('span', { class: 'pl-dot', style: 'background:' + pcolor(p.property) }),
    $('div', { style: 'min-width:0;flex:1' },
      $('div', { class: 'pm-title' }, p.name),
      $('div', { class: 'pm-meta' }, meta)),
    statusChip(p)));

  // Three drop-in slots straight on the list row — no need to open the project.
  // Before approval they're the bid slots; once the office approves a bid the
  // project is in execution and they become the signature chain. Hidden when the
  // card is open (full sections take over), on completed work, and on notes.
  const isNote = phase(p) === 'note';
  if (!open && !isNote && !(p.steps && p.steps.completed)) {
    card.append(inExecution(p) ? quickContract(p) : quickBids(p));
  }

  if (!open) return card;

  const body = $('div', { class: 'pad', style: 'border-top:1px solid var(--line-2);background:var(--canvas)' });

  // Overview: description + the PM's own estimate (same column the office reads).
  const estI = $('input', { type: 'number', step: '1', value: p.anticipatedCost == null ? '' : String(p.anticipatedCost), placeholder: 'Anticipated cost ($)' });
  const overview = $('div', {});
  if (p.description) overview.append($('p', { class: 'bs-hint' }, p.description));
  // Awarded contractor + date live on the project record. Read-only here: the
  // office sets the contractor when it approves a bid.
  const facts = [
    ['Contractor', p.contractor || '—'],
    ['Added', p.dateAdded || '—'],
  ];
  overview.append($('div', { class: 'pm-two', style: 'margin-bottom:13px' },
    ...facts.map(([k, v]) => $('div', {},
      $('div', { style: 'font-size:11.5px;font-weight:600;color:var(--ink-2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px' }, k),
      $('div', { style: 'font-size:13.5px' + (v === '—' ? ';color:var(--ink-3)' : '') }, v)))));
  overview.append($('div', { class: 'field', style: 'margin:0' },
    $('label', {}, 'Your estimate'),
    $('div', { class: 'pm-inline' }, estI,
      $('button', {
        class: 'btn sm',
        onclick: async () => {
          try { await api('PATCH', `/projects/${p.id}`, { anticipatedCost: estI.value }); await reload('Estimate saved'); }
          catch (e) { toast('Failed: ' + e.message); }
        },
      }, 'Save'))));
  if (p.revisionRequestedAt) body.append(revisionSection(p));
  body.append(section('Overview', overview));

  // Bids matter before approval; after it the contract chain and the schedule do.
  // Both stay reachable either way — an approved project still shows what was bid.
  if (inExecution(p)) body.append(contractChainSection(p), scheduleSection(p), bidSection(p));
  else body.append(bidSection(p), scheduleSection(p));
  body.append(stepsPanel(p), noteSection(p));
  const logHolder = $('div', {});
  body.append(logHolder);
  logSection(p).then(el => logHolder.append(el));
  card.append(body);
  return card;
}

/* ---------- new project ---------- */

function openNewProject() {
  const scrim = $('div', { class: 'scrim', onclick: e => { if (e.target === scrim) scrim.remove(); } });
  const sel = $('select', {}, ME.sites.map(c => $('option', { value: c }, c)));
  const cat = $('select', {}, S.categories.map(c => $('option', { value: c }, c)));
  cat.value = 'GENERAL';
  const name = $('input', { type: 'text', placeholder: 'e.g. Replace clubhouse roof' });
  const desc = $('textarea', { placeholder: 'What needs doing and why' });
  const cost = $('input', { type: 'number', step: '1', placeholder: 'Your best estimate' });
  const notes = $('textarea', { placeholder: 'Anything the office should know' });

  scrim.append($('div', { class: 'sheet' },
    $('div', { class: 'sh' }, $('h2', {}, 'New project'),
      $('button', { class: 'btn', onclick: () => scrim.remove() }, 'Cancel')),
    $('div', { class: 'sb' },
      $('div', { class: 'pm-two' },
        $('div', { class: 'field' }, $('label', {}, 'Site'), sel),
        $('div', { class: 'field' }, $('label', {}, 'Category'), cat)),
      $('div', { class: 'field' }, $('label', {}, 'Project name'), name),
      $('div', { class: 'field' }, $('label', {}, 'Description'), desc),
      $('div', { class: 'field' }, $('label', {}, 'Anticipated cost'), cost),
      $('div', { class: 'field' }, $('label', {}, 'Notes'), notes),
      $('div', { style: 'font-size:12.5px;color:var(--ink-3);margin-bottom:14px' },
        'Add bids after creating it. Once three are attached you can submit for review.'),
      $('button', {
        class: 'btn accent',
        onclick: async () => {
          if (!name.value.trim()) return toast('Give the project a name');
          try {
            const r = await api('POST', '/projects', {
              property: sel.value, category: cat.value, name: name.value,
              description: desc.value, anticipatedCost: cost.value, notes: notes.value,
            });
            scrim.remove();
            VIEW.open = r.id;
            await reload('Project created');
          } catch (e) { toast('Failed: ' + e.message); }
        },
      }, 'Create project'))));
  document.body.append(scrim);
}

/* ---------- notes ----------
   A note is a project with no cost. Keeping it that way means notes land in the
   office's existing NOTES group, and "plug in a cost" is all it takes to promote
   one into a real project — no separate concept to reconcile. */
function noteComposer() {
  const site = $('select', {}, ME.sites.map(c => $('option', { value: c }, c)));
  const name = $('input', { type: 'text', placeholder: 'Jot something down — e.g. flat top roof repair' });
  const add = async () => {
    if (!name.value.trim()) return toast('Give the note a title');
    try {
      await api('POST', `/properties/${encodeURIComponent(site.value)}/note`, { name: name.value });
      name.value = '';
      await reload('Note added');
    } catch (e) { toast('Failed: ' + e.message); }
  };
  name.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  // On a property page the site is already decided — preselect and hide it.
  if (VIEW.view === 'property' && VIEW.prop) site.value = VIEW.prop;
  if (ME.sites.length === 1 || (VIEW.view === 'property' && VIEW.prop)) site.style.display = 'none';
  const row = $('div', { class: 'pm-inline' },
    ME.sites.length > 1 ? $('div', { style: 'flex:0 0 120px' }, site) : site,
    name, $('button', { class: 'btn accent', onclick: add }, 'Add note'));
  return section('Add a note', row,
    'Notes carry no cost. Plug a cost in later and it becomes a planned project.');
}

/* ---------- site picker ---------- */

async function openSitePicker(firstRun) {
  const { sites, mine } = await api('GET', '/sites');
  const chosen = new Set(mine);
  const scrim = $('div', { class: 'scrim', onclick: e => { if (e.target === scrim && !firstRun) scrim.remove(); } });
  const list = $('div', {});
  let region = null;
  sites.forEach(s => {
    if (s.region !== region) {
      region = s.region;
      list.append($('div', { style: 'font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);font-weight:600;margin:14px 0 4px' }, region || 'Other'));
    }
    const cb = $('input', { type: 'checkbox', style: 'width:auto' });
    cb.checked = chosen.has(s.code);
    cb.addEventListener('change', () => cb.checked ? chosen.add(s.code) : chosen.delete(s.code));
    list.append($('label', { style: 'display:flex;align-items:center;gap:10px;padding:6px 0;cursor:pointer' },
      cb, $('span', { style: 'font-weight:600' }, s.code), $('span', { style: 'color:var(--ink-3);font-size:13px' }, s.name || '')));
  });

  scrim.append($('div', { class: 'sheet' },
    $('div', { class: 'sh' }, $('h2', {}, firstRun ? 'Choose the sites you cover' : 'My sites'),
      firstRun ? null : $('button', { class: 'btn', onclick: () => scrim.remove() }, 'Cancel')),
    $('div', { class: 'sb' },
      $('div', { style: 'font-size:13px;color:var(--ink-3);margin-bottom:6px' },
        'You will only see projects for these sites. This is remembered for next time — change it any time from the header.'),
      list,
      $('div', { style: 'margin-top:16px' },
        $('button', {
          class: 'btn accent',
          onclick: async () => {
            try {
              await api('PATCH', '/sites', { sites: [...chosen] });
              scrim.remove();
              await reload('Sites saved');
            } catch (e) { toast('Failed: ' + e.message); }
          },
        }, 'Save sites')))));
  document.body.append(scrim);
}

/* ---------- buckets ---------- */

/** Split a project list into the tracker's phase groups. Used by the rail
 *  counts, the dashboard tiles and the list view, so they can never disagree. */
function bucketize(list) {
  return {
    active: list.filter(p => !p.reviewRequestedAt && ['active', 'paid', 'discussed'].includes(phase(p))),
    review: list.filter(p => p.reviewRequestedAt && phase(p) !== 'done'),
    note:   list.filter(p => phase(p) === 'note' && !p.reviewRequestedAt && !p.revisionRequestedAt),
    done:   list.filter(p => ['done', 'hold'].includes(phase(p))),
  };
}
const TABS = [['active', 'In progress'], ['review', 'Awaiting RM review'], ['note', 'Notes'], ['done', 'Complete']];
const forSite = code => S.projects.filter(p => p.property === code);

/* ---------- rail ----------
   The tracker's left nav, same markup and classes: brand, grouped nav buttons
   with per-property dots and counts, and a foot with the theme toggle. */

function railCol() {
  const rail = $('div', { class: 'rail' + (VIEW.railOpen ? ' open' : '') });
  rail.append($('div', { class: 'brand' },
    $('div', { class: 'mark' },
      $('div', { class: 'glyph' }, 'SP'),
      $('div', {},
        $('h1', {}, 'Site Projects'),
        $('div', { class: 'sub' }, 'Property manager')))));

  const nav = $('div', { class: 'nav' });
  const b = S.projects.length ? bucketize(S.projects) : { active: [], review: [], note: [], done: [] };
  const item = (view, tab, prop, ic, label, ct) => {
    const on = VIEW.view === view && VIEW.tab === (tab || VIEW.tab) && VIEW.prop === (prop || null);
    const btn = $('button', {
      class: on ? 'on' : '',
      onclick: () => { VIEW.view = view; if (tab) VIEW.tab = tab; VIEW.prop = prop || null; VIEW.open = null; VIEW.railOpen = false; render(); },
    }, $('span', { class: 'ic' }, ic), $('span', {}, label));
    if (ct != null) btn.append($('span', { class: 'ct' }, String(ct)));
    return btn;
  };

  nav.append($('div', { class: 'grp' }, 'Overview'));
  nav.append(item('dashboard', null, null, '◧', 'Dashboard'));
  nav.append(item('list', 'active', null, '▤', 'In progress', b.active.length));
  nav.append(item('list', 'review', null, '⏳', 'Awaiting review', b.review.length || null));
  nav.append(item('list', 'note', null, '✎', 'Notes', b.note.length || null));
  nav.append(item('list', 'done', null, '✓', 'Complete', b.done.length || null));

  nav.append($('div', { class: 'grp' }, 'My sites'));
  (ME.sites || []).slice().sort().forEach(code => {
    const prop = S.properties.find(x => x.code === code) || {};
    const open = bucketize(forSite(code)).active.length;
    const btn = $('button', {
      class: VIEW.view === 'property' && VIEW.prop === code ? 'on' : '',
      onclick: () => { VIEW.view = 'property'; VIEW.prop = code; VIEW.open = null; VIEW.railOpen = false; render(); },
    },
      $('span', { class: 'ic', style: 'color:' + pcolor(code) }, '●'),
      $('span', {}, code),
      $('span', { class: 'ct' }, String(open)));
    nav.append(btn);
  });
  nav.append($('button', { onclick: () => openSitePicker(false) },
    $('span', { class: 'ic' }, '⚙'), $('span', {}, 'Edit my sites')));

  const foot = $('div', { class: 'foot' },
    $('div', { class: 'row', style: 'margin-bottom:6px' },
      $('span', {}, 'Signed in as'),
      $('span', { class: 'mono', title: ME.username,
                  style: 'max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' },
        ME.username || '—')),
    $('button', {
      class: 'theme-toggle', style: 'margin-bottom:6px',
      onclick: async () => { await fetch('/api/logout', { method: 'POST' }); location.href = '/'; },
    }, '⎋  Sign out'),
    $('button', { class: 'theme-toggle', onclick: toggleTheme }, isDark() ? '☀  Light mode' : '🌙  Dark mode'));

  rail.append(nav, foot);
  return rail;
}

/* ---------- dashboard ----------
   High-level only: what needs the PM's attention, then a card per site. No
   budgets or variance — the same rule as the rest of this view. */

function dashboardView(content) {
  const b = bucketize(S.projects);
  const awaitingBids = b.active.filter(p => !inExecution(p) && readyCount(p) < 3);
  const inFlight = b.active.filter(inExecution);
  const unsigned = inFlight.filter(p => !p.executedFileKey);

  const tile = (label, value, tone, sub) => $('div', { class: 'hstat tone-' + (tone || 'none') },
    $('div', { class: 'hs-lab' }, label),
    $('div', { class: 'hs-val' }, String(value)),
    sub ? $('div', { class: 'hs-sub' }, sub) : null);

  content.append($('div', { class: 'headstats', style: 'margin-bottom:18px' },
    tile('Open projects', b.active.length, 'none', `${ME.sites.length} site${ME.sites.length === 1 ? '' : 's'}`),
    tile('Need bids', awaitingBids.length, awaitingBids.length ? 'warn' : 'good', 'fewer than 3 attached'),
    tile('Awaiting RM review', b.review.length, b.review.length ? 'warn' : 'none', 'submitted to the office'),
    tile('In execution', inFlight.length, 'none', 'bid approved'),
    tile('Unsigned contracts', unsigned.length, unsigned.length ? 'warn' : 'good', 'no countersigned copy'),
    tile('Notes', b.note.length, 'none', 'no cost yet')));

  // What to do next — the only actionable list on the dashboard.
  if (awaitingBids.length || b.review.length) {
    const needs = $('div', {});
    awaitingBids.slice(0, 8).forEach(p => needs.append(rowLink(p, `${readyCount(p)} of 3 bids attached`)));
    b.review.slice(0, 8).forEach(p => needs.append(rowLink(p, 'waiting on the office')));
    content.append(section('Needs attention', needs));
  }

  const grid = $('div', { class: 'pm-sites' });
  (ME.sites || []).slice().sort().forEach(code => {
    const prop = S.properties.find(x => x.code === code) || {};
    const sb = bucketize(forSite(code));
    const card = $('div', { class: 'pm-site', onclick: () => { VIEW.view = 'property'; VIEW.prop = code; render(); } });
    card.append($('div', { class: 'hd' },
      $('span', { class: 'pl-dot', style: 'background:' + pcolor(code) }),
      $('div', {}, $('div', { class: 'nm' }, code), $('div', { class: 'sub' }, prop.name || ''))));
    const rows = $('div', { class: 'rows' });
    [['In progress', sb.active.length, false], ['Awaiting review', sb.review.length, !sb.review.length],
     ['Notes', sb.note.length, !sb.note.length], ['Complete', sb.done.length, !sb.done.length]]
      .forEach(([k, v, muted]) => rows.append($('div', { class: 'r' + (muted ? ' muted' : '') },
        $('span', {}, k), $('span', {}, String(v)))));
    card.append(rows);
    grid.append(card);
  });
  content.append(section('My sites', grid));
}

/** Compact clickable line used by the dashboard's attention list. */
function rowLink(p, why) {
  return $('div', {
    class: 'pm-log', style: 'cursor:pointer;border-left-color:var(--wheat)',
    onclick: () => { VIEW.view = 'property'; VIEW.prop = p.property; VIEW.open = p.id; render(); },
  },
    $('div', { class: 'who' }, `${p.property} · ${why}`),
    $('div', { style: 'font-weight:600' }, p.name));
}

/* ---------- shell ---------- */

function render() {
  root.innerHTML = '';
  // Below 820px styles.css parks .rail off-canvas; the burger in the topbar and
  // this tap-away scrim drive it, matching the main tracker's behaviour.
  root.className = 'app' + (VIEW.railOpen ? ' rail-open' : '');
  root.append(railCol());
  if (VIEW.railOpen) {
    root.append($('div', { class: 'scrim-nav', onclick: () => { VIEW.railOpen = false; render(); } }));
  }

  const main = $('div', { class: 'main' });
  root.append(main);

  const onProp = VIEW.view === 'property' && VIEW.prop;
  const prop = onProp ? (S.properties.find(x => x.code === VIEW.prop) || {}) : null;
  const title = VIEW.view === 'dashboard' ? 'Dashboard'
              : onProp ? (prop.name || VIEW.prop)
              : (TABS.find(t => t[0] === VIEW.tab) || [, 'Projects'])[1];

  main.append($('div', { class: 'topbar' },
    $('button', { class: 'btn ghost sm burger', title: 'Menu',
                  onclick: () => { VIEW.railOpen = !VIEW.railOpen; render(); } }, '☰'),
    $('div', { class: 'tt' },
      $('div', { class: 'crumb' }, onProp ? VIEW.prop : 'Site Projects'),
      $('h2', {}, title)),
    $('div', { class: 'sp' }),
    $('div', { class: 'tb-actions' },
      $('button', { class: 'btn accent', onclick: openNewProject }, '+ New project'))));

  const content = $('div', { class: 'content' });
  main.append(content);

  if (!ME.sites || !ME.sites.length) {
    content.append($('div', { class: 'pm-empty' }, 'No sites selected yet.'));
    return;
  }
  if (VIEW.view === 'dashboard') { dashboardView(content); return; }

  // Property view scopes to one site; list view spans them all.
  const scope = onProp ? forSite(VIEW.prop) : S.projects;
  const buckets = bucketize(scope);

  const seg = $('div', { class: 'seg-ctl', style: 'margin-bottom:18px' });
  TABS.forEach(([k, label]) => seg.append($('button', {
    class: VIEW.tab === k ? 'on' : '',
    onclick: () => { VIEW.tab = k; render(); },
  }, `${label} (${buckets[k].length})`)));
  content.append(seg);

  if (VIEW.tab === 'note') content.append(noteComposer());

  const list = buckets[VIEW.tab] || [];
  if (!list.length) {
    content.append($('div', { class: 'pm-empty' },
      VIEW.tab === 'note' ? 'No notes yet — jot one down above.' : 'Nothing here yet.'));
  }
  if (onProp) {
    list.forEach(p => content.append(projectCard(p)));
  } else {
    // Group by site so a PM covering several properties can scan them apart.
    const bySite = {};
    list.forEach(p => (bySite[p.property] = bySite[p.property] || []).push(p));
    Object.keys(bySite).sort().forEach(code => {
      const pr = S.properties.find(x => x.code === code) || {};
      content.append($('div', { style: 'display:flex;align-items:center;gap:8px;margin:20px 0 9px' },
        $('span', { class: 'pl-dot', style: 'background:' + pcolor(code) }),
        $('span', { style: 'font-weight:600;font-size:13px' }, code),
        pr.name ? $('span', { style: 'color:var(--ink-3);font-size:12.5px' }, pr.name) : null));
      bySite[code].forEach(p => content.append(projectCard(p)));
    });
  }
}

/* ---------- boot ---------- */

(async function boot() {
  let st;
  try { st = await (await fetch('/api/auth/status')).json(); } catch { st = { authed: false }; }
  if (!st.authed) { location.href = '/'; return; }
  if (st.role !== 'pm' && st.role !== 'admin') {
    // Name the account and role — "this view is for PMs" gives no clue that the
    // real cause is usually being signed in under a name that isn't on the roster.
    root.append($('div', { class: 'content' },
      section('Not a property-manager account', $('div', {},
        $('p', { style: 'margin-top:0' },
          'You are signed in as ', $('strong', {}, st.username || '(no name)'),
          ', which resolves to the ', $('strong', {}, st.role || 'user'), ' role. ',
          'The property-manager view is limited to accounts with the PM role.'),
        $('p', { style: 'color:var(--ink-3);font-size:12.5px' },
          'Usernames are matched loosely on letters only, so "T" and "Troy Steiss" are different '+
          'accounts. If you meant to sign in as an admin, sign out and use your full name. '+
          'Otherwise an admin can set this account to Property manager in Settings → Users & roles.'),
        $('div', { class: 'pm-inline', style: 'margin-top:14px' },
          $('a', { class: 'btn accent', href: '/' }, 'Go to the main tracker'),
          $('button', {
            class: 'btn',
            onclick: async () => { await fetch('/api/logout', { method: 'POST' }); location.href = '/'; },
          }, 'Sign out and switch account'))))));
    return;
  }
  try {
    await reload();
  } catch (e) {
    root.append($('div', { class: 'pm-empty' }, 'Could not load: ' + e.message));
    return;
  }
  if (!ME.sites.length) openSitePicker(true);   // first run — must pick before anything shows
})();
