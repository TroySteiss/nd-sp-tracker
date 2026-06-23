import { readFileSync, writeFileSync } from 'node:fs';

let s = readFileSync('scripts/app.raw.js', 'utf8');

function rep(find, replace, { optional = false } = {}) {
  if (!s.includes(find)) {
    if (optional) { console.warn('OPTIONAL anchor not found:', find.slice(0, 60)); return; }
    throw new Error('Anchor NOT FOUND: ' + find.slice(0, 80));
  }
  s = s.replace(find, replace);
}
function repBetween(startMarker, endMarker, replace) {
  const i = s.indexOf(startMarker);
  const j = s.indexOf(endMarker, i + startMarker.length);
  if (i < 0 || j < 0) throw new Error('repBetween markers not found: ' + startMarker.slice(0, 40));
  s = s.slice(0, i) + replace + s.slice(j);
}

/* ---------- (a) Store (localStorage) -> API client ---------- */
const storeBlock = `const KEY='nd_sp_tracker_v1';
const Store={
  async load(){
    try{ if(window.storage){const r=await window.storage.get(KEY); if(r&&r.value) return JSON.parse(r.value);} }catch(e){}
    try{ const ls=localStorage.getItem(KEY); if(ls) return JSON.parse(ls); }catch(e){}
    return null;
  },
  async save(state){
    const s=JSON.stringify(state);
    let ok=false;
    try{ if(window.storage){await window.storage.set(KEY,s); ok=true;} }catch(e){}
    if(!ok){ try{ localStorage.setItem(KEY,s); ok=true; }catch(e){} }
    return ok;
  }
};`;
rep(storeBlock, `/* ---------- API client (replaces localStorage Store; data now lives in Postgres) ---------- */
const API={
  async get(path){ const r=await fetch('/api'+path,{headers:{'Accept':'application/json'}}); if(r.status===401){showLogin();throw new Error('unauthorized');} if(!r.ok)throw new Error(await r.text()); return r.json(); },
  async send(method,path,body){ const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json'},body:body!=null?JSON.stringify(body):undefined}); if(r.status===401){showLogin();throw new Error('unauthorized');} if(!r.ok){ let msg; try{msg=(await r.json()).error;}catch(e){ msg='request failed'; } throw new Error(msg||'request failed'); } return r.json(); }
};
async function refreshState(){ S=await API.get('/state'); S.cashAdjustments=S.cashAdjustments||[]; S.gl=S.gl||[]; S.projects=S.projects||[]; S.cash=S.cash||{}; S.meta=S.meta||{}; }`);

/* ---------- (b) seedState removed ---------- */
rep(`function seedState(){ return JSON.parse($('#seed-data').textContent); }`,
    `/* seedState removed — initial data is seeded server-side into Postgres */`);

/* ---------- (c) boot + persist + commit -> API boot + per-record save helpers + login ---------- */
repBetween('async function boot(){', '\n/* ---------- Derived ---------- */', `async function boot(){ await refreshState(); render(); }
function commit(msg){ render(); if(msg) toast(msg); }
async function afterWrite(msg){ try{ await refreshState(); }catch(e){} render(); if(msg) toast(msg); }
function cleanBids(p){ return (p.bids||[]).map(b=>({id:b.id,contractor:b.contractor||'',amount:b.amount==null?null:b.amount,approved:!!b.approved,fileKey:b.fileKey||null,fileName:b.fileName||null,fileSize:b.fileSize||null})); }
async function saveProject(p,msg,isNew){
  const payload={...p,bids:cleanBids(p)};
  try{
    if(isNew||!S.projects.find(x=>x.id===p.id)){ await API.send('POST','/projects',payload); }
    else { await API.send('PATCH','/projects/'+p.id,payload); }
    await afterWrite(msg);
  }catch(e){ toast('Save failed: '+e.message); }
}
async function deleteProject(id){ try{ await API.send('DELETE','/projects/'+id); await afterWrite('Project deleted'); }catch(e){ toast('Delete failed: '+e.message); } }
async function linkGl(g,msg){ try{ await API.send('PATCH','/gl/'+g.id+'/link',{linkedProjectId:g.linkedProjectId||null,partial:!!g.partial}); await afterWrite(msg); }catch(e){ toast('Failed: '+e.message); } }
async function saveMatch(g,pr,msg){ try{ await API.send('PATCH','/projects/'+pr.id,{...pr,bids:cleanBids(pr)}); await API.send('PATCH','/gl/'+g.id+'/link',{linkedProjectId:g.linkedProjectId||null,partial:!!g.partial}); await afterWrite(msg); }catch(e){ toast('Failed: '+e.message); } }
async function addAdj(a){ try{ await API.send('POST','/cash-adjustments',a); await afterWrite('Adjustment recorded'); }catch(e){ toast('Failed: '+e.message); } }
async function delAdj(id){ try{ await API.send('DELETE','/cash-adjustments/'+id); await afterWrite('Adjustment removed'); }catch(e){ toast('Failed: '+e.message); } }
async function saveCash(code,obj,msg){ try{ await API.send('PATCH','/cash/'+code,obj); await afterWrite(msg||'Cash updated'); }catch(e){ toast('Failed: '+e.message); } }
async function resetSeed(){ try{ await API.send('POST','/reset'); await afterWrite('Reset to starter data'); }catch(e){ toast('Failed: '+e.message); } }
async function restoreBackup(state){ try{ await API.send('POST','/restore',state); await afterWrite('Backup restored'); }catch(e){ toast('That file is not a valid backup.'); } }
/* ---------- login (shared password) ---------- */
function showLogin(){ const o=document.getElementById('login'); if(o)o.style.display='flex'; }
function hideLogin(){ const o=document.getElementById('login'); if(o)o.style.display='none'; }
async function start(){
  const form=document.getElementById('login-form');
  if(form&&!form._wired){ form._wired=true; form.addEventListener('submit',async ev=>{
    ev.preventDefault();
    const pw=document.getElementById('login-pw').value;
    const err=document.getElementById('login-err'); err.textContent='';
    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});
    if(r.ok){ hideLogin(); await boot(); } else { err.textContent='Incorrect password.'; }
  }); }
  try{ const st=await fetch('/api/auth/status').then(r=>r.json()); if(st.authed){ hideLogin(); await boot(); } else { showLogin(); } }
  catch(e){ showLogin(); }
}`);

/* ---------- (d) project modal save + delete ---------- */
rep(`    const i=S.projects.findIndex(x=>x.id===p.id);
    if(i<0)S.projects.push(p); else S.projects[i]=p;
    close(); commit(isNew?'Project added':'Project saved');`,
    `    close(); saveProject(p, isNew?'Project added':'Project saved', isNew);`);
rep(`  function del(){ S.projects=S.projects.filter(x=>x.id!==p.id); close(); commit('Project deleted'); }`,
    `  function del(){ close(); deleteProject(p.id); }`);

/* ---------- (e) pin toggle ---------- */
rep(`onclick:e=>{e.stopPropagation();pr.pinned=!pr.pinned;commit(pr.pinned?'Pinned':'Unpinned');}`,
    `onclick:e=>{e.stopPropagation();pr.pinned=!pr.pinned;saveProject(pr,pr.pinned?'Pinned':'Unpinned');}`);

/* ---------- (f) GL unlink + match ---------- */
rep(`onclick:()=>{g.linkedProjectId=null;g.partial=false;commit('Unlinked');}`,
    `onclick:()=>{g.linkedProjectId=null;g.partial=false;linkGl(g,'Unlinked');}`);
rep(`    scrim.remove(); commit('Ledger line matched');`,
    `    scrim.remove(); saveMatch(g,pr,'Ledger line matched');`);

/* ---------- (g) cash adjustments ---------- */
rep(`onclick:()=>{S.cashAdjustments=S.cashAdjustments.filter(x=>x.id!==a.id);commit('Adjustment removed');}`,
    `onclick:()=>{delAdj(a.id);}`);
rep(`onclick:()=>{if(a.amount==null){toast('Enter an amount.');return;}S.cashAdjustments.push(a);scrim.remove();commit('Adjustment recorded');}`,
    `onclick:()=>{if(a.amount==null){toast('Enter an amount.');return;}scrim.remove();addAdj(a);}`);

/* ---------- (h) reset to seed ---------- */
rep(`if(confirm('Reset everything to the bundled starter data? Your current changes will be lost.')){S=seedState();commit('Reset to starter data');}`,
    `if(confirm('Reset everything to the seeded starter data? This affects ALL users and cannot be undone.')){resetSeed();}`);

/* ---------- (i) upload panel wiring: pass kind instead of handler ---------- */
rep(`    handleGL, S.meta.glPeriod?\`Loaded · \${S.meta.glPeriod} · \${S.gl.length} lines\`:'No GL loaded'));`,
    `    'gl', S.meta.glPeriod?\`Loaded · \${S.meta.glPeriod} · \${S.gl.length} lines\`:'No GL loaded'));`);
rep(`    handleCushion, S.meta.cashAsOf?\`Loaded · as of \${S.meta.cashAsOf}\`:'No cushion loaded'));`,
    `    'cushion', S.meta.cashAsOf?\`Loaded · as of \${S.meta.cashAsOf}\`:'No cushion loaded'));`);
rep(`function uploadPanel(title,tag,desc,handler,status){`, `function uploadPanel(title,tag,desc,kind,status){`);
rep(`onchange:e=>{if(e.target.files[0])readXlsx(e.target.files[0],handler);}`,
    `onchange:e=>{if(e.target.files[0])uploadImport(e.target.files[0],kind);}`);
rep(`const f=e.dataTransfer.files[0];if(f)readXlsx(f,handler);`,
    `const f=e.dataTransfer.files[0];if(f)uploadImport(f,kind);`);

/* ---------- (j) readXlsx -> uploadImport ---------- */
rep(`function readXlsx(file,handler){
  const fr=new FileReader();
  fr.onload=e=>{
    try{ const wb=XLSX.read(e.target.result,{type:'array',cellDates:true}); handler(wb,file.name); }
    catch(err){ console.error(err); toast('Could not read that file. Is it a valid .xlsx?'); }
  };
  fr.readAsArrayBuffer(file);
}`, `async function uploadImport(file,kind){
  if(!file)return;
  const fd=new FormData(); fd.append('file',file);
  toast('Uploading…');
  try{
    const r=await fetch('/api/import/'+kind,{method:'POST',body:fd});
    if(!r.ok){ let msg; try{msg=(await r.json()).error;}catch(e){ msg='Could not read that file.'; } toast(msg||'Could not read that file.'); return; }
    const data=await r.json();
    if(kind==='gl') glPreview(data); else cushionPreview(data);
  }catch(e){ toast('Upload failed: '+e.message); }
}`);

/* ---------- (k) handleGL..cushionPreview -> API preview/confirm modals ---------- */
repBetween('function handleGL(wb){', 'function exportBackup(', `function glPreview(data){
  const {token,count,period,byProperty}=data;
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Confirm general ledger import'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'),
    el('button',{class:'btn accent',onclick:async()=>{ try{ await API.send('POST','/import/gl/confirm',{token}); scrim.remove(); await afterWrite(\`Imported \${count} ledger lines\`); }catch(e){ toast('Import failed: '+e.message); } }},\`Import \${count} lines\`));
  const b=el('div',{class:'sb'});
  b.append(el('p',{style:'margin-top:0;color:var(--ink-3)'},\`Found \${count} SP ledger lines\${period?\` for \${period}\`:''}. This replaces the current ledger. Spend by property:\`));
  const t=el('table',{class:'tbl'});t.append(el('thead',{},tr(th('Property'),th('Net spend','r'))));
  const tbb=el('tbody');Object.keys(byProperty).sort().forEach(k=>tbb.append(tr(td(k),tdn(byProperty[k],1))));
  t.append(tbb);b.append(el('div',{class:'panel',style:'overflow:auto'},t));
  sheet.append(head,b);scrim.append(sheet);document.body.append(scrim);
}
function cushionPreview(data){
  const {token,count,asOf,found}=data;
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Confirm cash cushion import'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'),
    el('button',{class:'btn accent',onclick:async()=>{ try{ await API.send('POST','/import/cushion/confirm',{token}); scrim.remove(); await afterWrite('Cash cushion updated'); }catch(e){ toast('Import failed: '+e.message); } }},'Apply update'));
  const b=el('div',{class:'sb'});
  b.append(el('p',{style:'margin-top:0;color:var(--ink-3)'},\`Matched \${count} properties · as of \${asOf}. Mid-month adjustments are preserved and continue to layer on top.\`));
  const t=el('table',{class:'tbl'});t.append(el('thead',{},tr(th('Property'),th('Cash','r'),th('SP budget','r'),th('SP spent','r'),th('Loan','r'),th('Matures','r'))));
  const tbb=el('tbody');Object.keys(found).sort().forEach(k=>{const c=found[k];tbb.append(tr(td(k),tdn(c.cash,1),tdn(c.spBudget,1),tdn(c.spSpent,1),tdn(c.loanAmount,1),td(c.loanDue||'—','r')));});
  t.append(tbb);b.append(el('div',{class:'panel',style:'overflow:auto'},t));
  sheet.append(head,b);scrim.append(sheet);document.body.append(scrim);
}

/* ---- backup ---- */
`);

/* ---------- (l) exports + importBackup ---------- */
rep(`function exportBackup(){download(\`nd-sp-tracker-\${today()}.json\`,JSON.stringify(S,null,2),'application/json');toast('Backup downloaded');}`,
    `function exportBackup(){ const a=el('a',{href:'/api/export/backup.json'}); document.body.append(a); a.click(); a.remove(); toast('Backup downloading…'); }`);
rep(`function importBackup(file){if(!file)return;const fr=new FileReader();fr.onload=e=>{try{const d=JSON.parse(e.target.result);if(!d.properties||!d.projects)throw 0;S=d;S.cashAdjustments=S.cashAdjustments||[];commit('Backup restored');}catch(err){toast('That file is not a valid backup.');}};fr.readAsText(file);}`,
    `function importBackup(file){ if(!file)return; const fr=new FileReader(); fr.onload=async e=>{ try{ const d=JSON.parse(e.target.result); if(!d.properties||!d.projects)throw 0; await restoreBackup(d); }catch(err){ toast('That file is not a valid backup.'); } }; fr.readAsText(file); }`);

/* exportCSV: keep its body but replace the download() call with a link to the API */
rep(`function exportCSV(){
  const cols=['property','region','category','name','contractor','anticipatedCost','actualCost','dateAdded','onHold',...STEP_KEYS];
  const lines=[cols.join(',')];
  S.projects.forEach(p=>{lines.push(cols.map(c=>{let v=STEP_KEYS.includes(c)?(p.steps&&p.steps[c]?1:0):p[c];v=v==null?'':String(v).replace(/"/g,'""');return /[",\\n]/.test(v)?\`"\${v}"\`:v;}).join(','));});
  download(\`nd-sp-projects-\${today()}.csv\`,lines.join('\\n'),'text/csv');toast('Projects CSV downloaded');
}`, `function exportCSV(){ const a=el('a',{href:'/api/export/projects.csv'}); document.body.append(a); a.click(); a.remove(); toast('Projects CSV downloading…'); }`, { optional: true });

/* ---------- (m) backup-panel copy: no longer browser-local ---------- */
rep(`    'Your data is saved automatically in this browser. Export a JSON backup to move it between machines or keep a safe copy — then import it anywhere to restore.'));`,
    `    'Data is saved to the shared database for everyone on the team. Export a JSON backup to keep a safe copy or move data between environments; importing a backup replaces ALL current data.'));`, { optional: true });

/* ---------- (n) boot() -> start() ---------- */
rep(`\nboot();`, `\nstart();`);

/* ---------- sanity: no leftover client-side XLSX / localStorage ---------- */
for (const bad of ['XLSX', 'Store.', 'seedState', 'localStorage']) {
  if (s.includes(bad)) console.warn('WARNING leftover reference:', bad);
}

writeFileSync('public/app.js', s, 'utf8');
console.log('Wrote public/app.js (%d bytes)', s.length);
