
"use strict";
/* ============================================================
   SPECIAL PROJECTS / CAPEX TRACKER — multi-region
   Regions, properties, colors and portfolios live in the DB and
   are editable in Settings. Data persists via the REST API
   (Postgres). A JSON backup can always be exported/imported.
   ============================================================ */

/* ---------- Lifecycle (10 steps; "signed" and "lienWaiver" are auto-derived
   from the executed-contract / lien-waiver attachments) ---------- */
const LIFECYCLE = [
  {key:'planned',           label:'Planned',                 short:'Plan', desc:'Scope, anticipated cost and planned timing captured.'},
  {key:'gotBids',           label:'Bids Received',           short:'Bids', desc:'Bids collected (3 is standard; not always required).'},
  {key:'approved',          label:'Bid Approved',            short:'Appr', desc:'One bid selected and approved.'},
  {key:'contractGenerated', label:'Contract Generated',      short:'Ctrct',desc:'Contract drafted to the approved bid and sent to the contractor.'},
  {key:'signed',            label:'Signed & Countersigned',  short:'Sign', desc:'Auto — ticks when the executed contract is attached.'},
  {key:'workStarted',       label:'Work Started',            short:'Start',desc:'Work underway (may run in phases).'},
  {key:'workCompleted',     label:'Work Completed',          short:'Done', desc:'Contractor completed the work or phase.'},
  {key:'paid',              label:'Work Paid For',           short:'Paid', desc:'Invoice paid (confirmed by the general ledger).'},
  {key:'completed',         label:'Completed',               short:'✓',    desc:'Work closed out; reflected in the financial statements.'},
  {key:'lienWaiver',        label:'Lien Waiver Received',    short:'Lien', desc:'Auto — ticks when the lien waiver is attached.'},
];
const STEP_KEYS = LIFECYCLE.map(s=>s.key);
const CATEGORIES = ['APPLIANCES','BUILDING REPAIRS','CABINETS/COUNTERTOPS','CARPETS/VINYL','COMMON AREA UPGRADES','Concrete/Asphalt','DOORS/WINDOWS','DRAPES/BLINDS','ELECTRICAL - EXTERIOR','ELECTRICAL - INTERIOR','ELEVATORS','FENCING','FIRE','FURNITURE/EQUIPMENT','GENERAL','HVAC','INSPECTION EXPENSES','JANITORIAL','LABOR','LANDSCAPING','OTHER','PAINTING - EXTERIOR','PAINTING - INTERIOR','PARKING','PLUMBING','POOL','REPAIR DOWN UNITS','ROOFING','SECURITY CAMERA','SIGNAGE','SUPPLIES','UNIT AMENITIES/UPGRADES','WOOD REPLACEMENT'];
/* IDs of projects that were imported from the spreadsheet's "SP COMPLETE" archive tab and should not appear as active work. Purged once at boot (see S.meta.spCompletePurge). */
const SP_COMPLETE_IDS=["P001","P002","P003","P004","P005","P006","P007","P008","P009","P010","P011","P012","P013","P014","P015","P016","P017","P018","P019","P020","P021","P022","P023","P024","P025","P026","P027","P028","P029","P030","P031","P032","P033","P034","P035","P036","P037","P038","P039","P040","P041","P042","P043","P044","P045","P046","P047","P048","P049","P050","P051","P052","P053","P054","P055","P056","P057","P058","P059","P060","P061","P062","P063","P064","P065","P066","P067","P068","P070","P071","P072","P073","P074","P075","P076","P077","P078","P079","P080","P081","P082","P083","P084","P085","P086","P087","P088","P089","P090","P091","P092","P093","P094","P095","P096","P097","P098","P099","P100","P101","P102","P103","P104","P105","P106","P107","P108","P109","P110","P111","P112","P113","P114","P115","P116","P117","P118","P119","P120"];

/* ---------- Helpers ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const el = (t,a={},...kids)=>{const n=document.createElement(t);for(const k in a){if(k==='class')n.className=a[k];else if(k==='html')n.innerHTML=a[k];else if(k.startsWith('on'))n.addEventListener(k.slice(2),a[k]);else if(a[k]!=null)n.setAttribute(k,a[k]);}for(let c of kids){if(c==null||c===false)continue;n.append(c.nodeType?c:document.createTextNode(c));}return n;};
const fmt = (n,dash=true)=>{if(n==null||n===''||isNaN(n))return dash?'—':'';const v=Math.round(Number(n));const s=Math.abs(v).toLocaleString('en-US');return v<0?`($${s})`:`$${s}`;};
const fmt1=(n)=>{if(n==null||isNaN(n))return '—';return '$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:0});};
const pct = (n)=>n==null||isNaN(n)?'—':(Number(n)*100).toFixed(n<0.1?1:0)+'%';
const pctWhole = (n)=>n==null||isNaN(n)?'—':Number(n).toFixed(1).replace(/\.0$/,'')+'%';
const esc = s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=(d)=>{ if(!d)return '—'; const m=String(d).slice(0,10).split('-'); if(m.length!==3)return String(d); const dt=new Date(+m[0],+m[1]-1,+m[2]); if(isNaN(dt))return String(d); return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };
const fmtDateShort=(d)=>{ if(!d)return ''; const m=String(d).slice(0,10).split('-'); if(m.length!==3)return String(d); return `${+m[1]}/${+m[2]}/${m[0].slice(2)}`; };
const inDateRange=(p,state)=>{ const d=(p.dateAdded||'').slice(0,10); if(state.dateFrom&&(!d||d<state.dateFrom))return false; if(state.dateTo&&(!d||d>state.dateTo))return false; return true; };
const uid = p=>p+Math.random().toString(36).slice(2,8);

/* ---------- Persistence ---------- */
/* ---------- API client (replaces localStorage Store; data now lives in Postgres) ---------- */
const API={
  async get(path){ const r=await fetch('/api'+path,{headers:{'Accept':'application/json'}}); if(r.status===401){showLogin();throw new Error('unauthorized');} if(!r.ok)throw new Error(await r.text()); return r.json(); },
  async send(method,path,body){ const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json'},body:body!=null?JSON.stringify(body):undefined}); if(r.status===401){showLogin();throw new Error('unauthorized');} if(!r.ok){ let msg; try{msg=(await r.json()).error;}catch(e){ msg='request failed'; } throw new Error(msg||'request failed'); } return r.json(); }
};
async function refreshState(){ S=await API.get('/state'); S.cashAdjustments=S.cashAdjustments||[]; S.gl=S.gl||[]; S.projects=S.projects||[]; S.cash=S.cash||{}; S.meta=S.meta||{}; S.projects.forEach(p=>{ if(typeof syncDerivedSteps==='function') syncDerivedSteps(p); }); }

/* ---------- App state ---------- */
let S=null;            // working state
let VIEW={tab:'dashboard',prop:null};
let FILT={region:'',props:null,cats:null,statuses:null,q:'',view:'board',catOpen:false,dateFrom:'',dateTo:''};
let PFILT={hide:{},dateFrom:'',dateTo:''};   // property view: which phase groups are hidden + date range (per session)
let DASH={region:'',props:[],cats:[],catOpen:false,hidePlanned:true,discSort:'cost',discProp:''};  // dashboard controls
let CFILT={prop:'',q:'',sort:'date_desc',status:'',region:''};  // contracts view filters + sort
let IHF={region:''};   // in-house view region toggle
let GLFILT={cat:'',match:'',hideSmall:true,hideInterest:true};  // GL ledger filters
let QS={year:null,q:null};   // quarterly summary picker (Money tab)
let CLOG={rows:[],user:'',prop:'',done:false,loading:false};   // change log view state
/* Per-property color comes from the properties table (editable in Settings).
   Unknown codes (e.g. GL lines kept for a future property) get a stable fallback. */
const FALLBACK_COLORS=['#5e97cc','#e0973a','#4f9d69','#a2599c','#c05b4d','#3f7cb8','#8f6f3a','#2f8f8f','#7a5cc0','#b8501f'];
const pcolor=code=>{
  const p=S&&S.properties&&S.properties.find(x=>x.code===code);
  if(p&&p.color)return p.color;
  let h=0; for(const ch of String(code||''))h=(h*31+ch.charCodeAt(0))>>>0;
  return FALLBACK_COLORS[h%FALLBACK_COLORS.length];
};
/* Ordered region names (regions table; falls back to whatever the properties use). */
const regionNames=()=> (S&&S.regions&&S.regions.length)? S.regions.map(r=>r.name)
  : [...new Set(((S&&S.properties)||[]).map(p=>p.region).filter(Boolean))];
/* Properties in display order: grouped by region (regions-table order), then code. */
const propsByRegion=()=>{ const ro=regionNames();
  return ((S&&S.properties)||[]).slice().sort((a,b)=>(ro.indexOf(a.region)-ro.indexOf(b.region))||a.code.localeCompare(b.code)); };
const regionOfCode=code=>(((S&&S.properties)||[]).find(p=>p.code===code)||{}).region||'';
/* Dashboard-style region toggle (All / <regions>) — tied to the regions table. */
function regionSeg(get,set){
  return el('div',{class:'seg-ctl'},
    el('button',{class:get()===''?'on':'',onclick:()=>{set('');render();}},'All'),
    ...regionNames().map(r=>el('button',{class:get()===r?'on':'',onclick:()=>{set(r);render();}},r)));
}
/* Green marker for discussed/planned projects whose cost IS counted in the cash
   projections (committed to cash before approval). */
const inProjDiscussed=p=>!isATL(p)&&!p.onHold&&!isInHouse(p)&&phase(p)==='discussed'&&!!p.commitCash;
const projSym=p=>inProjDiscussed(p)
  ? el('span',{title:'Included in cash projections — committed to cash',style:'color:#1fa356;font-weight:800;margin-left:5px'},'$')
  : null;
const appTitle=()=> (S&&S.meta&&S.meta.appTitle)||'SP Tracker';

/* seedState removed — initial data is seeded server-side into Postgres */

async function boot(){ await refreshState(); render(); }
/* ---------- Theme (light / dark) ---------- */
function applyTheme(t){ if(t==='dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme'); }
function isDark(){ return document.documentElement.getAttribute('data-theme')==='dark'; }
function toggleTheme(){ const next=isDark()?'light':'dark'; try{localStorage.setItem('theme',next);}catch(e){} applyTheme(next); render(); }
// Apply the saved (or system-preferred) theme immediately, before first paint.
try{ applyTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')); }catch(e){}
/* Mobile: edge-swipe right to open the nav drawer, swipe left to close it. */
(function initNavSwipe(){
  let sx=0, sy=0, tracking=false;
  addEventListener('touchstart', e=>{
    if(e.touches.length!==1){tracking=false;return;}
    const t=e.touches[0]; sx=t.clientX; sy=t.clientY; tracking=true;
  }, {passive:true});
  addEventListener('touchend', e=>{
    if(!tracking) return; tracking=false;
    if(!window.matchMedia('(max-width:820px)').matches) return;
    const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)<50 || Math.abs(dy)>Math.abs(dx)*0.8) return;   // clear horizontal swipe only
    if(dx>0 && sx<=44 && !VIEW.railOpen){ VIEW.railOpen=true; render(); }   // from left edge → open
    else if(dx<0 && VIEW.railOpen){ VIEW.railOpen=false; render(); }        // swipe left → close
  }, {passive:true});
})();
function commit(msg){ render(); if(msg) toast(msg); }
async function afterWrite(msg){ try{ await refreshState(); }catch(e){} render(); if(msg) toast(msg); }
function cleanBids(p){ return (p.bids||[]).map(b=>{ const files=Array.isArray(b.files)?b.files.map(f=>({fileKey:f.fileKey,fileName:f.fileName,fileSize:f.fileSize,originalFileKey:f.originalFileKey||null,originalFileName:f.originalFileName||null})):(b.fileKey?[{fileKey:b.fileKey,fileName:b.fileName,fileSize:b.fileSize}]:[]); const f0=files[0]||{}; return {id:b.id,contractor:b.contractor||'',amount:b.amount==null?null:b.amount,approved:!!b.approved,fileKey:f0.fileKey||null,fileName:f0.fileName||null,fileSize:f0.fileSize||null,files}; }); }
async function saveProjectSilent(p){ const payload={...p,bids:cleanBids(p)}; if(S.projects.find(x=>x.id===p.id)) await API.send('PATCH','/projects/'+p.id,payload); else await API.send('POST','/projects',payload); }
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
/* ---------- login (username + shared password) ---------- */
let USER='';       // signed-in username (First.Last), from the session
let IS_ADMIN=false; // Admin tabs (Settings / Change log) — server enforces too
function showLogin(){ const o=document.getElementById('login'); if(o)o.style.display='flex'; }
function hideLogin(){ const o=document.getElementById('login'); if(o)o.style.display='none'; }
function setLoginTitle(t){ const h=document.getElementById('login-title'); if(h&&t)h.textContent=t; if(t)document.title=t; }
async function signOut(){ try{ await fetch('/api/logout',{method:'POST'}); }catch(e){} USER=''; showLogin(); }
async function start(){
  const form=document.getElementById('login-form');
  const userEl=document.getElementById('login-user');
  try{ if(userEl&&!userEl.value) userEl.value=localStorage.getItem('sp-username')||''; }catch(e){}
  if(form&&!form._wired){ form._wired=true; form.addEventListener('submit',async ev=>{
    ev.preventDefault();
    const username=(userEl?userEl.value:'').trim();
    const pw=document.getElementById('login-pw').value;
    const err=document.getElementById('login-err'); err.textContent='';
    if(!username){ err.textContent='Enter your name (e.g. First.Last).'; return; }
    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:pw})});
    if(r.ok){ const j=await r.json().catch(()=>({})); USER=username; IS_ADMIN=!!j.isAdmin; try{localStorage.setItem('sp-username',username);}catch(e){} hideLogin(); await boot(); }
    else { let msg='Incorrect password.'; try{ msg=(await r.json()).error||msg; }catch(e){} err.textContent=msg; }
  }); }
  try{ const st=await fetch('/api/auth/status').then(r=>r.json());
    setLoginTitle(st.appTitle);
    if(st.authed){ USER=st.username||''; IS_ADMIN=!!st.isAdmin; hideLogin(); await boot(); } else { showLogin(); } }
  catch(e){ showLogin(); }
}
/* ---------- Derived ---------- */
const PROP=code=>S.properties.find(p=>p.code===code);
/* Contract steps become "N/A" when a project needs no contract (e.g. < $5K). */
const CONTRACT_STEPS=['contractGenerated','signed'];
const naKeys=p=>p.noContract?CONTRACT_STEPS:[];
const isNA=(p,key)=>!!p.noContract && CONTRACT_STEPS.includes(key);
/* Steps that are never toggled by hand — they mirror whether the matching
   attachment exists (executed contract → signed; lien waiver → lienWaiver). */
const AUTO_STEPS=['signed','lienWaiver'];
function syncDerivedSteps(p){
  if(!p||p.inHouse)return; p.steps=p.steps||{};
  p.steps.signed=!!p.executedContractFileKey;
  p.steps.lienWaiver=!!p.lienWaiverFileKey;
}
const appKeys=p=>{ const na=naKeys(p); return STEP_KEYS.filter(k=>!na.includes(k)); };
const appLifecycle=p=>{ const na=naKeys(p); return LIFECYCLE.filter(s=>!na.includes(s.key)); };
function stage(p){ let last=-1; STEP_KEYS.forEach((k,i)=>{if(p.steps&&p.steps[k])last=i;}); return last; } // index of furthest completed step (global)
function stepsDone(p){ return appKeys(p).filter(k=>p.steps&&p.steps[k]).length; }   // applicable steps only
function stepsTotal(p){ return appKeys(p).length; }
function isComplete(p){ if(p.inHouse){ const t=Number(p.totalToComplete)||0,d=Number(p.amountCompleted)||0; return t>0&&d>=t; } return !!(p.steps&&p.steps.completed); }
/* consistent per-property colour chip (matches dashboard bubbles + pipeline) */
function propChip(code,extra){ return el('span',{class:'chip pchip'+(extra?' '+extra:''),style:`background:${pcolor(code)};color:#fff`},code); }
/* Interest-income / cash-sweep lines posted into the SP GL: excluded from matching & flags,
   but used to estimate the monthly interest income. */
const isInterestGL=g=>/interest|cash\s*sweep/i.test(`${g.category||''} ${g.account||''}`);
function glSpentFor(code,cat){ return S.gl.filter(g=>g.property===code && (cat==null||g.category===cat)).reduce((a,g)=>a+(Number(g.amount)||0),0); }
function cashAdjFor(code){ return S.cashAdjustments.filter(a=>a.property===code).reduce((a,b)=>a+(Number(b.amount)||0),0); }
function effectiveCash(code){ const c=S.cash[code]; const base=c&&c.cash!=null?Number(c.cash):0; return base+cashAdjFor(code); }
/* Multi-property split: one project shared across sites, pro-rata by unit count
   (default) or custom %. allocsOf falls back to a single 100% allocation. */
const allocsOf=p=>(p&&p.split&&Array.isArray(p.split.list)&&p.split.list.length)?p.split.list:[{property:p.property,pct:100}];
const isSplitP=p=>allocsOf(p).length>1;
const shareFor=(p,code)=>{const a=allocsOf(p).find(x=>x.property===code);return a?(Number(a.pct)||0)/100:0;};
const involvesProp=(p,code)=>allocsOf(p).some(a=>a.property===code);
function projForProp(code){ return S.projects.filter(p=>involvesProp(p,code)); }
function estAdditional(code){ return projForProp(code).filter(p=>!isComplete(p)&&!p.onHold).reduce((a,p)=>a+(Number(p.anticipatedCost)||0)*shareFor(p,code),0); }

/* ---------- Cash projection + audit model ---------- */
const OVER_THRESHOLD = 5000;                       // unplanned-spend flag threshold
const APPROVED_IDX = STEP_KEYS.indexOf('approved'); // workflow "lock-in" point
const isApproved=p=>!!(p.steps&&p.steps.approved);
const isPaidP=p=>!!(p.steps&&p.steps.paid);
const hasCost=p=>p.anticipatedCost!=null||p.actualCost!=null;
const projOutflow=p=>p.actualCost!=null?Number(p.actualCost):(p.anticipatedCost!=null?Number(p.anticipatedCost):0);
/* ---- in-house (own-crew) projects: estimate + progress, no contracts/bids/liens ---- */
const isInHouse=p=>!!p.inHouse;
const ihIsBudget=p=>p.ihUnit!=='quantity';        // default budget ($); else quantity (count)
const ihNum=n=>Number(n||0).toLocaleString('en-US');
const ihFmt=(p,n)=>ihIsBudget(p)?fmt(n,false):ihNum(n);
const ihTotal=p=>Number(p.totalToComplete)||0;
const ihDone=p=>Number(p.amountCompleted)||0;
const ihRemaining=p=>Math.max(0, ihTotal(p)-ihDone(p));
const ihPct=p=>{ const t=ihTotal(p); return t>0?Math.min(1, ihDone(p)/t):0; };
/* phase: where a project sits relative to its workflow.
   In-house projects use a progress workflow (total to complete / amount completed).
   Contractor projects: no cost = "note"; cost pre-approval = "discussed"; approval locks the pipeline. */
/* "Above the Line" in the project name = funded from operational cashflow, not
   property cash. Excluded from all SP projections, GL tie-out and update emails;
   shown only in a collapsed property-view group / optional Projects filter. */
const isATL=p=>/above\s+the\s+line/i.test(p&&p.name||'');
function phase(p){
  if(p.onHold) return 'hold';
  if(p.inHouse){
    const t=ihTotal(p), d=ihDone(p);
    if(t<=0 && d<=0) return 'note';
    if(t>0 && d>=t)  return 'done';
    return 'active';
  }
  if(isComplete(p)) return 'done';
  if(isPaidP(p)) return 'paid';
  if(isApproved(p)) return 'active';
  if(!hasCost(p)) return 'note';
  return 'discussed';
}
/* Single, mutually-exclusive status bucket per project — drives the Projects
   tab filter chips and board grouping (finer-grained than phase()). */
function projStatus(p){
  if(p.onHold)return 'hold';
  if(isComplete(p))return 'done';
  if(isInHouse(p))return 'inhouse';
  if(isPaidP(p))return 'paid';
  const ph=phase(p);
  if(ph==='note')return 'note';
  if(ph==='discussed')return 'discussed';
  if(p.steps&&(p.steps.workStarted||p.steps.workCompleted))return 'working';
  if(p.steps&&(p.steps.contractGenerated||p.steps.signed))return 'contracted';
  return 'approved';
}
const PHASES=[
  {key:'active',   label:'In progress',      chip:'',     desc:'Approved & in the pipeline, not yet paid'},
  {key:'paid',     label:'Paid · awaiting closeout', chip:'done', desc:'Paid but not fully closed out'},
  {key:'discussed',label:'Discussed / planned', chip:'discussed', desc:'Has a cost; pre-approval — order is flexible'},
  {key:'note',     label:'Notes',            chip:'note', desc:'Jotted down — no cost plugged in yet'},
  {key:'hold',     label:'On hold',          chip:'hold', desc:'Parked for a future period'},
  {key:'done',     label:'Completed',        chip:'done', desc:'Closed out & in the financials'},
];
function phaseMeta(k){ return PHASES.find(x=>x.key===k); }

/* What cash *should* be: snapshot is a point-in-time fact; the tracker projects
   forward by netting outstanding (committed, unpaid) work against it. */
function cashModel(code){
  const c=S.cash[code]||{};
  const snapshot = c.cash!=null?Number(c.cash):null;
  const adj = cashAdjFor(code);
  const cashToday = (snapshot||0)+adj;
  const projs=projForProp(code);
  const outstanding=[], paid=[], discussed=[];
  let outstandingTotal=0, paidTotal=0, discussedTotal=0;
  projs.forEach(p=>{
    if(isATL(p)) return;                              // operationally funded — never in SP projections
    const sh=shareFor(p,code);                        // split projects contribute this site's slice only
    if(p.inHouse){
      if(p.onHold || !ihIsBudget(p)) return;          // quantity-tracked in-house has no $ figure
      const t=ihTotal(p), d=ihDone(p);
      if(t<=0 && d<=0) return;                        // note
      if(d>0){ paid.push(p); paidTotal+=d*sh; }       // completed-to-date = spent (final)
      const rem=ihRemaining(p);
      if(rem>0 && !isComplete(p)){ outstanding.push(p); outstandingTotal+=rem*sh; }  // remaining = projected out
      return;
    }
    if(phase(p)==='active'){ outstanding.push(p); outstandingTotal+=projOutflow(p)*sh; }   // committed, unpaid
    else if(isPaidP(p)){ paid.push(p); paidTotal+=projOutflow(p)*sh; }                      // final
    else if(phase(p)==='discussed'){
      // commitCash forces a pre-approval project into outstanding commitments
      if(p.commitCash){ outstanding.push(p); outstandingTotal+=projOutflow(p)*sh; }
      else { discussed.push(p); discussedTotal+=projOutflow(p)*sh; }
    }
  });
  return {snapshot,adj,cashToday,outstanding,outstandingTotal,paid,paidTotal,discussed,discussedTotal,
          projectedCash: cashToday-outstandingTotal};
}
/* Reconcile project records against the general ledger. GL = source of truth for paid work. */
function auditModel(code){
  const gls=S.gl.filter(g=>g.property===code);
  const glTotal=gls.reduce((a,g)=>a+(Number(g.amount)||0),0);
  const linkedIds=new Set(gls.map(g=>g.linkedProjectId).filter(Boolean));
  const unplanned=gls.filter(g=>Number(g.amount)>OVER_THRESHOLD && !g.linkedProjectId && !isInterestGL(g));   // posted, >$5k, not tied (interest income excluded)
  const paid=projForProp(code).filter(p=>isPaidP(p)&&!isATL(p));   // ATL needs no GL tie-out
  const paidNoGL=paid.filter(p=>!linkedIds.has(p.id));                                     // marked paid but no GL backing
  return {gls,glTotal,unplanned,paid,paidNoGL,linkedCount:linkedIds.size};
}
function unplannedAll(){ return S.gl.filter(g=>Number(g.amount)>OVER_THRESHOLD && !g.linkedProjectId && !isInterestGL(g)); }
/* Rough GL→project match scoring, so tying out is point-and-click rather than hunting. */
function glMatchScore(g,p){
  let score=0; const reasons=[];
  if(g.category && p.category && String(g.category).toUpperCase()===String(p.category).toUpperCase()){ score+=40; reasons.push('category'); }
  const amt=Math.abs(Number(g.amount)||0);
  const sh=isSplitP(p)?shareFor(p,g.property):1;   // split projects post per-property slices
  const tot=Math.abs(p.inHouse?ihTotal(p):projOutflow(p))*(sh||1);
  if(tot>0 && amt>0){
    const diff=Math.abs(amt-tot)/Math.max(amt,tot);
    if(diff<0.005){ score+=45; reasons.push('exact $'); }
    else if(diff<0.05){ score+=32; reasons.push('≈ $'); }
    else if(diff<0.2){ score+=16; reasons.push('~ $'); }
  }
  const toks=s=>String(s||'').toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);
  const gtok=new Set([...toks(g.vendor),...toks(g.remarks)]);
  const ptok=new Set([...toks(p.name),...toks(p.contractor),...toks(p.plan)]);
  let overlap=0; ptok.forEach(t=>{ if(gtok.has(t))overlap++; });
  if(overlap){ score+=Math.min(30,overlap*12); reasons.push('name'); }
  return {score,reasons};
}

/* =========================================================
   RENDER
========================================================= */
function render(){
  const root=$('#root');
  root.innerHTML='';
  const app=el('div',{class:'app'+(VIEW.railOpen?' rail-open':'')});
  app.append(rail(), mainCol());
  // Mobile: dim + tap-outside-to-close backdrop for the nav drawer.
  if(VIEW.railOpen) app.append(el('div',{class:'scrim-nav',onclick:()=>{VIEW.railOpen=false;render();}}));
  root.append(app);
  syncHeadOffset();
}
// Publish the sticky property-header height so section headers can lock right below it.
function syncHeadOffset(){
  requestAnimationFrame(()=>{ const h=document.querySelector('.prop-head'); document.documentElement.style.setProperty('--head-h',(h?h.offsetHeight:0)+'px'); });
}

function rail(){
  const counts={
    projects:S.projects.length,
    active:S.projects.filter(p=>!isComplete(p)&&phase(p)!=='note'&&!isATL(p)).length,
  };
  const r=el('div',{class:'rail'+(VIEW.railOpen?' open':'')});
  document.title=appTitle();
  const brand=el('div',{class:'brand'},
    el('div',{class:'mark'}, el('div',{class:'glyph'},'SP'),
      el('div',{}, el('h1',{},appTitle()), el('div',{class:'sub'},'Special Projects · Capex'))));
  const nav=el('div',{class:'nav'});
  const item=(tab,ic,label,ct)=>{
    const b=el('button',{class:VIEW.tab===tab?'on':'',onclick:()=>{VIEW.tab=tab;VIEW.railOpen=false;render();}},
      el('span',{class:'ic'},ic), el('span',{},label));
    if(ct!=null)b.append(el('span',{class:'ct'},String(ct)));
    return b;
  };
  nav.append(el('div',{class:'grp'},'Overview'));
  nav.append(item('dashboard','◧','Dashboard'));
  nav.append(item('projects','▤','Projects',counts.active));
  nav.append(item('inhouse','🛠','In-house',S.projects.filter(isInHouse).length||null));
  nav.append(item('contracts','▦','Contracts',(S.contracts||[]).length||null));
  nav.append(el('div',{class:'grp'},'Properties'));
  regionNames().forEach(reg=>{
    const inRegion=S.properties.filter(p=>p.region===reg);
    if(!inRegion.length){ return; }
    nav.append(el('div',{class:'grp',style:'padding-top:6px'},reg));
    inRegion.forEach(p=>{
      const b=el('button',{class:(VIEW.tab==='property'&&VIEW.prop===p.code)?'on':'',onclick:()=>{VIEW.tab='property';VIEW.prop=p.code;VIEW.railOpen=false;render();}},
        el('span',{class:'ic',style:`color:${pcolor(p.code)}`},'●'), el('span',{},p.code),
        el('span',{class:'ct'},String(projForProp(p.code).filter(x=>!isComplete(x)&&phase(x)!=='note'&&!isATL(x)).length)));
      nav.append(b);
    });
  });
  nav.append(el('div',{class:'grp'},'Money'));
  nav.append(item('cash','$','Cash & Loans'));
  nav.append(item('data','⇪','Upload & Data'));
  nav.append(item('directory','👷','Contractors',(S.contractors||[]).length||null));
  if(IS_ADMIN){
    nav.append(el('div',{class:'grp'},'Admin'));
    nav.append(item('changelog','≡','Change log'));
    nav.append(item('settings','⚙','Settings'));
  }

  const foot=el('div',{class:'foot'},
    el('div',{class:'row',style:'margin-bottom:6px'}, el('span',{},'Signed in as'),
      el('span',{class:'mono',title:USER,style:'max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'},USER||'—')),
    el('button',{class:'theme-toggle',onclick:signOut,style:'margin-bottom:6px'},'⎋  Sign out'),
    el('button',{class:'theme-toggle',onclick:toggleTheme}, isDark()?'☀  Light mode':'🌙  Dark mode'),
    el('div',{class:'row'}, el('span',{},'GL period'), el('span',{class:'mono'},S.meta&&S.meta.glPeriod?S.meta.glPeriod:'—')),
    el('div',{class:'row',style:'margin-top:4px'}, el('span',{},'Cash as of'), el('span',{class:'mono'},S.meta&&S.meta.cashAsOf?S.meta.cashAsOf:'—')));
  r.append(brand,nav,foot);
  return r;
}

function mainCol(){
  const m=el('div',{class:'main'});
  if(!IS_ADMIN&&(VIEW.tab==='changelog'||VIEW.tab==='settings'))VIEW.tab='dashboard';   // admin-only tabs
  const views={dashboard:viewDashboard,projects:viewProjects,inhouse:viewInHouse,contracts:viewContracts,property:viewProperty,cash:viewCash,data:viewData,directory:viewDirectory,changelog:viewChangelog,settings:viewSettings};
  const {bar,body}=(views[VIEW.tab]||viewDashboard)();
  // Property view goes edge-to-edge on mobile (no side margins) with sticky section headers.
  m.append(bar,el('div',{class:'content'+(VIEW.tab==='property'?' content-flush':'')},body));
  return m;
}
// Add drag-and-drop to any element. Calls onFile(File) on drop or input change.
// Returns the hidden file input so callers can still trigger .click() on it.
/* Download URL for any stored file — serves Content-Disposition: attachment
   with the ORIGINAL uploaded filename (viewing inline in a tab loses it). */
const dlUrl=(key,name)=>'/api/files/'+key+'?name='+encodeURIComponent(name||'file');
const dlBtn=(key,name,label)=>el('a',{class:'btn ghost sm',href:dlUrl(key,name),title:'Download as “'+(name||'file')+'”',onclick:e=>e.stopPropagation()},label||'⬇');

async function openPdfViewer(source, fileName){
  let url, revokeOnClose=false;
  if(typeof source==='string'){url=source;}
  else{url=URL.createObjectURL(source);revokeOnClose=true;}
  let targetPage=null;
  try{
    const res=await fetch(url);
    const buf=await res.arrayBuffer();
    const txt=new TextDecoder('latin1').decode(buf);
    const counts=[...txt.matchAll(/\/Count\s+(\d+)/g)].map(m=>parseInt(m[1]));
    if(counts.length){const tot=Math.max(...counts);if(tot>1)targetPage=tot-1;}
  }catch(e){}
  const close=()=>{overlay.remove();if(revokeOnClose)URL.revokeObjectURL(url);};
  const overlay=el('div',{class:'scrim',style:'z-index:2100;display:flex;flex-direction:column;padding:0'});
  const hdr=el('div',{style:'display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface);border-bottom:1px solid var(--line-2);flex-shrink:0'});
  hdr.append(
    el('span',{style:'font-weight:600;font-size:14px;flex:1'},fileName||'Contract'),
    el('button',{class:'btn ghost sm',onclick:close},'✕ Close'));
  const frame=el('iframe',{src:url+(targetPage?'#page='+targetPage:''),style:'flex:1;border:none;width:100%'});
  overlay.append(hdr,frame);
  document.body.append(overlay);
}

function addDrop(target, accept, onFile, opts={}){
  const inp=document.createElement('input'); inp.type='file'; inp.accept=accept; inp.style.display='none';
  if(opts.multiple) inp.multiple=true;
  // With opts.multiple, hand every dropped/picked file to onFile one at a time
  // (awaited, so async uploads run sequentially instead of racing).
  const handle=async(list)=>{ const files=[...(list||[])]; if(!files.length)return;
    if(opts.multiple){ for(const f of files){ await onFile(f); } } else { onFile(files[0]); } };
  inp.addEventListener('change',()=>{handle(inp.files); inp.value='';});
  target.append(inp);
  target.addEventListener('dragover',e=>{e.preventDefault();target.classList.add('hot');});
  target.addEventListener('dragleave',e=>{if(!target.contains(e.relatedTarget))target.classList.remove('hot');});
  target.addEventListener('drop',e=>{e.preventDefault();target.classList.remove('hot');handle(e.dataTransfer.files);});
  return inp;
}

function topbar(crumb,title,...actions){
  const t=el('div',{class:'topbar'});
  const menu=el('button',{class:'btn ghost sm menu-btn',onclick:()=>{VIEW.railOpen=!VIEW.railOpen;render();}},'☰');
  const tt=el('div',{class:'tt'}, el('div',{class:'crumb'},crumb), el('h2',{},title));
  t.append(menu,tt,el('div',{class:'sp'}),...actions);
  return t;
}

/* =========================================================
   CONTRACTS
========================================================= */
function viewContracts(){
  const usd=n=>(n==null||n==='')?'—':'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

  // Build project lookup
  const projById=new Map(S.projects.map(p=>[p.id,p]));

  // Deduplicate S.contracts by projectId — keep the most recent per project
  const latestByProj=new Map();
  (S.contracts||[]).forEach(c=>{
    const ex=latestByProj.get(c.projectId);
    if(!ex||String(c.createdAt||'')>String(ex.createdAt||'')) latestByProj.set(c.projectId,c);
  });
  // The topbar region toggle scopes EVERYTHING below (KPIs, by-property, lists).
  const allDeduped=[...latestByProj.values()].filter(c=>!CFILT.region||regionOfCode(c.property)===CFILT.region);

  // Status of a contract record
  const statusOf=c=>{
    const pr=projById.get(c.projectId);
    if(pr&&pr.executedContractFileKey) return 'executed';
    if(pr&&pr.steps&&pr.steps.signed) return 'countersigned';
    if(pr&&pr.contractorSignedFileKey) return 'ctrsigned';
    return 'generated';
  };
  const ST_LABEL={executed:'Executed',countersigned:'Signed & Countersigned',ctrsigned:'Contractor signed — awaiting countersign',generated:'Generated — sent for signature'};
  const ST_CHIP={executed:'done',countersigned:'good',ctrsigned:'hold',generated:''};

  // Planned: approved projects with no generated contract
  const projectsWithContract=new Set(latestByProj.keys());
  const allPlanned=S.projects.filter(p=>isApproved(p)&&!p.noContract&&!p.noContractSet&&!isComplete(p)&&!p.onHold&&!projectsWithContract.has(p.id)
    &&(!CFILT.region||regionOfCode(p.property)===CFILT.region));

  // Apply property + search filters to deduped list
  let list=allDeduped.slice();
  if(CFILT.prop) list=list.filter(c=>c.property===CFILT.prop);
  if(CFILT.q){const q=CFILT.q.toLowerCase();list=list.filter(c=>[c.outputFilename,c.contractor,c.ownerEntity,c.scope].some(x=>String(x||'').toLowerCase().includes(q)));}

  // Planned list with same property filter
  let planned=allPlanned.slice();
  if(CFILT.prop) planned=planned.filter(p=>p.property===CFILT.prop);

  // Status filter
  const showPlanned=CFILT.status==='planned';
  if(CFILT.status&&!showPlanned) list=list.filter(c=>statusOf(c)===CFILT.status);
  if(showPlanned){list=[];} else {planned=[];}

  // Sort contracts list
  const sorters={
    date_desc:(a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')),
    date_asc:(a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')),
    total_desc:(a,b)=>(Number(b.total)||0)-(Number(a.total)||0),
    contractor:(a,b)=>String(a.contractor||'').localeCompare(String(b.contractor||'')),
    property:(a,b)=>String(a.property).localeCompare(String(b.property)),
  };
  list.sort(sorters[CFILT.sort]||sorters.date_desc);
  const total=list.reduce((a,c)=>a+(Number(c.total)||0),0);

  // Controls
  const searchInp=el('input',{type:'search',placeholder:'Search contractor, scope, file…',value:CFILT.q||'',style:'min-width:200px',onchange:e=>{CFILT.q=e.target.value;render();}});
  const propSel=el('select',{onchange:e=>{CFILT.prop=e.target.value;render();}},
    el('option',{value:''},'All properties'),
    ...propsByRegion().filter(p=>!CFILT.region||p.region===CFILT.region).map(p=>el('option',{value:p.code,...(CFILT.prop===p.code?{selected:true}:{})},`${p.code} — ${p.name}`)));
  const statusSel=el('select',{onchange:e=>{CFILT.status=e.target.value;render();}},
    el('option',{value:'',...(CFILT.status===''?{selected:true}:{})},'All statuses'),
    el('option',{value:'executed',...(CFILT.status==='executed'?{selected:true}:{})},'Executed'),
    el('option',{value:'countersigned',...(CFILT.status==='countersigned'?{selected:true}:{})},'Signed — awaiting file'),
    el('option',{value:'ctrsigned',...(CFILT.status==='ctrsigned'?{selected:true}:{})},'Contractor signed — awaiting countersign'),
    el('option',{value:'generated',...(CFILT.status==='generated'?{selected:true}:{})},'Generated — sent for signature'),
    el('option',{value:'planned',...(CFILT.status==='planned'?{selected:true}:{})},'Planned — no contract yet'));
  const sortSel=el('select',{onchange:e=>{CFILT.sort=e.target.value;render();}},
    ...[['date_desc','Newest first'],['date_asc','Oldest first'],['total_desc','Total (high→low)'],['contractor','Contractor (A–Z)'],['property','Property']]
      .map(([v,l])=>el('option',{value:v,...(CFILT.sort===v?{selected:true}:{})},l)));
  const bar=topbar('Pipeline','Contracts', regionSeg(()=>CFILT.region,v=>{CFILT.region=v;CFILT.prop='';}), searchInp, propSel, statusSel, sortSel);

  const body=el('div',{class:'grid'});

  // KPIs — count from deduplicated list, not raw S.contracts
  const exeCt=allDeduped.filter(c=>statusOf(c)==='executed').length;
  const genCt=allDeduped.filter(c=>statusOf(c)==='generated').length;
  const kpiBox=(lab,val,sub)=>{const d=el('div',{class:'kpi'},el('div',{class:'lab'},lab),el('div',{class:'val'},val));if(sub)d.append(el('div',{style:'font-size:11px;color:var(--ink-3);margin-top:2px'},sub));return d;};
  const kpis=el('div',{class:'grid kpis',style:'grid-template-columns:repeat(4,1fr)'});
  kpis.append(
    kpiBox('Active contracts',String(allDeduped.length),`${exeCt} executed · ${genCt} generated`),
    kpiBox('Total value',usd(allDeduped.reduce((a,c)=>a+(Number(c.total)||0),0))),
    kpiBox('Properties',String(new Set(allDeduped.map(c=>c.property)).size)),
    kpiBox('Awaiting contract',String(allPlanned.length),'approved, no contract yet'));
  body.append(kpis);

  // By-property breakdown — deduplicated
  const byProp={};
  allDeduped.forEach(c=>{
    const k=c.property,st=statusOf(c);
    if(!byProp[k]) byProp[k]={exe:0,gen:0,plan:0,t:0};
    byProp[k].t+=Number(c.total)||0;
    if(st==='executed') byProp[k].exe++; else byProp[k].gen++;
  });
  allPlanned.forEach(p=>{const k=p.property;if(!byProp[k])byProp[k]={exe:0,gen:0,plan:0,t:0};byProp[k].plan++;});
  const bpPanel=el('div',{class:'panel'});
  bpPanel.append(el('div',{class:'ph'}, el('h3',{},'Contracts by property')));
  const bpt=el('table',{class:'tbl'});
  bpt.append(el('thead',{},tr(th('Property'),th('Executed','r'),th('Generated','r'),th('Planned','r'),th('Total value','r'))));
  const bptb=el('tbody');
  Object.keys(byProp).sort((a,b)=>byProp[b].t-byProp[a].t).forEach(code=>{
    const d=byProp[code];
    bptb.append(el('tr',{class:'clickrow',onclick:()=>{CFILT.prop=CFILT.prop===code?'':code;render();}},
      td(el('span',{},propChip(code),' ',PROP(code)?PROP(code).name:code)),
      el('td',{class:'num r'},d.exe||'—'),
      el('td',{class:'num r'},d.gen||'—'),
      el('td',{class:'num r'},d.plan||'—'),
      el('td',{class:'num r'},usd(d.t))));
  });
  bpt.append(bptb);
  bpPanel.append(el('div',{style:'overflow:auto'},bpt));
  body.append(bpPanel);

  // Main contracts table
  const panel=el('div',{class:'panel'});
  const totalShown=list.length+planned.length;
  panel.append(el('div',{class:'ph'}, el('h3',{},'Contracts'), el('div',{class:'sp'}), el('span',{class:'chip'},`${totalShown} shown`)));
  if(!totalShown){
    panel.append(el('div',{class:'empty'}, el('div',{class:'big'},showPlanned?'No projects awaiting a contract.':'No contracts yet'), showPlanned?'All approved projects have contracts generated.':'Generate a contract from a project\'s Bids panel.'));
  } else {
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('#'),th('Project'),th('Property'),th('Contractor'),th('Total','r'),th('Status'),th('Eff. date'),th('Term end'),th('File'))));
    const tb=el('tbody');
    let i=0;
    list.forEach(c=>{
      i++;
      const proj=projById.get(c.projectId);
      const st=statusOf(c);
      // Prefer the executed contract's file when it exists; else the generated one.
      const fKey=(proj&&proj.executedContractFileKey)||c.fileKey||(proj&&proj.contractFileKey)||null;
      const fName=(proj&&proj.executedContractFileKey)?(proj.executedContractFileName||'executed.pdf'):(c.outputFilename||(proj&&proj.contractFileName)||'contract.pdf');
      tb.append(el('tr',{class:'clickrow',onclick:()=>{if(proj)openProject(proj.id);}},
        el('td',{class:'num'},String(i)),
        td(el('div',{style:'font-size:12px'},el('div',{},proj?proj.name:(c.outputFilename||'—')),el('div',{style:'color:var(--ink-3);font-size:11px'},c.outputFilename||''))),
        td(propChip(c.property)),
        td(c.contractor||'—'),
        el('td',{class:'num r'},usd(c.total)),
        td(el('span',{class:'chip '+(ST_CHIP[st]||'')},ST_LABEL[st]||st)),
        td(fmtDate(c.effectiveDate)),
        td(fmtDate(c.termEnd)),
        td(fKey?el('span',{style:'display:inline-flex;gap:4px'},
          el('button',{class:'btn ghost sm',title:'View in a new tab',onclick:e=>{e.stopPropagation();window.open('/api/bids/file/'+fKey,'_blank');}},'👁'),
          dlBtn(fKey,fName)):'—')));
    });
    planned.forEach(pr=>{
      i++;
      tb.append(el('tr',{class:'clickrow',onclick:()=>openProject(pr.id)},
        el('td',{class:'num'},String(i)),
        td(el('div',{style:'font-size:12px'},el('div',{},pr.name),el('div',{style:'color:var(--ink-3);font-size:11px'},pr.contractor||'—'))),
        td(propChip(pr.property)),
        td(pr.contractor||'—'),
        el('td',{class:'num r'},usd(pr.anticipatedCost)),
        td(el('span',{class:'chip hold'},'Planned — no contract')),
        td('—'),td('—'),td('—')));
    });
    t.append(tb);
    panel.append(el('div',{style:'overflow:auto'},t));
    if(!showPlanned&&total) panel.append(el('div',{style:'padding:8px 16px;font-size:12.5px;font-weight:600;border-top:1px solid var(--line)'},`Filtered total: ${usd(total)}`));
  }
  body.append(panel);
  return {bar,body};
}

/* =========================================================
   DASHBOARD
========================================================= */
function viewDashboard(){
  const regions=regionNames();
  const isMobile=window.matchMedia('(max-width:820px)').matches;
  DASH.props=DASH.props||[];
  let props=S.properties.filter(p=>!DASH.region||p.region===DASH.region);
  if(DASH.props.length) props=props.filter(p=>DASH.props.includes(p.code));
  const codeset=new Set(props.map(p=>p.code));
  const inReg=code=>codeset.has(code);
  const catOk=p=>!DASH.cats.length||DASH.cats.includes(p.category);
  const glOk=g=>inReg(g.property)&&(!DASH.cats.length||DASH.cats.includes(g.category));

  // dashboard controls: region toggle + hide-planned
  const regSeg=el('div',{class:'seg-ctl'},
    el('button',{class:DASH.region===''?'on':'',onclick:()=>{DASH.region='';render();}},'All'),
    ...regions.map(r=>el('button',{class:DASH.region===r?'on':'',onclick:()=>{DASH.region=r;DASH.props=[];render();}},r)));
  const hideChk=el('label',{class:'chk'},
    (()=>{const c=el('input',{type:'checkbox',onchange:e=>{DASH.hidePlanned=e.target.checked;render();}});if(DASH.hidePlanned)c.checked=true;return c;})(),
    'Hide \u2018Planned\u2019');
  const emailAllBtn=el('button',{class:'btn',title:'Download an Outlook draft (.eml) for every included property shown, zipped — recipients & options come from each property’s email settings (⚙)',onclick:()=>{
    const incl=props.filter(pr=>pr.updateEnabled!==false);
    const files=incl.map(pr=>{ const {subject,html}=buildUpdateEmail(pr.code);
      return {name:emlFileName(subject), bytes:new TextEncoder().encode(buildEml({subject,to:pr.updateTo,cc:pr.updateCc,html}))}; });
    if(!files.length){ toast('No properties included — check ⚙ Email setup'); return; }
    const skipped=props.length-incl.length;
    const d=new Date();
    downloadBlob(makeZip(files), `SP Update Emails ${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}.zip`);
    toast(files.length+' drafts zipped'+(skipped?` · ${skipped} excluded in setup`:''));
  }},'⬇ Update emails');
  const emailSetupBtn=el('button',{class:'btn ghost',title:'Choose which properties are in the bulk download and edit each one’s recipients & options',onclick:openEmailSetup},'⚙ Email setup');
  const bar=topbar('Portfolio','Dashboard', regSeg,
    el('div',{class:'tb-actions'}, hideChk, emailSetupBtn, emailAllBtn, el('button',{class:'btn accent',onclick:()=>openProject(null)},'+ New project')));
  const body=el('div',{class:'grid'});

  // property bubble toggles + category filter
  const pbWrap=el('div',{class:'bubbles'}, el('span',{class:'bub-lab'},'Properties'));
  propsByRegion().filter(p=>!DASH.region||p.region===DASH.region).forEach(pr=>{
    const on=DASH.props.includes(pr.code);
    pbWrap.append(el('button',{class:'bub'+(on?' on':''),style:on?`background:${pcolor(pr.code)};border-color:${pcolor(pr.code)};color:#fff`:'',
      onclick:()=>{const i=DASH.props.indexOf(pr.code);if(i<0)DASH.props.push(pr.code);else DASH.props.splice(i,1);render();}},
      el('span',{class:'bub-dot',style:'background:'+pcolor(pr.code)}), pr.code));
  });
  if(DASH.props.length)pbWrap.append(el('button',{class:'bub clear',onclick:()=>{DASH.props=[];render();}},'clear'));
  const catsPresent=[...new Set(S.projects.filter(p=>inReg(p.property)).map(p=>p.category))].sort();
  DASH.cats=DASH.cats.filter(c=>catsPresent.includes(c));   // drop selections no longer in range
  const catToggle=c=>{const i=DASH.cats.indexOf(c);if(i<0)DASH.cats.push(c);else DASH.cats.splice(i,1);render();};
  const catRow=el('div',{class:'bubbles'}, el('span',{class:'bub-lab'},'Category'));
  const catDD=el('div',{class:'cat-dd'});
  catDD.append(el('button',{class:'bub dd-btn'+(DASH.catOpen?' open':''),onclick:()=>{DASH.catOpen=!DASH.catOpen;render();}},
    (DASH.cats.length?`${DASH.cats.length} selected`:'All categories'), el('span',{class:'chev'},'▾')));
  if(DASH.catOpen){
    const panel=el('div',{class:'cat-dd-panel'});
    panel.append(el('button',{class:'bub all'+(DASH.cats.length?'':' on'),style:'margin-bottom:6px',onclick:()=>{DASH.cats=[];render();}}, DASH.cats.length?'Clear all':'All selected'));
    catsPresent.forEach(cat=>{ const on=DASH.cats.includes(cat);
      panel.append(el('label',{class:'cat-item'},
        (()=>{const c=el('input',{type:'checkbox',onchange:()=>catToggle(cat)}); if(on)c.checked=true; return c;})(),
        el('span',{},cat))); });
    catDD.append(panel);
  }
  catRow.append(catDD);
  if(DASH.cats.length) DASH.cats.slice().sort().forEach(cat=>catRow.append(el('button',{class:'bub on accent sm',title:'Remove',onclick:()=>catToggle(cat)},cat,' ✕')));
  const filterBar=el('div',{class:'dash-filter'}, pbWrap, catRow);
  // On mobile the filters live inside the sticky header so they stay locked at
  // the top and drive every section below; on desktop they sit in the body.
  if(isMobile){ bar.append(el('div',{class:'dash-filterbar'}, filterBar)); } else { body.append(filterBar); }

  const all=S.projects.filter(p=>inReg(p.property)&&catOk(p)&&!isATL(p));   // Above-the-Line hidden from the dashboard
  const notesCount=all.filter(p=>phase(p)==='note').length;
  const active=all.filter(p=>!isComplete(p)&&phase(p)!=='note');   // in-progress = priced, non-complete work (notes excluded)
  const totBudget=props.reduce((a,p)=>a+(Number(p.spBudget)||0),0);
  const totSpent=S.gl.filter(glOk).reduce((a,g)=>a+(Number(g.amount)||0),0);
  const totOutstanding=props.reduce((a,p)=>a+cashModel(p.code).outstandingTotal,0);
  const totCash=props.reduce((a,p)=>a+effectiveCash(p.code),0);

  const kpis=el('div',{class:'grid kpis'});
  const kpi=(lab,val,sub,cls)=>el('div',{class:'kpi'+(cls?' '+cls:'')}, el('div',{class:'lab'},lab), el('div',{class:'val'+(typeof val==='string'&&val[0]==='('?' neg':'')},val), el('div',{class:'sub'},sub));
  kpis.append(
    kpi('Properties',String(props.length),DASH.region||regions.join(' · ')),
    kpi('Active projects',String(active.length),`${all.length} tracked${notesCount?` · ${notesCount} note${notesCount!==1?'s':''}`:''}`),
    kpi('SP budget (2026)',fmt(totBudget),DASH.region?DASH.region:'across portfolio','accent'),
    kpi('Spent to date',fmt(totSpent),'posted per ledger'),
    kpi('Cash today',fmt(totCash),'snapshot + adjustments'),
    kpi('Projected cash',fmt(totCash-totOutstanding),`less ${fmt(totOutstanding,false)} committed`),
  );
  body.append(isMobile ? mobileFold('Summary', DASH.region||'Portfolio', kpis) : kpis);

  /* Awaiting approval — moved above the pipeline so the most actionable list is first. */
  body.append(discussedPanel(active.filter(p=>!p.onHold&&phase(p)==='discussed'&&!!p.steps.gotBids)));

  /* Awaiting signature — contractor returned a signed contract, no countersigned copy yet. */
  const awaitingSig=all.filter(p=>p.contractorSignedFileKey&&!p.executedContractFileKey&&!isComplete(p));
  body.append(attentionPanel('Awaiting signature · contractor signed, not countersigned',awaitingSig));

  /* Pipeline funnel — contractor lifecycle, stacked one colour per property (in-house excluded) */
  let hold=0; active.forEach(p=>{ if(p.onHold)hold++; });
  const fActive=active.filter(p=>!isInHouse(p));
  const stageProp=LIFECYCLE.map(()=>({})); const stageTotal=new Array(LIFECYCLE.length).fill(0);
  fActive.forEach(p=>{ if(p.onHold)return; const s=Math.max(0,stage(p)); stageProp[s][p.property]=(stageProp[s][p.property]||0)+1; stageTotal[s]++; });
  const maxT=Math.max(1,...stageTotal);
  const funnel=el('details',{class:'panel coll'}); funnel.open=!isMobile;
  funnel.append(el('summary',{class:'ph coll-sum'}, el('span',{class:'chev'},'▸'), el('h3',{},'Lifecycle pipeline'), el('div',{class:'sp'}),
    el('span',{style:'font-size:11.5px;color:var(--ink-3)'},'segment = property · click to open'),
    el('span',{class:'chip'},`${hold} on hold`)));
  const legendProps=props.filter(pr=>fActive.some(p=>!p.onHold&&p.property===pr.code));
  const legend=el('div',{class:'plegend'});
  legendProps.forEach(pr=>legend.append(el('button',{class:'pl-item',title:`Open ${pr.code}`,onclick:()=>{VIEW.tab='property';VIEW.prop=pr.code;render();}},
    el('span',{class:'pl-dot',style:'background:'+pcolor(pr.code)}), pr.code)));
  funnel.append(el('div',{class:'pad pipe-legend',style:'padding-bottom:6px'},legend));
  const fwrap=el('div',{class:'pad',style:'padding-top:6px'});
  const fn=el('div',{class:'funnel'});
  LIFECYCLE.forEach((s,i)=>{
    if(DASH.hidePlanned&&i===0)return;        // hide the Planned stage to cut clutter
    const row=el('div',{class:'f'});
    row.append(el('div',{class:'fn'},`${i+1}. ${s.label}`));
    const stack=el('div',{class:'fstack',style:`width:${Math.max(2,stageTotal[i]/maxT*100)}%`});
    const entries=Object.entries(stageProp[i]).sort((a,b)=>b[1]-a[1]);
    if(!entries.length) stack.append(el('div',{class:'fseg empty'}));
    entries.forEach(([cd,n])=>{
      const seg=el('div',{class:'fseg',style:`flex:${n};background:${pcolor(cd)}`,title:`${cd}: ${n} at ${s.label}`,
        onclick:e=>{e.stopPropagation();VIEW.tab='property';VIEW.prop=cd;render();}});
      if(n/Math.max(1,stageTotal[i])>0.14) seg.textContent=String(n);
      stack.append(seg);
    });
    row.append(el('div',{},stack), el('div',{class:'fc'},String(stageTotal[i])));
    fn.append(row);
  });
  fwrap.append(fn); funnel.append(fwrap); body.append(funnel);

  /* Portfolio summary tiles */
  const tp=el('details',{class:'panel coll'}); tp.open=!isMobile;
  tp.append(el('summary',{class:'ph coll-sum'}, el('span',{class:'chev'},'▸'), el('h3',{},'Portfolio summary'), el('div',{class:'sp'}),
    el('span',{class:'chip'},`as of ${S.meta&&S.meta.cashAsOf||'—'}`)));
  const calcProjStats=pr=>{
    const code=pr.code, c=S.cash[code]||{}, cm=cashModel(code);
    const spent=glSpentFor(code);
    const cashToday=cm.cashToday;
    const asOf=c.asOfDate||S.meta.cashAsOf||'';
    const moOf=(()=>{const iso=String(asOf).match(/^(\d{4})-(\d{2})/);const us=String(asOf).match(/^(\d{1,2})\//);return iso?+iso[2]:(us?+us[1]:0);})();
    const qtrsLeft=moOf?Math.max(0,5-Math.ceil(moOf/3)):0;
    const monthsLeft=moOf?Math.max(0,12-moOf):0;
    const monthsAccrued=moOf?((moOf-1)%3)+1:0;
    const sentPct=c.returnSent!=null?Number(c.returnSent):0;
    const madePct=pr.accretionPct!=null?Number(pr.accretionPct):(c.returnEarned!=null?Number(c.returnEarned):0);
    const capitalDollars=(c.capital!=null?Number(c.capital):0)*1000;
    const intLines=S.gl.filter(g=>g.property===code&&isInterestGL(g));
    const autoAvgInt=intLines.length?intLines.reduce((a,g)=>a+Math.abs(Number(g.amount)||0),0)/intLines.length:0;
    const avgInt=(pr.avgMonthlyInterest!=null&&Number(pr.avgMonthlyInterest)>0)?Number(pr.avgMonthlyInterest):autoAvgInt;
    const distQtrs=pr.distributionQuarters||{};
    const effectiveSentPct=distQtrs['rate']!=null?Number(distQtrs['rate']):sentPct;
    const currentQtrDist=distQtrs['current']!=null?Number(distQtrs['current']):(effectiveSentPct/100/12)*capitalDollars*monthsAccrued;
    const futureQtrs=Math.max(0,qtrsLeft-1);
    const futureAccretion=((madePct-effectiveSentPct)/100/4)*capitalDollars*futureQtrs;
    const projRemainingSpendInt=cm.outstandingTotal-avgInt*monthsLeft;
    const inclAccretion=pr.includeAccretionInProj!==false;
    const inclReturns=pr.includeReturnsInProj!==false;
    const projEndCash=cashToday-projRemainingSpendInt-(inclReturns?currentQtrDist:0)+(inclAccretion?futureAccretion:0);
    const cpd=pr.units?projEndCash/Number(pr.units):null;
    const budget=Number(pr.spBudget)||0;
    const yyyyBudgetProj=budget-spent-projRemainingSpendInt;   // matches the property header tile
    const fy=(/^\d{4}/.test(asOf)?String(asOf).slice(0,4):today().slice(0,4));
    return {spent,cashToday,projRemainingSpendInt,futureAccretion,projEndCash,cpd,budget,yyyyBudgetProj,fy,
            units:Number(pr.units)||0,madePct,effectiveSentPct,futureQtrs,inclAccretion};
  };
  const summaryWrap=el('div',{style:'overflow:auto'});
  regions.filter(r=>!DASH.region||r===DASH.region).forEach(reg=>{
    const regProps=props.filter(q=>q.region===reg); if(!regProps.length)return;
    const regData=regProps.map(pr=>({pr,s:calcProjStats(pr)}));
    summaryWrap.append(el('div',{style:'padding:5px 14px;font-size:11.5px;font-weight:600;color:var(--ink-3);background:var(--surface-2);border-bottom:1px solid var(--line)'},
      `${reg} — ${PROP(regProps[0].code).manager}`));
    regData.forEach(({pr,s})=>{
      const endTone=s.projEndCash<0?'bad':(s.projEndCash<s.cashToday*0.25?'warn':'good');
      const cpdTone=s.cpd==null?'none':(s.cpd>=3000?'good':(s.cpd>=2000?'warn':'bad'));
      const ybpTone=s.yyyyBudgetProj<0?'bad':(s.budget&&s.yyyyBudgetProj<s.budget*0.15?'warn':'good');
      summaryWrap.append(el('div',{class:'psum-row',style:'display:flex;align-items:stretch;border-bottom:1px solid var(--line-2)'},
        el('div',{class:'psum-prop',style:'min-width:110px;max-width:110px;padding:8px 10px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid var(--line-2);cursor:pointer',
          onclick:()=>{VIEW.tab='property';VIEW.prop=pr.code;render();}},
          el('div',{style:'display:flex;align-items:center;gap:6px'},
            el('span',{class:'pl-dot',style:'background:'+pcolor(pr.code)}),
            el('strong',{style:'font-size:12px'},pr.code)),
          el('div',{style:'font-size:10.5px;color:var(--ink-3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'},pr.name)),
        el('div',{class:'headstats',style:'flex:1'},
          hstat('Spent to date', fmt(s.spent), 'none', ''),
          hstat('Current cash', fmt(s.cashToday), 'none', ''),
          hstat(`Proj addt Expenses ${s.fy}`, fmt(s.projRemainingSpendInt), 'none', ''),
          hstat(`Remaining in ${s.fy}`, fmt(s.yyyyBudgetProj), ybpTone, ''),
          hstat(`${s.fy} Remaining Accretion`, fmt(s.futureAccretion), s.futureAccretion>=0?'good':'bad', `${(s.madePct-s.effectiveSentPct).toFixed(1)}% · ${s.futureQtrs}q${s.inclAccretion?'':' excl.'}`),
          hstat(`Proj ${s.fy} end Cash`, fmt(s.projEndCash), endTone, ''),
          hstat('Cash / door', s.cpd==null?'—':fmt(s.cpd), cpdTone, ''))));
    });
    const fy=regData[0]?regData[0].s.fy:today().slice(0,4);
    const tot={spent:0,cash:0,projRem:0,accretion:0,projEnd:0,units:0,budget:0,ybp:0};
    regData.forEach(({s})=>{tot.spent+=s.spent;tot.cash+=s.cashToday;tot.projRem+=s.projRemainingSpendInt;tot.accretion+=s.futureAccretion;tot.projEnd+=s.projEndCash;tot.units+=s.units;tot.budget+=s.budget;tot.ybp+=s.yyyyBudgetProj;});
    const totCpd=tot.units?tot.projEnd/tot.units:null;
    const totEndTone=tot.projEnd<0?'bad':(tot.projEnd<tot.cash*0.25?'warn':'good');
    const totCpdTone=totCpd==null?'none':(totCpd>=3000?'good':(totCpd>=2000?'warn':'bad'));
    const totYbpTone=tot.ybp<0?'bad':(tot.budget&&tot.ybp<tot.budget*0.15?'warn':'good');
    summaryWrap.append(el('div',{class:'psum-row',style:'display:flex;align-items:stretch;border-bottom:2px solid var(--line);background:var(--surface-2)'},
      el('div',{class:'psum-prop',style:'min-width:110px;max-width:110px;padding:8px 10px;display:flex;align-items:center;border-right:1px solid var(--line-2)'},
        el('span',{style:'font-size:11px;font-weight:600;color:var(--ink-3)'},'Subtotal')),
      el('div',{class:'headstats',style:'flex:1'},
        hstat('Spent to date', fmt(tot.spent), 'none', ''),
        hstat('Current cash', fmt(tot.cash), 'none', ''),
        hstat(`Proj addt Expenses ${fy}`, fmt(tot.projRem), 'none', ''),
        hstat(`Remaining in ${fy}`, fmt(tot.ybp), totYbpTone, ''),
        hstat(`${fy} Remaining Accretion`, fmt(tot.accretion), tot.accretion>=0?'good':'bad', ''),
        hstat(`Proj ${fy} end Cash`, fmt(tot.projEnd), totEndTone, ''),
        hstat('Cash / door', totCpd==null?'—':fmt(totCpd), totCpdTone, ''))));
  });
  tp.append(summaryWrap);
  body.append(tp);

  /* Needs attention (awaiting approval moved above the pipeline) */
  body.append(attentionPanel('Work done, not yet closed', active.filter(p=>p.steps.workCompleted&&!p.steps.completed)));

  /* Unplanned large postings (audit) */
  const unp=unplannedAll().filter(g=>glOk(g));
  const up=el('div',{class:'panel'});
  up.append(el('div',{class:'ph'}, el('h3',{},'Unplanned postings over $5,000'), el('div',{class:'sp'}),
    el('span',{style:'font-size:11.5px;color:var(--ink-3)'},'large GL entries not tied to a tracked project'),
    el('span',{class:'chip'+(unp.length?' hold':' done')},String(unp.length))));
  const ub=el('div',{style:'max-height:320px;overflow:auto'});
  if(!unp.length)ub.append(el('div',{class:'empty'},'None — every large posting is tied to a project.'));
  else{
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('Property'),th('Date'),th('Category'),th('Vendor / description'),th('Amount','r'))));
    const tb2=el('tbody');
    unp.slice().sort((a,b)=>b.amount-a.amount).forEach(g=>{
      tb2.append(el('tr',{class:'clickrow',onclick:()=>{VIEW.tab='property';VIEW.prop=g.property;render();}},
        td(propChip(g.property)),
        td(el('span',{class:'mono',style:'font-size:12px'},g.date)),
        td(el('span',{style:'font-size:12px'},g.category)),
        td(el('div',{style:'font-size:12px;max-width:340px'}, el('div',{},g.vendor), g.remarks?el('div',{style:'color:var(--ink-3);font-size:11px'},g.remarks):null)),
        tdn(g.amount,1)));
    });
    t.append(tb2); ub.append(t);
  }
  up.append(ub); body.append(up);
  return {bar,body};
}
function discussedPanel(list){
  const p=el('div',{class:'panel'});
  const propsInList=[...new Set(list.map(x=>x.property))].sort();
  const cost=x=>(x.anticipatedCost!=null?x.anticipatedCost:(x.actualCost!=null?x.actualCost:0));
  let view=list.slice();
  if(DASH.discProp && propsInList.includes(DASH.discProp)) view=view.filter(x=>x.property===DASH.discProp);
  const sorters={cost:(a,b)=>cost(b)-cost(a),costAsc:(a,b)=>cost(a)-cost(b),
    new:(a,b)=>(b.dateAdded||'').localeCompare(a.dateAdded||''),old:(a,b)=>(a.dateAdded||'').localeCompare(b.dateAdded||''),
    prop:(a,b)=>a.property.localeCompare(b.property)||cost(b)-cost(a),name:(a,b)=>(a.name||'').localeCompare(b.name||'')};
  view.sort(sorters[DASH.discSort]||sorters.cost);
  p.append(el('div',{class:'ph'}, el('h3',{},'Discussed · awaiting approval'), el('div',{class:'sp'}), el('span',{class:'chip'},String(view.length))));
  const sortSel=el('select',{class:'mini-sel',onchange:e=>{DASH.discSort=e.target.value;render();}});
  [['cost','Cost: high → low'],['costAsc','Cost: low → high'],['new','Newest first'],['old','Oldest first'],['prop','Property'],['name','Name A–Z']]
    .forEach(o=>sortSel.append(el('option',{value:o[0],...(DASH.discSort===o[0]?{selected:true}:{})},o[1])));
  const propSel=el('select',{class:'mini-sel',onchange:e=>{DASH.discProp=e.target.value;render();}});
  propSel.append(el('option',{value:'',...(DASH.discProp?{}:{selected:true})},'All properties'));
  propsInList.forEach(cd=>propSel.append(el('option',{value:cd,...(DASH.discProp===cd?{selected:true}:{})},cd)));
  p.append(el('div',{class:'pad disc-tools'}, el('span',{class:'dt-lab'},'Sort'), sortSel, el('span',{class:'dt-lab'},'Filter'), propSel));
  const b=el('div',{style:'max-height:300px;overflow:auto'});
  if(!view.length) b.append(el('div',{class:'empty'},'Nothing here — all clear.'));
  view.slice(0,80).forEach(p2=>{
    const r=el('div',{class:'clickrow',style:'display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line-2)',onclick:()=>openProject(p2.id)});
    r.append(propChip(p2.property),
      el('div',{style:'flex:1;min-width:0'}, el('div',{style:'font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'},p2.name,projSym(p2)),
        el('div',{style:'font-size:11px;color:var(--ink-3)'},p2.category+(p2.dateAdded?' · '+p2.dateAdded:''))),
      el('span',{class:'mono',style:'font-size:12px;color:var(--ink-3)'},fmt(cost(p2),false)));
    b.append(r);
  });
  p.append(b); return p;
}
function attentionPanel(title,list){
  const p=el('div',{class:'panel'});
  p.append(el('div',{class:'ph'}, el('h3',{},title), el('div',{class:'sp'}), el('span',{class:'chip'},String(list.length))));
  const b=el('div',{style:'max-height:280px;overflow:auto'});
  if(!list.length) b.append(el('div',{class:'empty'},'Nothing here — all clear.'));
  list.slice(0,40).forEach(p2=>{
    const r=el('div',{class:'clickrow',style:'display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line-2)',onclick:()=>openProject(p2.id)});
    r.append(propChip(p2.property),
      el('div',{style:'flex:1;min-width:0'}, el('div',{style:'font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'},p2.name),
        el('div',{style:'font-size:11px;color:var(--ink-3)'},p2.category)),
      el('span',{class:'mono',style:'font-size:12px;color:var(--ink-3)'},fmt(p2.anticipatedCost||p2.actualCost,false)));
    b.append(r);
  });
  p.append(b); return p;
}
function legendItem(color,label){ return el('span',{}, el('span',{class:'dot',style:`background:${color}`}), label); }
/* Conditional-format tile for the property sticky header. tone: good|warn|bad|none */
function hstat(label,valueText,tone,sub,onClick){
  return el('div',{class:'hstat tone-'+(tone||'none')+(onClick?' hs-click':''),...(onClick?{onclick:onClick,style:'cursor:pointer',title:'Click for details'}:{})},
    el('div',{class:'hs-lab'},label,onClick?el('span',{style:'opacity:.5;font-weight:400'},'  ›'):null),
    el('div',{class:'hs-val mono'},valueText),
    sub?el('div',{class:'hs-sub'},sub):null);
}
/* Wrap a section in a tap-to-expand fold (collapsed by default). Used on mobile
   to keep the dashboard skimmable; callers pass it through only at phone widths. */
function mobileFold(title, hint, contentEl){
  const d=el('details',{class:'sec-fold'});
  d.append(el('summary',{class:'sec-sum'}, el('span',{class:'chev'},'▸'), title, hint?el('span',{class:'sec-hint'},hint):null), contentEl);
  return d;
}
/* Locked (sticky) property header: name + key SP-budget & cash-per-door metrics. */
function propHead(p,actions,metrics){
  const t=el('div',{class:'topbar prop-head'});
  const menu=el('button',{class:'btn ghost sm menu-btn',onclick:()=>{VIEW.railOpen=!VIEW.railOpen;render();}},'☰');
  const r1=el('div',{class:'ph-row1'}, menu,
    el('div',{class:'tt'}, el('div',{class:'crumb'},`${p.region} · ${p.manager}`), el('h2',{}, el('span',{style:`display:inline-block;width:11px;height:11px;border-radius:3px;background:${pcolor(p.code)};margin-right:8px;vertical-align:middle`}), `${p.code} — ${p.name}`)),
    el('div',{class:'ph-actions'}, ...actions));
  const stats=el('div',{class:'headstats'}, ...metrics);
  // On phones the metric tiles dominate the screen, so tuck them behind a
  // tap-to-expand fold (collapsed by default). Desktop renders them inline as before.
  if(window.matchMedia('(max-width:820px)').matches){
    const fold=el('details',{class:'metrics-fold'});
    fold.append(el('summary',{class:'metrics-sum'}, el('span',{class:'chev'},'▸'), 'Financial summary', el('span',{class:'ms-hint'},`${metrics.length} metrics`)), stats);
    fold.addEventListener('toggle', syncHeadOffset);   // header height changes → update sticky offset
    t.append(r1, fold);
  } else {
    t.append(r1, stats);
  }
  return t;
}
function barCell(used){
  const over=used>1;
  const w=Math.min(100,used*100);
  return el('div',{style:'display:flex;align-items:center;gap:7px;justify-content:flex-end'},
    el('span',{class:'mono',style:'font-size:11px;color:'+(over?'var(--rust)':'var(--ink-3)')},pct(used)),
    el('div',{class:'bar'+(over?' over':''),style:'width:70px'}, el('i',{style:`width:${w}%`})));
}
function reconCell(label,val,flag){
  return el('div',{class:'rc'}, el('div',{class:'rk'},label),
    el('div',{class:'rv mono'+(flag?' neg':'')},fmt(val)));
}
function flagBlock(title,items,tone,note){
  const wrap=el('div',{class:'flagblock'});
  wrap.append(el('div',{class:'fb-h'}, el('span',{class:'fb-dot '+tone}),
    el('span',{},title), el('span',{style:'flex:1'}),
    el('span',{class:'chip'+(items.length?(tone==='rust'?' hold':' '):' done'),style:items.length&&tone==='amber'?'background:var(--amber-soft);color:var(--amber)':''},String(items.length))));
  if(!items.length){ wrap.append(el('div',{class:'fb-ok'},'None — all clear.')); return wrap; }
  wrap.append(el('div',{class:'fb-note'},note));
  items.slice(0,8).forEach(it=>{
    const r=el('div',{class:'fb-row'+(it.onclick?' clickrow':'')});
    if(it.onclick)r.addEventListener('click',it.onclick);
    r.append(el('div',{style:'flex:1;min-width:0'}, el('div',{class:'fb-t'},it.title), el('div',{class:'fb-s'},it.sub)),
      el('span',{class:'mono fb-amt'},fmt(it.amt)));
    wrap.append(r);
  });
  if(items.length>8) wrap.append(el('div',{class:'fb-s',style:'padding:6px 0 0'},`+ ${items.length-8} more`));
  return wrap;
}

/* =========================================================
   PROJECTS
========================================================= */
function dateFilterGroup(state){
  const g=el('div',{class:'fgroup'}, el('span',{class:'bub-lab'},'Added'));
  g.append(el('input',{type:'date',class:'date-f',value:state.dateFrom||'',title:'Added on or after',oninput:e=>{state.dateFrom=e.target.value;render();}}));
  g.append(el('span',{class:'date-sep'},'to'));
  g.append(el('input',{type:'date',class:'date-f',value:state.dateTo||'',title:'Added on or before',oninput:e=>{state.dateTo=e.target.value;render();}}));
  if(state.dateFrom||state.dateTo) g.append(el('button',{class:'bub sm',title:'Clear date range',onclick:()=>{state.dateFrom='';state.dateTo='';render();}},'Clear ✕'));
  return g;
}
function viewProjects(){
  const bar=topbar('Pipeline','Projects',
    regionSeg(()=>FILT.region||'',v=>{FILT.region=v;}),
    el('button',{class:'btn accent',onclick:()=>openProject(null)},'+ New project'));
  const body=el('div',{});

  // ---- filters ----
  // Statuses are mutually exclusive (projStatus). Completed / on-hold /
  // paid-closeout / notes are OFF by default — active pipeline work only.
  const orderedProps=propsByRegion();
  const ALLPROPS=orderedProps.map(p=>p.code);
  const STAT=[['working','Work In Progress'],['contracted','Contracted'],['approved','Approved'],['discussed','Discussed'],['inhouse','In-house'],['paid','Paid / Closeout'],['note','Notes'],['hold','On Hold'],['done','Completed']];
  const ALLSTAT=STAT.map(s=>s[0]);
  const DEFAULT_STATS=['working','contracted','approved','discussed','inhouse'];
  const ALLCATS=[...new Set(S.projects.map(p=>p.category))].sort();
  if(!Array.isArray(FILT.props))FILT.props=ALLPROPS.slice();
  if(!Array.isArray(FILT.statuses))FILT.statuses=DEFAULT_STATS.slice();
  FILT.statuses=FILT.statuses.filter(s=>ALLSTAT.includes(s));   // drop stale keys (e.g. old 'open')
  if(!Array.isArray(FILT.cats))FILT.cats=ALLCATS.slice();
  FILT.cats=FILT.cats.filter(c=>ALLCATS.includes(c));
  const toggle=(arr,v)=>{const i=arr.indexOf(v);if(i<0)arr.push(v);else arr.splice(i,1);render();};
  const setAll=(arr,full)=>{ if(arr.length>=full.length){arr.length=0;} else {arr.length=0; full.forEach(v=>arr.push(v));} render(); };
  const isAll=(arr,full)=>arr.length>=full.length;

  // toolbar: search + board/table
  const tb=el('div',{class:'toolbar'});
  tb.append(el('input',{type:'search',placeholder:'Search projects…',value:FILT.q,style:'min-width:220px;flex:1',oninput:e=>{FILT.q=e.target.value;debounced();}}));
  tb.append(el('div',{class:'seg-ctl'},
    el('button',{class:FILT.view==='board'?'on':'',onclick:()=>{FILT.view='board';render();}},'Board'),
    el('button',{class:FILT.view==='table'?'on':'',onclick:()=>{FILT.view='table';render();}},'Table')));
  body.append(tb);

  const fbar=el('div',{class:'filter-panel'});

  // property group — the topbar region toggle narrows the bubbles shown here
  const visProps=orderedProps.filter(pr=>!FILT.region||pr.region===FILT.region);
  const allP=isAll(FILT.props,ALLPROPS);
  const propRow=el('div',{class:'fgroup'}, el('span',{class:'bub-lab'},'Property'),
    el('button',{class:'bub all'+(allP?' on':''),onclick:()=>setAll(FILT.props,ALLPROPS)}, allP?'All ✓':'All'));
  visProps.forEach(pr=>{ const on=FILT.props.includes(pr.code);
    propRow.append(el('button',{class:'bub'+(on?' on':''),style:on?`background:${pcolor(pr.code)};border-color:${pcolor(pr.code)};color:#fff`:'',
      onclick:()=>toggle(FILT.props,pr.code)}, el('span',{class:'bub-dot',style:'background:'+pcolor(pr.code)}), pr.code)); });
  fbar.append(propRow);

  // status group — chips show live counts (within the other active filters)
  const preStatus=S.projects.filter(p=>FILT.props.includes(p.property)&&FILT.cats.includes(p.category)&&(FILT.showATL||!isATL(p))&&inDateRange(p,FILT)
    &&(!FILT.region||regionOfCode(p.property)===FILT.region)
    &&(!FILT.q||((p.name+' '+p.contractor+' '+p.plan+' '+p.actionItem+' '+p.category).toLowerCase().includes(FILT.q.toLowerCase()))));
  const statCounts={}; preStatus.forEach(p=>{ const s=projStatus(p); statCounts[s]=(statCounts[s]||0)+1; });
  const isDefault=FILT.statuses.length===DEFAULT_STATS.length&&DEFAULT_STATS.every(s=>FILT.statuses.includes(s));
  const statRow=el('div',{class:'fgroup'}, el('span',{class:'bub-lab'},'Status'),
    el('button',{class:'bub all'+(isDefault?' on':''),title:'Active pipeline only — hides Completed, On Hold, Paid/Closeout and Notes',
      onclick:()=>{FILT.statuses=DEFAULT_STATS.slice();render();}},'Active ✓'),
    el('button',{class:'bub all'+(isAll(FILT.statuses,ALLSTAT)?' on':''),onclick:()=>setAll(FILT.statuses,ALLSTAT)},'All'));
  STAT.forEach(([k,lab])=>{ const on=FILT.statuses.includes(k);
    statRow.append(el('button',{class:'bub'+(on?' on accent':''),onclick:()=>toggle(FILT.statuses,k)},
      lab, statCounts[k]?el('span',{style:'margin-left:5px;opacity:.75;font-size:10px'},String(statCounts[k])):null)); });
  // Above-the-Line toggle — hidden by default (operationally funded work)
  const atlCount=S.projects.filter(isATL).length;
  if(atlCount) statRow.append(el('button',{class:'bub'+(FILT.showATL?' on accent':''),
    title:'Operationally funded ("Above the Line" in the name) — excluded from SP projections; hidden unless toggled on',
    onclick:()=>{FILT.showATL=!FILT.showATL;render();}},`Above the Line (${atlCount})`));
  fbar.append(statRow);

  // category group — checkbox dropdown, with selected shown as bubbles
  const allC=isAll(FILT.cats,ALLCATS);
  const catRow=el('div',{class:'fgroup'}, el('span',{class:'bub-lab'},'Category'));
  const ddWrap=el('div',{class:'cat-dd'});
  ddWrap.append(el('button',{class:'bub dd-btn'+(FILT.catOpen?' open':''),onclick:()=>{FILT.catOpen=!FILT.catOpen;render();}},
    (allC?'All categories':`${FILT.cats.length} of ${ALLCATS.length}`), el('span',{class:'chev'},'▾')));
  if(FILT.catOpen){
    const panel=el('div',{class:'cat-dd-panel'});
    panel.append(el('button',{class:'bub all'+(allC?' on':''),style:'margin-bottom:6px',onclick:()=>setAll(FILT.cats,ALLCATS)}, allC?'Clear all':'Select all'));
    ALLCATS.forEach(cat=>{ const on=FILT.cats.includes(cat);
      panel.append(el('label',{class:'cat-item'},
        (()=>{const c=el('input',{type:'checkbox',onchange:()=>toggle(FILT.cats,cat)}); if(on)c.checked=true; return c;})(),
        el('span',{},cat))); });
    ddWrap.append(panel);
  }
  catRow.append(ddWrap);
  if(!allC) FILT.cats.slice().sort().forEach(cat=>catRow.append(el('button',{class:'bub on accent sm',title:'Remove',onclick:()=>toggle(FILT.cats,cat)},cat,' ✕')));
  fbar.append(catRow);
  fbar.append(dateFilterGroup(FILT));
  body.append(fbar);

  // ---- apply filters (statuses are mutually exclusive via projStatus) ----
  let list=preStatus.filter(p=>FILT.statuses.includes(projStatus(p)));

  const shownTotal=list.reduce((a,p)=>a+(isInHouse(p)?ihTotal(p):projOutflow(p)),0);
  const hiddenN=preStatus.length-list.length;
  body.append(el('div',{style:'font-size:12.5px;color:var(--ink-3);margin:4px 0 12px'},
    `${list.length} project${list.length!==1?'s':''}${shownTotal?` · ${fmt(shownTotal,false)} total`:''}${hiddenN?` · ${hiddenN} hidden by status filter`:''}`));

  if(!list.length){ body.append(el('div',{class:'empty'}, el('div',{class:'big'},'No projects match'),'Adjust the filters or add a new project.')); return {bar,body}; }

  if(FILT.view==='board'){
    // Board grouped by status in pipeline order; pinned cards float to the top.
    const LBL=Object.fromEntries(STAT);
    const groupHead=(label,n,total)=>el('div',{style:'display:flex;align-items:center;gap:8px;margin:16px 2px 8px;font-family:var(--disp);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);border-bottom:1px solid var(--line);padding-bottom:5px'},
      label, el('span',{class:'chip'},String(n)),
      el('div',{style:'flex:1'}), total?el('span',{class:'mono',style:'font-size:11px'},fmt(total,false)):'');
    const pinned=list.filter(p=>p.pinned);
    if(pinned.length){
      body.append(groupHead('📌 Pinned',pinned.length,0));
      const pb2=el('div',{class:'board'}); pinned.forEach(p=>pb2.append(projectCard(p))); body.append(pb2);
    }
    ALLSTAT.forEach(k=>{
      const grp=list.filter(p=>!p.pinned&&projStatus(p)===k);
      if(!grp.length)return;
      grp.sort((a,b)=>(stage(b)-stage(a))||(b.dateAdded||'').localeCompare(a.dateAdded||''));
      const gTotal=grp.reduce((a,p)=>a+(isInHouse(p)?ihTotal(p):projOutflow(p)),0);
      body.append(groupHead(LBL[k],grp.length,gTotal));
      const board=el('div',{class:'board'});
      grp.forEach(p=>board.append(projectCard(p)));
      body.append(board);
    });
  } else {
    body.append(projectsTable(list));
  }
  return {bar,body};
}
let _t;function debounced(){clearTimeout(_t);_t=setTimeout(render,180);}

/* =========================================================
   IN-HOUSE TRACKING (own-crew projects)
========================================================= */
function viewInHouse(){
  const bar=topbar('Own crew','In-house projects',
    regionSeg(()=>IHF.region,v=>{IHF.region=v;}),
    el('button',{class:'btn accent',onclick:()=>openProject(null,{inHouse:true})},'+ New in-house project'));
  const body=el('div',{});
  const list=S.projects.filter(isInHouse).filter(p=>!IHF.region||regionOfCode(p.property)===IHF.region);
  if(!list.length){ body.append(el('div',{class:'empty'}, el('div',{class:'big'},IHF.region?'No in-house projects in '+IHF.region:'No in-house projects yet'),'Add one here, or toggle “In-house (own crew)” on any project in its editor.')); return {bar,body}; }
  const bud=list.filter(ihIsBudget);
  const tot=bud.reduce((a,p)=>a+ihTotal(p),0), done=bud.reduce((a,p)=>a+ihDone(p),0);
  const inProg=list.filter(p=>!isComplete(p)&&!p.onHold).length;
  const qtyCount=list.length-bud.length;
  const k=el('div',{class:'grid kpis',style:'grid-template-columns:repeat(4,1fr)'});
  const kpi=(l,v,s,cls)=>el('div',{class:'kpi'+(cls?' '+cls:'')}, el('div',{class:'lab'},l), el('div',{class:'val'},v), el('div',{class:'sub'},s));
  k.append(kpi('In-house projects',String(list.length),`${inProg} in progress${qtyCount?` · ${qtyCount} by count`:''}`),
    kpi('Est. to complete',fmt(tot),'budget-tracked'),
    kpi('Completed to date',fmt(done),pct(tot?done/tot:0)+' of budget','accent'),
    kpi('Remaining',fmt(tot-done),'budget work left'));
  body.append(k);
  const grid=el('div',{class:'ih-grid'});
  list.sort((a,b)=>(a.onHold-b.onHold)||((isComplete(a)?1:0)-(isComplete(b)?1:0))||(ihPct(b)-ihPct(a)));
  list.forEach(p=>grid.append(ihTile(p)));
  body.append(grid);
  return {bar,body};
}
function ihTile(p){
  const pc=ihPct(p), done=isComplete(p);
  const t=el('div',{class:'ih-tile',style:'border-top:3px solid '+pcolor(p.property),onclick:()=>openProject(p.id)});
  t.append(el('div',{class:'iht-top'}, propChip(p.property),
    el('span',{class:'chip',style:'font-size:9.5px'}, ihIsBudget(p)?'$':'#'),
    el('div',{style:'flex:1'}),
    p.onHold?el('span',{class:'chip hold'},'Hold'):done?el('span',{class:'chip done'},'Done'):el('span',{class:'chip ih'},ihTotal(p)>0?pct(pc):'note')));
  t.append(el('div',{class:'iht-name'},p.name));
  t.append(el('div',{class:'iht-cat'},p.category));
  t.append(el('div',{class:'ih-bigbar'}, el('i',{class:done?'full':'',style:'width:'+Math.round(pc*100)+'%'})));
  t.append(el('div',{class:'iht-fig'},
    el('span',{}, el('span',{class:'mono',style:'font-weight:600'},ihFmt(p,ihDone(p))), el('span',{style:'color:var(--ink-3)'},' / '+ihFmt(p,ihTotal(p)))),
    el('span',{style:'color:var(--ink-3)'},ihFmt(p,ihRemaining(p))+' left')));
  const last=(p.progressNotes||[]).slice(-1)[0];
  t.append(el('div',{class:'iht-note'}, last?el('span',{},el('span',{class:'mono'},last.date),' · ',last.note):el('span',{style:'color:var(--ink-3)'},'No progress notes yet')));
  return t;
}

function projectCard(p){
  const ih=isInHouse(p);
  const c=el('div',{class:'pcard'+(ih?' inhouse':''),onclick:()=>openProject(p.id)});
  const top=el('div',{class:'top'}, propChip(p.property));
  if(isSplitP(p))top.append(el('span',{class:'chip',title:allocsOf(p).map(a=>a.property+' '+a.pct+'%').join(' · ')},'⇄ split'));
  if(ih)top.append(el('span',{class:'chip ih'},'In-house'));
  if(p.pinned)top.append(el('span',{class:'pin-i',title:'Pinned'},'📌'));
  if(p.onHold)top.append(el('span',{class:'chip hold'},'On hold'));
  else if(isComplete(p))top.append(el('span',{class:'chip done'},'Complete'));
  else if(phase(p)==='note')top.append(el('span',{class:'chip note'},'Note'));
  else if(!ih&&phase(p)==='discussed')top.append(el('span',{class:'chip discussed'},'Discussed'));
  top.append(el('div',{style:'flex:1'}), el('span',{style:'font-size:11px;color:var(--ink-3)'},p.category));
  c.append(top);
  c.append(el('div',{class:'nm'},p.name,projSym(p)));
  c.append(el('div',{class:'meta'}, p.contractor? '◷ '+p.contractor : (p.actionItem? p.actionItem.slice(0,70):'—')));
  c.append(el('div',{class:'card-added'}, 'Added '+fmtDate(p.dateAdded)));
  if(ih){
    c.append(progressEl(p));
    const t=ihTotal(p), d=ihDone(p);
    c.append(el('div',{class:'ft'},
      el('span',{}, isComplete(p)?'✓ done':(t>0?pct(ihPct(p))+' complete':'note')),
      el('span',{class:'cost'}, t>0?ihFmt(p,d)+' / '+ihFmt(p,t):'—')));
  } else {
    c.append(trackEl(p));
    const cost=p.actualCost!=null?p.actualCost:p.anticipatedCost;
    const lab=p.actualCost!=null?'actual':'planned';
    c.append(el('div',{class:'ft'},
      el('span',{}, `${stepsDone(p)}/${stepsTotal(p)} · `, el('span',{},isComplete(p)?'done':(phase(p)==='note'?'note':(stage(p)>=0?LIFECYCLE[stage(p)].label:'planned')))),
      el('span',{class:'cost'}, cost!=null? fmt(cost):'—', cost!=null?el('span',{style:'font-weight:400;color:var(--ink-3);font-size:10px'},' '+lab):'')));
  }
  return c;
}
function progressEl(p){
  const pc=ihPct(p); const done=isComplete(p);
  return el('div',{class:'progress',title:pct(pc)+' complete'}, el('i',{class:done?'full':'',style:`width:${Math.round(pc*100)}%`}));
}
function trackEl(p){
  const t=el('div',{class:'track'});
  // N/A (no-contract) and auto attachment-derived steps excluded from the bar.
  const steps=appLifecycle(p).filter(s=>!AUTO_STEPS.includes(s.key));
  let cur=-1; steps.forEach((s,i)=>{ if(p.steps&&p.steps[s.key])cur=i; });
  steps.forEach((s,i)=>{
    const done=p.steps&&p.steps[s.key];
    const cls=done?(i===cur&&!isComplete(p)?'seg cur':'seg done'):'seg';
    const seg=el('div',{class:cls,title:`${s.label}${done?' ✓':''}`});
    t.append(seg);
  });
  return t;
}
function projectsTable(list){
  const wrap=el('div',{class:'panel',style:'overflow:auto'});
  const tbl=el('table',{class:'tbl'});
  tbl.append(el('thead',{},tr(th('Property'),th('Project'),th('Category'),th('Added'),th('Contractor'),th('Lifecycle'),th('Cost','r'),th('Status'))));
  const tb=el('tbody');
  const propOrder=propsByRegion().map(p=>p.code);
  list.sort((a,b)=>(propOrder.indexOf(a.property)-propOrder.indexOf(b.property))||(stage(b)-stage(a)));
  list.forEach(p=>{
    const ih=isInHouse(p);
    const cost=ih?ihTotal(p):(p.actualCost!=null?p.actualCost:p.anticipatedCost);
    tb.append(el('tr',{class:'clickrow',onclick:()=>openProject(p.id)},
      td(propChip(p.property)),
      td(el('div',{style:'font-weight:600;max-width:280px'},p.name,projSym(p),
        isSplitP(p)?el('span',{class:'chip',style:'margin-left:6px',title:allocsOf(p).map(a=>a.property+' '+a.pct+'%').join(' · ')},'⇄'):null,
        ih?el('span',{class:'chip ih',style:'margin-left:6px'},'In-house'):null)),
      td(el('span',{style:'font-size:12px'},p.category)),
      td(el('span',{style:'font-size:12px;white-space:nowrap;color:var(--ink-3)'},fmtDate(p.dateAdded))),
      td(el('span',{style:'font-size:12px'},ih?'own crew':(p.contractor||'—'))),
      td(el('div',{style:'min-width:150px'}, ih?progressEl(p):trackElMini(p))),
      tdn(cost,1),
      td(p.onHold?el('span',{class:'chip hold'},'Hold'):isComplete(p)?el('span',{class:'chip done'},'Done'):(ih?el('span',{class:'chip ih'},pct(ihPct(p))):el('span',{class:'chip'},`${stepsDone(p)}/${stepsTotal(p)}`)))));
  });
  tbl.append(tb); wrap.append(tbl); return wrap;
}
function trackElMini(p){ const t=trackEl(p); return t; }

/* =========================================================
   PROJECT EDITOR (sheet)
========================================================= */
function openProject(id,preset){
  const isNew=!id;
  let p = isNew ? {id:uid('P'),property:VIEW.prop||S.properties[0].code,category:'GENERAL',name:'',description:'',plan:'',contractor:'',actionItem:'',anticipatedCost:null,actualCost:null,dateAdded:today(),plannedStart:'',plannedEnd:'',bids:[],steps:{},notes:'',onHold:false,pinned:false,inHouse:false,ihUnit:'budget',totalToComplete:null,amountCompleted:null,progressNotes:[],noContract:false,noContractSet:false,commitCash:false,split:null}
                 : JSON.parse(JSON.stringify(S.projects.find(x=>x.id===id)));
  if(isNew&&preset)Object.assign(p,preset);
  p.steps=p.steps||{}; p.bids=p.bids||[]; p.progressNotes=p.progressNotes||[];
  while(p.bids.length<3) p.bids.push({id:uid('b'),contractor:'',amount:null,approved:false,file:null});
  // Each bid holds an ordered list of files (first = scope/totals, rest = supporting docs).
  // Normalize legacy single-file bids into the array form.
  p.bids.forEach(bd=>{ if(!Array.isArray(bd.files)) bd.files = bd.fileKey?[{fileKey:bd.fileKey,fileName:bd.fileName,fileSize:bd.fileSize}]:[]; });
  syncDerivedSteps(p);   // signed / lienWaiver mirror their attachments
  const fileSize=n=>n==null?'':n<1024?n+' B':n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB';
  const reg=()=>PROP(p.property)?PROP(p.property).region:'';

  const scrim=el('div',{class:'scrim',onclick:e=>{if(e.target===scrim)close();}});
  const sheet=el('div',{class:'sheet sheet-editor'});
  function close(){scrim.remove();}
  function save(){
    if(!p.name.trim()){toast('Give the project a name first.');return;}
    if(p.split&&p.split.list&&p.split.list.length>1&&p.split.mode==='custom'){
      const sum=p.split.list.reduce((a,x)=>a+(Number(x.pct)||0),0);
      if(Math.abs(sum-100)>0.1){toast(`Split percentages total ${Math.round(sum*100)/100}% — they must equal 100%.`);return;}
    }
    if(p.split&&(!p.split.list||p.split.list.length<2))p.split=null;
    p.region=reg(); p.manager=PROP(p.property).manager;
    p.bids=p.bids.filter(bd=>bd.contractor||bd.amount!=null||bd.file||bd.fileKey||bd.approved);
    close(); saveProject(p, isNew?'Project added':'Project saved', isNew);
  }
  function del(){ close(); deleteProject(p.id); }

  const head=el('div',{class:'sh'},
    propChip(p.property),
    el('h2',{style:'font-size:16px;flex:1'}, isNew?'New project':'Edit project'),
    el('button',{class:'btn ghost',onclick:close},'Cancel'),
    el('button',{class:'btn accent',onclick:save},'Save'));
  const b=el('div',{class:'sb'});

  // --- core fields ---
  const core=el('div',{class:'panel pad'});
  const f=(label,node)=>el('div',{class:'field'}, el('label',{},label), node);
  const inp=(key,attrs={})=>{const n=el('input',{value:p[key]==null?'':p[key],...attrs,oninput:e=>p[key]=attrs.type==='number'?(e.target.value===''?null:+e.target.value):e.target.value});return n;};
  // Contractor validation helpers.
  const ctrKnown=(val)=>(S.contractors||[]).some(c=>c.name.trim().toLowerCase()===val.trim().toLowerCase());
  const ctrWarn=async(inp,val)=>{
    const parent=inp.closest('.field')||inp.parentElement; if(!parent)return;
    parent.querySelectorAll('.ctr-warn').forEach(w=>w.remove());
    if(!val||!val.trim()||ctrKnown(val))return;
    const warn=el('div',{class:'ctr-warn',style:'font-size:11px;color:var(--rust);margin-top:3px;display:flex;gap:6px;align-items:center'},
      el('span',{},'⚠ Not in contractor directory'),
      el('button',{class:'btn ghost sm',style:'font-size:10px;padding:1px 6px',onclick:async e=>{
        e.preventDefault();
        const r=await fetch('/api/contractors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:val.trim()})});
        if(r.ok){const j=await r.json();S.contractors=[...(S.contractors||[]),j];warn.remove();toast('Added "'+val.trim()+'" to contractor directory');}
        else toast('Failed to add contractor');
      }},'Add to directory'));
    parent.append(warn);
  };
  const makeDl=(dlId)=>{const dl=el('datalist',{id:dlId});(S.contractors||[]).forEach(c=>dl.append(el('option',{value:c.name})));document.body.append(dl);return dl;};
  const ctrInp=(key,dlId,attrs={})=>{const dl=makeDl(dlId);const n=el('input',{value:p[key]||'',list:dlId,...attrs,oninput:e=>{p[key]=e.target.value;}});n.addEventListener('blur',()=>ctrWarn(n,p[key]));scrim.addEventListener('remove',()=>dl.remove(),{once:true});return n;};
  const ctrInpRaw=(val,placeholder,handler,dlId)=>{const dl=makeDl(dlId);const n=el('input',{value:val,placeholder,list:dlId,oninput:e=>{handler(e);ctrWarn(n,e.target.value);}});n.addEventListener('blur',()=>ctrWarn(n,n.value));scrim.addEventListener('remove',()=>dl.remove(),{once:true});return n;};
  // Entering a cost figure promotes a bare note into a planned project — tick "Planned".
  const costInp=(key)=>{const n=inp(key,{type:'number',placeholder:key==='actualCost'?'from GL':'0'});
    n.addEventListener('input',()=>{
      if(!p.noContractSet){ const co=projOutflow(p); p.noContract = co>0 && co<OVER_THRESHOLD; if(p.noContract)CONTRACT_STEPS.forEach(k=>p.steps[k]=false); }
      if(typeof drawSteps==='function')drawSteps();
      if(typeof refreshNC==='function')refreshNC();
      if(typeof refreshGenPanel==='function')refreshGenPanel();
      if(typeof drawSplit==='function')drawSplit();
    });
    return n;};
  const propSel=el('select',{onchange:e=>{
    p.property=e.target.value;
    if(p.split&&p.split.list&&!p.split.list.some(a=>a.property===p.property)){ p.split.list.unshift({property:p.property,pct:0}); }
    if(typeof drawSplit==='function')drawSplit();
  }});
  propsByRegion().forEach(pr=>propSel.append(el('option',{value:pr.code,...(p.property===pr.code?{selected:true}:{})},`${pr.code} — ${pr.name}`)));
  const catSel=el('select',{onchange:e=>p.category=e.target.value});
  CATEGORIES.forEach(c=>catSel.append(el('option',{value:c,...(p.category===c?{selected:true}:{})},c)));

  const nameInp=inp('name',{placeholder:'e.g. Garage roof repairs'});
  const atlHint=el('div',{style:'display:none;font-size:11.5px;color:var(--wheat-d);background:var(--wheat-soft);border-radius:6px;padding:5px 8px;margin:-6px 0 10px'},
    '⤴ “Above the Line” — funded from operational cashflow. Excluded from SP cash & budget projections, GL tie-out flags and update emails; listed only in the property view’s collapsed group.');
  const refreshATL=()=>{ atlHint.style.display=isATL(p)?'':'none'; };
  nameInp.addEventListener('input',refreshATL);
  core.append(f('Project name',nameInp), atlHint);
  refreshATL();
  core.append(el('div',{class:'frow'}, f('Property',propSel), f('Category',catSel)));
  core.append(f('Plan / scope / comments',el('textarea',{oninput:e=>p.plan=e.target.value},p.plan||'')));
  core.append(el('div',{class:'frow'},
    f('Contractor',ctrInp('contractor','contractor-dl-proj',{placeholder:'Awarded / leading contractor'})),
    f('Current action item',inp('actionItem',{placeholder:'Next step / who owns it'}))));
  core.append(el('div',{class:'frow3'},
    f('Date added',inp('dateAdded',{type:'date'})),
    f('Planned start',inp('plannedStart',{type:'date'})),
    f('Planned end',inp('plannedEnd',{type:'date'}))));
  // mode-specific cost block
  const contractorCost=el('div',{class:'frow'},
    f('Anticipated cost',costInp('anticipatedCost')),
    f('Actual cost',costInp('actualCost')));
  const ihTotalInp=inp('totalToComplete',{type:'number',placeholder:'estimated total $'});
  const ihDoneInp=inp('amountCompleted',{type:'number',placeholder:'$ completed so far'});
  const inhouseCost=el('div',{class:'frow'},
    f('Total to complete',ihTotalInp),
    f('Amount completed',ihDoneInp));
  core.append(contractorCost, inhouseCost);
  // Option pills — colored toggle chips instead of bare checkboxes.
  const optPill=(icon,label,cls,get,set,title)=>{
    const pill=el('button',{type:'button',class:'opt-pill '+cls+(get()?' on':''),...(title?{title}:{}),
      onclick:()=>{ set(!get()); pill.classList.toggle('on',get()); }},
      el('span',{class:'op-ic'},icon), label);
    return pill;
  };
  const holdWrap=optPill('⏸','On hold','hold',()=>!!p.onHold,v=>p.onHold=v,'Park this project for a future period');
  const pinWrap=optPill('📌','Pinned','pin',()=>!!p.pinned,v=>p.pinned=v,'Pin to the top of the property list');
  const ihWrap=optPill('🛠','In-house','ih-p',()=>!!p.inHouse,v=>{p.inHouse=v;applyMode();},'Own crew — progress tracking instead of bids/contracts');
  const ncWrap=optPill('📄','No contract','nc',()=>!!p.noContract,v=>{p.noContract=v;p.noContractSet=true; if(v)CONTRACT_STEPS.forEach(k=>p.steps[k]=false); drawSteps(); if(typeof refreshGenPanel==='function')refreshGenPanel();},'Contract steps become N/A (e.g. under $5K)');
  function refreshNC(){ ncWrap.classList.toggle('on',!!p.noContract); }
  const commitWrap=optPill('💵','Commit to cash','commit',()=>!!p.commitCash,v=>p.commitCash=v,'Count in Outstanding Commitments / projected cash now — even without full bids or a contract');
  // Approved projects are always in the projections, so the toggle is moot.
  function refreshCommit(){ commitWrap.style.display=isApproved(p)?'none':''; }
  refreshCommit();
  const splitPill=optPill('⇄','Split properties','commit',()=>!!(p.split&&p.split.list&&p.split.list.length>1),v=>{
    if(v){ p.split=(p.split&&p.split.list&&p.split.list.length)?p.split:{mode:'units',list:[{property:p.property,pct:100}]}; }
    else { p.split=null; }
    drawSplit();
  },'Share this project’s cost across multiple properties (by unit count or custom %)');
  core.append(el('div',{class:'opt-row'},holdWrap,pinWrap,ihWrap,ncWrap,commitWrap,splitPill));
  b.append(core);

  // --- multi-property cost split ---
  const splitPanel=el('div',{class:'panel',style:'margin-top:16px'});
  const splitMeta=el('span',{class:'chip'},'');
  splitPanel.append(el('div',{class:'ph'}, el('h3',{},'Cost split'), el('div',{class:'sp'}), splitMeta));
  const splitBody=el('div',{class:'pad'});
  splitPanel.append(splitBody);
  function recomputeSplit(){
    if(!p.split||!p.split.list)return;
    if(p.split.mode!=='custom'){
      const totalUnits=p.split.list.reduce((a,x)=>a+(Number((PROP(x.property)||{}).units)||0),0);
      p.split.list.forEach(x=>{ const u=Number((PROP(x.property)||{}).units)||0;
        x.pct=totalUnits?Math.round(u/totalUnits*10000)/100:Math.round(10000/p.split.list.length)/100; });
    }
  }
  function drawSplit(){
    const on=!!(p.split&&p.split.list);
    splitPanel.style.display=on?'':'none';
    splitPill.classList.toggle('on',!!(p.split&&p.split.list&&p.split.list.length>1));
    if(!on)return;
    recomputeSplit();
    splitBody.innerHTML='';
    splitMeta.textContent=p.split.list.length>1?`${p.split.list.length} properties`:'pick the other properties';
    splitBody.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},
      'The total cost is shared between the selected sites — each property’s cash & budget projections carry only its slice. “By unit count” keeps the split pro-rata as unit counts change.'));
    const seg=el('div',{class:'seg-ctl sm',style:'margin-bottom:10px'},
      el('button',{class:p.split.mode!=='custom'?'on':'',onclick:()=>{p.split.mode='units';drawSplit();}},'By unit count'),
      el('button',{class:p.split.mode==='custom'?'on':'',onclick:()=>{p.split.mode='custom';drawSplit();}},'Custom %'));
    splitBody.append(seg);
    const row=el('div',{class:'bubbles',style:'margin-bottom:10px'}, el('span',{class:'bub-lab'},'Properties'));
    propsByRegion().forEach(pr=>{
      const on2=p.split.list.some(a=>a.property===pr.code);
      row.append(el('button',{class:'bub'+(on2?' on':''),style:on2?`background:${pcolor(pr.code)};border-color:${pcolor(pr.code)};color:#fff`:'',
        title:pr.code===p.property?'Lead property (change it in the Property dropdown above)':'',
        onclick:()=>{
          if(on2){ if(pr.code===p.property){toast('The lead property stays in the split — change it in the Property dropdown.');return;}
            p.split.list=p.split.list.filter(a=>a.property!==pr.code); }
          else { p.split.list.push({property:pr.code,pct:0}); }
          drawSplit();
        }}, el('span',{class:'bub-dot',style:'background:'+pcolor(pr.code)}), pr.code));
    });
    splitBody.append(row);
    const total=projOutflow(p);
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('Property'),th('Units','r'),th('Share %','r'),th('$ share','r'))));
    const tb2=el('tbody');
    const shareCells=[];
    p.split.list.forEach(a=>{
      const u=Number((PROP(a.property)||{}).units)||0;
      const shareCell=el('td',{class:'num r'},total?fmt(total*(Number(a.pct)||0)/100):'—');
      shareCells.push({a,cell:shareCell});
      const pctCell=p.split.mode==='custom'
        ? td(el('input',{type:'number',step:'0.01',value:a.pct,style:'width:90px;text-align:right',onchange:e=>{a.pct=Math.round((Number(e.target.value)||0)*100)/100;drawSplit();}}),'r')
        : td(el('span',{class:'mono'},(Number(a.pct)||0)+'%'),'r');
      tb2.append(tr(
        td(el('span',{style:'display:inline-flex;align-items:center;gap:6px'},
          el('span',{style:`width:9px;height:9px;border-radius:2px;background:${pcolor(a.property)};display:inline-block`}),
          el('strong',{},a.property), a.property===p.property?el('span',{class:'chip',style:'margin-left:4px'},'lead'):'')),
        tdn(u||null), pctCell, shareCell));
    });
    t.append(tb2);
    splitBody.append(el('div',{style:'overflow:auto'},t));
    const sum=p.split.list.reduce((a,x)=>a+(Number(x.pct)||0),0);
    if(p.split.mode==='custom'&&Math.abs(sum-100)>0.1)
      splitBody.append(el('div',{style:'margin-top:8px;font-size:12px;color:var(--rust)'},`⚠ Percentages total ${Math.round(sum*100)/100}% — they must equal 100% to save.`));
    if(!total) splitBody.append(el('div',{style:'margin-top:8px;font-size:12px;color:var(--ink-3)'},'Enter an anticipated or actual cost above to see dollar shares.'));
  }
  b.append(splitPanel);
  drawSplit();

  // --- in-house panel: progress + additional notes ---
  const inhousePanel=el('div',{class:'panel ih-panel',style:'margin-top:16px'});
  const unitSeg=el('div',{class:'seg-ctl sm'},
    el('button',{onclick:()=>{p.ihUnit='budget';applyUnit();}},'Budget $'),
    el('button',{onclick:()=>{p.ihUnit='quantity';applyUnit();}},'Quantity #'));
  inhousePanel.append(el('div',{class:'ph'}, el('h3',{},'In-house progress'), el('div',{class:'sp'}), unitSeg, el('span',{class:'ih-meta'},'')));
  const ihBody=el('div',{class:'pad'});
  const ihIntro=el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'');
  ihBody.append(ihIntro);
  const ihBar=el('div',{class:'ih-bigbar'}, el('i',{}));
  const ihStat=el('div',{class:'ih-stat'});
  ihBody.append(ihBar, ihStat);
  // (timestamped notes moved to the "Notes & activity" panel — available on every project)
  inhousePanel.append(ihBody); b.append(inhousePanel);
  function drawIH(){
    const t=ihTotal(p), d=ihDone(p), pc=ihPct(p);
    ihBar.firstChild.style.width=Math.round(pc*100)+'%';
    ihBar.firstChild.className=(t>0&&d>=t)?'full':'';
    ihStat.innerHTML='';
    ihStat.append(el('span',{class:'mono',style:'font-weight:600'},ihFmt(p,d)+' of '+ihFmt(p,t)),
      el('span',{style:'color:var(--ink-3)'},'  ·  '+pct(pc)+' complete'+(t>0?'  ·  '+ihFmt(p,ihRemaining(p))+' remaining':'')));
    inhousePanel.querySelector('.ih-meta').textContent=t>0?pct(pc)+' complete':'no estimate yet';
  }
  function applyUnit(){
    const budget=ihIsBudget(p);
    ihTotalInp.placeholder=budget?'estimated total $':'total count';
    ihDoneInp.placeholder=budget?'$ completed so far':'count completed';
    unitSeg.children[0].className=budget?'on':'';
    unitSeg.children[1].className=budget?'':'on';
    ihIntro.textContent=budget
      ? 'Own-crew work — no contracts, bids, or lien waivers. Track an estimated dollar total and update the amount completed as work progresses.'
      : 'Own-crew work tracked by count (e.g. units done). Set the total to complete and update the quantity completed as work progresses.';
    inhouseCost.querySelector('label').textContent = budget?'Total to complete ($)':'Total to complete (#)';
    inhouseCost.querySelectorAll('label')[1].textContent = budget?'Amount completed ($)':'Quantity completed (#)';
    drawIH();
  }
  ihTotalInp.addEventListener('input',drawIH);
  ihDoneInp.addEventListener('input',drawIH);
  applyUnit();

  // --- bids (collapsible: 3 standard slots, each with a bid document) ---
  const anyBid=p.bids.some(bd=>bd.approved||bd.contractor||bd.amount!=null||bd.file||bd.fileKey);
  const bidsWrap=el('details',{class:'panel acc',style:'margin-top:16px',...(anyBid?{open:''}:{})});
  const bidMeta=el('span',{class:'bs-meta'},'');
  const summary=el('summary',{class:'ph as-summary'}, el('span',{class:'chev'},'▸'), el('h3',{},'Bids'), el('div',{class:'sp'}), bidMeta);
  const bidBody=el('div',{class:'pad'});
  bidBody.append(el('p',{class:'bs-hint'},'Three standard slots — attach each contractor’s bid document, then approve the winner. Use ＋ Add file to attach supporting documents to a bid; the first file holds the scope & contract totals and they embed into the contract in the order shown. Approving fills in the contractor and anticipated cost and advances the workflow to “Bid Approved”.'));
  const slotsWrap=el('div',{});
  bidBody.append(slotsWrap);
  // Keep the legacy single-file fields pointed at the first file (back-compat for hasFile checks + contract).
  function syncBidPrimary(bd){ const f0=bd.files[0]||{}; bd.fileKey=f0.fileKey||null; bd.fileName=f0.fileName||null; bd.fileSize=f0.fileSize||null; }
  // Label by position: first line is the scope/totals doc, the rest are supporting documents.
  function bidFileLabel(bd,idx){ return bd.files.length<=1?'Bid document':(idx===0?'Applicable Scope & Contract Totals':'Supporting document'); }
  async function attachBid(bd,file){
    const slot=p.bids.indexOf(bd);
    const fd=new FormData(); fd.append('file',file);
    toast('Uploading bid…');
    try{
      const r=await fetch(`/api/projects/${p.id}/bids/${slot}/file`,{method:'POST',body:fd});
      if(!r.ok)throw new Error(await r.text());
      const meta=await r.json();
      bd.files.push({fileKey:meta.fileKey,fileName:meta.fileName,fileSize:meta.fileSize,originalFileKey:meta.originalFileKey||null,originalFileName:meta.originalFileName||null}); bd.file=null;
      if(meta.originalFileKey) toast('Converted to PDF for the contract — original kept');
      syncBidPrimary(bd);
      drawBids();
    }catch(e){ toast('Upload failed: '+e.message); }
  }
  function openBidFile(bd){ if(bd.fileKey) window.open('/api/bids/file/'+bd.fileKey,'_blank'); }
  function bidSlot(i){
    const bd=p.bids[i];
    const slot=el('div',{class:'bidslot'+(bd.approved?' win':'')});
    slot.append(el('div',{class:'bs-hd'},
      el('span',{class:'bs-no'},'Bid '+(i+1)),
      bd.approved?el('span',{class:'chip done',style:'margin-left:8px'},'Selected'):null,
      el('div',{style:'flex:1'}),
      el('button',{class:'bs-appr'+(bd.approved?' on':''),onclick:()=>{
        const willApprove=!bd.approved;
        p.bids.forEach((x,j)=>x.approved=(j===i)?willApprove:false);
        if(willApprove){ p.steps.approved=true; p.steps.planned=true; if(bd.contractor)p.contractor=bd.contractor; if(bd.amount!=null)p.anticipatedCost=bd.amount; }
        drawBids(); drawSteps();
      }}, bd.approved?'✓ Approved':'Approve')));
    slot.append(el('div',{class:'bs-row'},
      ctrInpRaw(bd.contractor||'','Contractor / vendor',e=>{bd.contractor=e.target.value;refreshMeta();},'contractor-dl-bid'+i),
      el('input',{type:'number',value:bd.amount==null?'':bd.amount,placeholder:'Bid amount ($)',oninput:e=>{bd.amount=e.target.value===''?null:+e.target.value;refreshMeta();}})));
    const filesWrap=el('div',{});
    if(bd.files.length){
      const multi=bd.files.length>1;
      bd.files.forEach((fl,fi)=>{
        const row=el('div',{class:'bs-file'});
        row.append(el('span',{class:'bs-doc'},'📄'),
          el('div',{style:'display:flex;flex-direction:column;min-width:0;flex:1'},
            multi?el('span',{style:'font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-3);font-weight:600'},bidFileLabel(bd,fi)):null,
            el('div',{style:'display:flex;gap:6px;align-items:center;min-width:0'},
              el('a',{href:'/api/bids/file/'+fl.fileKey,target:'_blank',title:'View in a new tab'},fl.fileName||'bid'),
              el('span',{class:'bs-sz'},fl.fileSize?fileSize(fl.fileSize):''),
              fl.originalFileKey?el('a',{href:dlUrl(fl.originalFileKey,fl.originalFileName),style:'font-size:10.5px;color:var(--ink-3)',title:'Download the original file (“'+(fl.originalFileName||'original')+'”) — the PDF above is the converted copy that embeds into the contract',onclick:e=>e.stopPropagation()},'original'):null)),
          dlBtn(fl.fileKey,fl.fileName),
          el('button',{class:'btn ghost sm',title:'Remove this file — recorded in the change log when you save; the file stays in storage',
            onclick:()=>{if(confirm('Remove “'+(fl.fileName||'this file')+'” from the bid? Recorded in the change log when you save.')){bd.files.splice(fi,1);syncBidPrimary(bd);drawBids();}}},'✕'));
        filesWrap.append(row);
      });
      // + add another file line
      const addRow=el('div',{class:'bs-file',style:'margin-top:2px'});
      const addInp=addDrop(addRow,'.pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx',f=>attachBid(bd,f),{multiple:true});
      addRow.append(el('button',{class:'btn sm ghost',onclick:()=>addInp.click(),title:'Attach one or more files — embedded into the contract in this order'},'＋ Add file'));
      filesWrap.append(addRow);
    } else {
      const fileRow=el('div',{class:'bs-file'});
      fileRow.style.cssText+='border:2px dashed var(--line-2);border-radius:6px;padding:4px 8px;transition:background .15s;';
      const lbl=el('button',{class:'btn sm ghost',onclick:()=>inp.click()},'⇪ Attach bid document');
      const inp=addDrop(fileRow,'.pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx',f=>attachBid(bd,f),{multiple:true});
      fileRow.append(lbl);
      filesWrap.append(fileRow);
    }
    slot.append(filesWrap);
    return slot;
  }
  function refreshMeta(){ const filled=p.bids.filter(bd=>bd.contractor||bd.amount!=null||bd.file||bd.fileKey).length; bidMeta.textContent=`${filled}/3 filled${p.bids.some(b=>b.approved)?' · winner selected':''}`; }

  // --- Generate contract (collapsed dropdown; the header chip carries the
  //     readiness status, the expanded body is just the Generate button) ---
  const genPanel=el('details',{class:'panel acc',style:'margin-top:16px'});
  const genStatusChip=el('span',{class:'chip'},'');
  genPanel.append(el('summary',{class:'ph as-summary'}, el('span',{class:'chev'},'▸'), el('h3',{},'Generate contract'), el('div',{class:'sp'}), genStatusChip));
  const genBody=el('div',{class:'pad'});
  genPanel.append(genBody);
  function genChecks(){
    const prop=PROP(p.property)||{};
    const approved=p.bids.find(b2=>b2.approved);
    const bidFile=p.bids.some(bd=>(bd.files&&bd.files.length)||bd.fileKey);
    const total=p.actualCost!=null?p.actualCost:((approved&&approved.amount!=null)?approved.amount:p.anticipatedCost);
    const contractor=((approved&&approved.contractor)||p.contractor||'').trim();
    return [
      {ok:bidFile, label:'Bid document attached', hint:'attach the winning bid in Bids above — it embeds as the contract scope (Word/Excel converts to PDF automatically)', required:true},
      {ok:total!=null&&Number(total)>0, label:'Contract total', hint:'enter a cost or bid amount', required:true},
      {ok:!!contractor, label:'Contractor named', hint:'approve a bid or fill the contractor field', required:true},
      {ok:!!p.bids.some(b2=>b2.approved), label:'Winning bid approved', hint:'approve the winner so its amount & contractor flow in', required:false},
      {ok:!!(prop.ownerEntity||'').trim(), label:'Owner entity on file', hint:'fill it in the generate dialog once — remembered per property', required:false},
    ];
  }
  function refreshGenPanel(){
    if(p.inHouse||p.noContract){ genPanel.style.display='none'; return; }
    genPanel.style.display='';
    genBody.innerHTML='';
    const checks=genChecks();
    const missingReq=checks.filter(c=>c.required&&!c.ok);
    const ready=!missingReq.length;
    genStatusChip.className='chip '+(p.contractFileKey?'done':(ready?'good':'hold'));
    genStatusChip.textContent=p.contractFileKey?'generated ✓':(ready?'ready to generate':`${missingReq.length} item${missingReq.length>1?'s':''} needed`);
    const row=el('div',{style:'display:flex;gap:10px;align-items:center;flex-wrap:wrap'});
    const btn=el('button',{class:'btn accent',onclick:()=>openContractDialog()},'📄 Generate contract');
    if(isNew){ btn.disabled=true; btn.style.opacity='.5'; row.append(btn, el('span',{class:'bs-meta'},'Save the project first, then generate.')); }
    else if(!ready){ btn.disabled=true; btn.style.opacity='.5'; row.append(btn, el('span',{class:'bs-meta'},'Needs: '+missingReq.map(c=>c.label.toLowerCase()).join(', ')+'.')); }
    else row.append(btn);
    genBody.append(row);
  }

  // --- Contract (own section): generated → contractor signed → executed → lien waiver ---
  const hasCt=!!(p.contractFileKey||p.contractorSignedFileKey||p.executedContractFileKey||p.lienWaiverFileKey);
  const contractWrap=el('details',{class:'panel acc',style:'margin-top:16px',...(hasCt?{open:''}:{})});
  const ctMeta=el('span',{class:'bs-meta'},'');
  contractWrap.append(el('summary',{class:'ph as-summary'}, el('span',{class:'chev'},'▸'), el('h3',{},'Contract'), el('div',{class:'sp'}), ctMeta));
  const ctBody=el('div',{class:'pad'});
  contractWrap.append(ctBody);
  const ctRow=label=>{ const r=el('div',{class:'ct-row'}); r.append(el('span',{class:'ct-lab'},label)); return r; };
  // View (new tab) + download pair — downloads keep the original filename.
  const fileLink=(key,name)=>el('span',{style:'display:inline-flex;gap:6px;align-items:center;min-width:0'},
    el('button',{class:'btn ghost sm',title:'View in a new tab',onclick:()=>window.open('/api/bids/file/'+key,'_blank')},'👁'),
    dlBtn(key,name,'⬇ '+(name||'file.pdf')));
  // Remove a contract-section attachment: the file stays in storage and the
  // removal is recorded in the change log with user + time.
  async function removeAttachment(kind,label){
    if(!confirm(`Remove the ${label} from this project?\n\nThe file stays in storage and the removal is recorded in the change log.`))return;
    try{
      const out=await API.send('POST','/projects/'+p.id+'/remove-attachment',{kind});
      if(kind==='executed'&&p.lienWaiverFileKey===p.executedContractFileKey){p.lienWaiverFileKey=null;p.lienWaiverFileName=null;}
      if(kind==='contract'){p.contractFileKey=null;p.contractFileName=null;}
      if(kind==='contractorSigned'){p.contractorSignedFileKey=null;p.contractorSignedFileName=null;}
      if(kind==='executed'){p.executedContractFileKey=null;p.executedContractFileName=null;}
      if(kind==='lienWaiver'){p.lienWaiverFileKey=null;p.lienWaiverFileName=null;}
      Object.assign(p.steps,out.steps||{});
      syncDerivedSteps(p); drawSteps(); refreshGen(); toast(label.charAt(0).toUpperCase()+label.slice(1)+' removed — logged');
    }catch(e){ toast('Remove failed: '+e.message); }
  }
  const rmBtn=(kind,label)=>el('button',{class:'btn ghost sm',title:'Remove — recorded in the change log; the file stays in storage',onclick:()=>removeAttachment(kind,label)},'✕');
  function refreshGen(){
    refreshGenPanel();
    ctBody.innerHTML='';
    ctMeta.textContent=[p.contractFileKey?'generated':null,
      p.contractorSignedFileKey&&!p.executedContractFileKey?'awaiting countersign':null,
      p.contractorSignedFileKey&&p.executedContractFileKey?'contractor signed':null,
      p.executedContractFileKey?'executed':null,p.lienWaiverFileKey?'lien waiver':null].filter(Boolean).join(' · ')||'none yet';

    // 1) Generated (unexecuted) contract — download lives here; generation moved
    //    to the dedicated "Generate contract" section above.
    const gRow=ctRow('Generated contract');
    const extInp=addDrop(gRow,'.pdf,application/pdf',async file=>{
      toast('Uploading contract…');
      const fd=new FormData(); fd.append('file',file);
      try{
        const r=await fetch('/api/projects/'+p.id+'/contract-file',{method:'POST',body:fd});
        if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'upload failed');}
        const out=await r.json();
        p.contractFileKey=out.fileKey; p.contractFileName=out.fileName;
        Object.assign(p.steps,out.steps);
        drawSteps(); refreshGen(); toast('Contract attached');
      }catch(e){ toast('Upload failed: '+e.message); }
    });
    if(p.contractFileKey) gRow.append(el('span',{class:'ct-ok'},'✓ Generated'), fileLink(p.contractFileKey,p.contractFileName||'contract.pdf'), rmBtn('contract','generated contract'));
    gRow.append(el('button',{class:'btn ghost sm',title:'Attach a contract generated outside the tracker',onclick:()=>extInp.click()},'⬆ Upload existing'));
    if(!p.contractFileKey) gRow.append(el('span',{class:'bs-meta'},'Use “Generate contract” above — or drop in an existing PDF.'));
    ctBody.append(gRow);

    // 2) Contractor-signed (one-party) contract — the project shows on the
    //    dashboard as "Awaiting signature" until the executed contract arrives.
    const csRow=ctRow('Contractor signed');
    if(p.contractorSignedFileKey){
      csRow.append(el('span',{class:'ct-ok'},'✓ Attached'), fileLink(p.contractorSignedFileKey,p.contractorSignedFileName||'contractor-signed.pdf'), rmBtn('contractorSigned','contractor-signed contract'));
      if(!p.executedContractFileKey) csRow.append(el('span',{class:'chip hold'},'awaiting countersign'));
    } else {
      csRow.classList.add('ct-drop');
      const csBtn=el('button',{class:'btn ghost sm',onclick:()=>csInput.click()},'⬆ Upload contractor-signed');
      csRow.append(csBtn, el('span',{class:'bs-meta'},'One-party signed — shows as “Awaiting signature” on the dashboard until countersigned.'));
      const csInput=addDrop(csRow,'.pdf,application/pdf',async file=>{
        csBtn.disabled=true; csBtn.textContent='Uploading…';
        const fd=new FormData(); fd.append('file',file);
        try{
          const r=await fetch('/api/projects/'+p.id+'/contractor-signed',{method:'POST',body:fd});
          if(!r.ok){const e=await r.json().catch(()=>({}));toast(e.error||'Upload failed');csBtn.disabled=false;csBtn.textContent='⬆ Upload contractor-signed';return;}
          const out=await r.json();
          p.contractorSignedFileKey=out.fileKey; p.contractorSignedFileName=out.fileName;
          Object.assign(p.steps,out.steps);
          drawSteps(); refreshGen(); toast('Contractor-signed contract attached — awaiting countersignature');
        }catch(e){toast('Upload failed: '+e.message);csBtn.disabled=false;csBtn.textContent='⬆ Upload contractor-signed';}
      });
    }
    ctBody.append(csRow);

    // 3) Executed (finalized) contract — attaching it auto-ticks "Signed & Countersigned".
    const eRow=ctRow('Executed contract');
    if(p.executedContractFileKey){
      eRow.append(el('span',{class:'ct-ok'},'✓ Attached'), fileLink(p.executedContractFileKey,p.executedContractFileName||'executed.pdf'), rmBtn('executed','executed contract'));
    } else {
      eRow.classList.add('ct-drop');
      const execBtn=el('button',{class:'btn ghost sm',onclick:()=>execInput.click()},'⬆ Upload executed');
      eRow.append(execBtn, el('span',{class:'bs-meta'},'Auto-ticks “Signed & Countersigned”.'));
      const execInput=addDrop(eRow,'.pdf,application/pdf',async file=>{
        execBtn.disabled=true; execBtn.textContent='Uploading…';
        // LW dialog before upload
        const lwScrim=el('div',{class:'scrim modal-center',style:'z-index:2000'});
        const lwSheet=el('div',{class:'sheet',style:'max-width:380px'});
        lwSheet.append(el('div',{class:'sh'},el('h2',{style:'font-size:15px;flex:1'},'Lien Waiver Signed with Contract?')));
        const lwBody=el('div',{class:'sb'});
        lwBody.append(el('p',{style:'margin:0 0 8px;color:var(--ink-2);font-size:13px'},'Was the lien waiver signed and returned together with the executed contract?'));
        lwBody.append(el('div',{style:'margin:0 0 14px'},el('button',{class:'btn ghost sm',onclick:()=>openPdfViewer(file,file.name)},'👁 Preview file')));
        const doUpload=async(lwSigned)=>{
          lwScrim.remove();
          const fd=new FormData(); fd.append('file',file); fd.append('lwSigned',String(lwSigned));
          try{
            const r=await fetch('/api/projects/'+p.id+'/executed-contract',{method:'POST',body:fd});
            if(!r.ok){const e=await r.json().catch(()=>({}));toast(e.error||'Upload failed');execBtn.disabled=false;execBtn.textContent='⬆ Upload executed';return;}
            const out=await r.json();
            p.executedContractFileKey=out.fileKey; p.executedContractFileName=out.fileName;
            // "Yes, LW signed with contract" → the same document fills the LW slot.
            if(out.lienWaiverFileKey){ p.lienWaiverFileKey=out.lienWaiverFileKey; p.lienWaiverFileName=out.lienWaiverFileName; }
            Object.assign(p.steps,out.steps);
            drawSteps(); refreshGen();
            toast('Executed contract attached'+(lwSigned?' · Lien waiver received (signed with contract)':''));
          }catch(e){toast('Upload failed: '+e.message);execBtn.disabled=false;execBtn.textContent='⬆ Upload executed';}
        };
        lwBody.append(el('div',{style:'display:flex;gap:8px;justify-content:flex-end'},
          el('button',{class:'btn ghost',onclick:()=>{lwScrim.remove();execBtn.disabled=false;execBtn.textContent='⬆ Upload executed';}},'Cancel'),
          el('button',{class:'btn',onclick:()=>doUpload(false)},'No'),
          el('button',{class:'btn accent',onclick:()=>doUpload(true)},'Yes')));
        lwSheet.append(lwBody); lwScrim.append(lwSheet); document.body.append(lwScrim);
      });
    }
    ctBody.append(eRow);

    // 3) Lien waiver — applicable once a contract is in play; auto-ticks "Lien Waiver Received".
    if(!p.noContract && (p.executedContractFileKey||p.lienWaiverFileKey)){
      const lRow=ctRow('Lien waiver');
      if(p.lienWaiverFileKey){
        const withContract=p.lienWaiverFileKey===p.executedContractFileKey;
        lRow.append(el('span',{class:'ct-ok lien'},withContract?'✓ Received — signed with contract':'✓ Received'));
        if(!withContract) lRow.append(fileLink(p.lienWaiverFileKey,p.lienWaiverFileName||'lien-waiver.pdf'));
        lRow.append(rmBtn('lienWaiver','lien waiver'));
      } else {
        lRow.classList.add('ct-drop');
        const lwBtn=el('button',{class:'btn ghost sm',onclick:()=>lwInput.click()},'⬆ Upload lien waiver');
        lRow.append(lwBtn, el('span',{class:'bs-meta'},'Auto-ticks “Lien Waiver Received”.'));
        const lwInput=addDrop(lRow,'.pdf,application/pdf',async file=>{
          lwBtn.disabled=true; lwBtn.textContent='Uploading…';
          const fd=new FormData(); fd.append('file',file);
          try{
            const r=await fetch('/api/projects/'+p.id+'/lien-waiver',{method:'POST',body:fd});
            if(!r.ok){const e=await r.json().catch(()=>({}));toast(e.error||'Upload failed');lwBtn.disabled=false;lwBtn.textContent='⬆ Upload lien waiver';return;}
            const out=await r.json();
            p.lienWaiverFileKey=out.fileKey; p.lienWaiverFileName=out.fileName;
            p.steps.lienWaiver=true;
            drawSteps(); refreshGen(); toast('Lien waiver attached');
          }catch(e){toast('Upload failed: '+e.message);lwBtn.disabled=false;lwBtn.textContent='⬆ Upload lien waiver';}
        });
      }
      ctBody.append(lRow);
    }
  }

  function openContractDialog(){
    const prop=PROP(p.property)||{};
    const approved=p.bids.find(b=>b.approved&&b.fileKey)||p.bids.find(b=>b.fileKey)||{};
    const total=p.actualCost!=null?p.actualCost:(approved.amount!=null?approved.amount:(p.anticipatedCost!=null?p.anticipatedCost:0));
    const usd=n=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    const isoToMdy=iso=>{const m=String(iso||'').split('-');return m.length===3?`${m[1]}/${m[2]}/${m[0]}`:'';};
    const mdyToIso=mdy=>{const m=String(mdy||'').split('/');return m.length===3?`${m[2]}-${m[0].padStart(2,'0')}-${m[1].padStart(2,'0')}`:'';};
    const plusDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;};
    const plusDaysIso=n=>{const d=new Date();d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
    const ctrByName=nm=>(S.contractors||[]).find(c=>c.name.trim().toLowerCase()===String(nm||'').trim().toLowerCase());
    const initCtrName=(approved.contractor||p.contractor||'');
    const initCtr=ctrByName(initCtrName);
    const data={
      effectiveDate:isoToMdy(today()), termEndDate:plusDays(60),
      ownerEntity:prop.ownerEntity||'', contractorName:initCtrName,
      propertyName:prop.name||'', propertyAddr:prop.address||'',
      ownerNoticeAddr:prop.ownerNoticeAddr||prop.address||'', contractorAddr:(initCtr&&initCtr.address)||'',
      contractTotal:usd(total), unit:'', scope:p.name||''
    };
    const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
    const sheet=el('div',{class:'sheet'});
    const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Generate contract'),
      el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'));
    const bb=el('div',{class:'sb'});
    bb.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'Pre-filled from the property and approved bid. Owner entity and addresses are saved to the property for next time.'));
    const f=(label,key,opts={})=>el('div',{class:'field'},el('label',{},label),el('input',{value:data[key]||'',placeholder:opts.ph||'',oninput:e=>data[key]=e.target.value}));
    const sect=t=>bb.append(el('div',{style:'font-family:var(--disp);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);margin:18px 0 8px;border-bottom:1px solid var(--line-2);padding-bottom:5px'},t));
    // --- Property ---
    sect('Property');
    bb.append(f('Property name','propertyName'));
    bb.append(f('Owner entity (legal)','ownerEntity',{ph:'e.g. MIMG CCXXXI South Pointe Sub, LLC'}));
    bb.append(f('Property address','propertyAddr',{ph:'street, city, ST ZIP'}));
    bb.append(f('Owner notice address','ownerNoticeAddr',{ph:'usually same as property'}));
    // --- Contract ---
    sect('Contract');
    const dateFld=(label,key,initIso)=>{const inp=el('input',{type:'date',value:initIso,onchange:e=>data[key]=isoToMdy(e.target.value),oninput:e=>data[key]=isoToMdy(e.target.value)});return el('div',{class:'field'},el('label',{},label),inp);};
    bb.append(el('div',{class:'frow'}, dateFld('Start date','effectiveDate',today()), dateFld('End date','termEndDate',plusDaysIso(60))));
    bb.append(el('div',{class:'frow'}, f('Contract total','contractTotal'), f('Unit # (optional)','unit',{ph:'e.g. 201'})));
    bb.append(f('Scope of work','scope',{ph:'e.g. HVAC replacement — Unit 316'}));
    // --- Contractor ---
    sect('Contractor');
    const ctrDl=el('datalist',{id:'contract-gen-dl'});(S.contractors||[]).forEach(c=>ctrDl.append(el('option',{value:c.name})));document.body.append(ctrDl);
    scrim.addEventListener('remove',()=>ctrDl.remove(),{once:true});
    const genCtrKnown=(val)=>(S.contractors||[]).some(c=>c.name.trim().toLowerCase()===val.trim().toLowerCase());
    const genCtrWarn=async(val)=>{
      ctrNameField.querySelectorAll('.ctr-warn').forEach(w=>w.remove());
      if(!val||!val.trim()||genCtrKnown(val))return;
      const warn=el('div',{class:'ctr-warn',style:'font-size:11px;color:var(--rust);margin-top:3px;display:flex;gap:6px;align-items:center'},
        el('span',{},'⚠ Not in contractor directory'),
        el('button',{class:'btn ghost sm',style:'font-size:10px;padding:1px 6px',onclick:async e=>{
          e.preventDefault();
          const r=await fetch('/api/contractors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:val.trim()})});
          if(r.ok){const j=await r.json();S.contractors=[...(S.contractors||[]),j];warn.remove();toast('Added "'+val.trim()+'" to contractor directory');}
          else toast('Failed to add contractor');
        }},'Add to directory'));
      ctrNameField.append(warn);
    };
    const ctrAddrInp=el('input',{value:data.contractorAddr||'',oninput:e=>data.contractorAddr=e.target.value});
    const ctrNameInp=el('input',{value:data.contractorName||'',list:'contract-gen-dl',oninput:e=>{
      data.contractorName=e.target.value;
      const match=ctrByName(e.target.value);
      if(match&&match.address){ data.contractorAddr=match.address; ctrAddrInp.value=match.address; }   // pull the saved address
    }});
    ctrNameInp.addEventListener('blur',()=>genCtrWarn(data.contractorName));
    const ctrNameField=el('div',{class:'field'},el('label',{},'Contractor name'),ctrNameInp);
    bb.append(ctrNameField);
    bb.append(el('div',{class:'field'},el('label',{},'Contractor address'),ctrAddrInp));
    const err=el('div',{style:'color:var(--rust);font-size:12px;min-height:16px'});
    const genBtn=el('button',{class:'btn accent',onclick:async()=>{
      if(!data.ownerEntity||!data.contractorName||!data.contractTotal){ err.textContent='Owner entity, contractor name and contract total are required.'; return; }
      genBtn.disabled=true; genBtn.textContent='Generating…'; err.textContent='';
      try{
        await saveProjectSilent(p);
        const r=await fetch('/api/projects/'+p.id+'/contract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        if(!r.ok){ const e=await r.json().catch(()=>({})); err.textContent=e.error||'Generation failed.'; genBtn.disabled=false; genBtn.textContent='Generate contract'; return; }
        const out=await r.json();
        const a=el('a',{href:out.downloadUrl}); document.body.append(a); a.click(); a.remove();
        scrim.remove(); close(); await afterWrite('Contract generated · '+out.contractFileName);
      }catch(e){ err.textContent='Failed: '+e.message; genBtn.disabled=false; genBtn.textContent='Generate contract'; }
    }},'Generate contract');
    bb.append(err, el('div',{style:'display:flex;gap:8px;margin-top:6px'}, el('div',{style:'flex:1'}), genBtn));
    sheet.append(head,bb); scrim.append(sheet); document.body.append(scrim);
  }

  function drawBids(){ slotsWrap.innerHTML=''; for(let i=0;i<3;i++) slotsWrap.append(bidSlot(i)); refreshMeta(); refreshGen(); }
  drawBids(); bidsWrap.append(summary,bidBody); b.append(bidsWrap, genPanel, contractWrap);

  // --- lifecycle steps ---
  const stepsPanel=el('div',{class:'panel',style:'margin-top:16px'});
  stepsPanel.append(el('div',{class:'ph'}, el('h3',{},'Lifecycle'), el('div',{class:'sp'}),
    el('button',{class:'btn sm',onclick:()=>{
      // Advance to the next hand-toggled step (auto steps mirror attachments).
      const keys=appKeys(p).filter(k=>!AUTO_STEPS.includes(k));
      let cur=-1; keys.forEach((k,idx)=>{if(p.steps[k])cur=idx;});
      const next=keys[cur+1];
      if(next){ p.steps[next]=true; const gi=STEP_KEYS.indexOf(next);
        if(gi>APPROVED_IDX){ STEP_KEYS.slice(0,gi).forEach(k=>{ if(!isNA(p,k)&&!AUTO_STEPS.includes(k))p.steps[k]=true; }); }
        drawSteps(); }
    }},'Advance ▸')));
  const stepBody=el('div',{class:'pad'}); const stepsList=el('div',{class:'steps'});
  function drawSteps(){
    syncDerivedSteps(p);
    stepsList.innerHTML='';
    LIFECYCLE.forEach((s,i)=>{
      const na=isNA(p,s.key);
      const auto=AUTO_STEPS.includes(s.key);
      const on=!na && !!p.steps[s.key];
      const row=el('div',{class:'step'+(on?' on':'')+(na?' na':'')+(s.key==='lienWaiver'?' lien':'')});
      row.append(el('div',{class:'num'}, na?'–':(on?'✓':String(i+1))),
        el('div',{style:'flex:1'}, el('div',{class:'nm'},s.label), el('div',{class:'ds'}, na?'Not applicable — no contract needed.':s.desc)));
      if(na){
        row.append(el('div',{class:'toggle'}, el('span',{class:'na-badge'},'N/A')));
      } else if(auto){
        // Derived from the attachment — no manual switch.
        row.append(el('div',{class:'toggle'}, el('span',{class:'na-badge',title:'Ticks automatically when the file is attached in the Contract section'},on?'✓ auto':'auto')));
      } else {
        const sw=el('button',{class:'switch'+(on?' on':''),title:'toggle',onclick:()=>{
          const nv=!p.steps[s.key];
          p.steps[s.key]=nv;
          if(i<=APPROVED_IDX){
            if(!nv && i===APPROVED_IDX){ STEP_KEYS.slice(i+1).forEach(k=>{ if(!AUTO_STEPS.includes(k))p.steps[k]=false; }); }
          } else {
            if(nv){ STEP_KEYS.slice(0,i).forEach(k=>{ if(!isNA(p,k)&&!AUTO_STEPS.includes(k))p.steps[k]=true; }); }
            else  { STEP_KEYS.slice(i+1).forEach(k=>{ if(!AUTO_STEPS.includes(k))p.steps[k]=false; }); }
          }
          drawSteps();
        }});
        row.append(el('div',{class:'toggle'},sw));
      }
      stepsList.append(row);
    });
    if(typeof refreshCommit==='function') refreshCommit();
  }
  drawSteps(); stepBody.append(stepsList); stepsPanel.append(stepBody); b.append(stepsPanel);

  // show contractor panels or in-house panel depending on mode
  function applyMode(){
    const ih=!!p.inHouse;
    contractorCost.style.display=ih?'none':'';
    inhouseCost.style.display=ih?'':'none';
    inhousePanel.style.display=ih?'':'none';
    bidsWrap.style.display=ih?'none':'';
    contractWrap.style.display=ih?'none':'';
    stepsPanel.style.display=ih?'none':'';
    sheet.classList.toggle('ih-mode',ih);
    if(typeof refreshGenPanel==='function')refreshGenPanel();
    if(ih)genPanel.style.display='none';
  }
  applyMode();

  // notes
  const np=el('div',{class:'panel pad',style:'margin-top:16px'});
  np.append(el('div',{class:'field'}, el('label',{},'Notes'), el('textarea',{oninput:e=>p.notes=e.target.value},p.notes||'')));
  b.append(np);

  // --- Notes & activity: timestamped + attributed notes with attachments (all projects) ---
  const actPanel=el('div',{class:'panel',style:'margin-top:16px'});
  const actChip=el('span',{class:'chip'},'');
  actPanel.append(el('div',{class:'ph'}, el('h3',{},'Notes & activity'), el('div',{class:'sp'}), actChip));
  const actBody=el('div',{class:'pad'});
  const pendingFiles=[];   // attachments staged for the next posted note
  const noteInp=el('textarea',{placeholder:'Post a note — decisions, calls, site updates… (saved with the project)',style:'min-height:52px;width:100%'});
  const stagedWrap=el('div',{style:'display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 0'});
  function drawStaged(){
    stagedWrap.innerHTML='';
    pendingFiles.forEach((fl,i)=>stagedWrap.append(el('span',{class:'chip'},'📎 '+(fl.fileName||'file'),
      el('button',{class:'btn ghost sm',style:'padding:0 4px;margin-left:4px',title:'Remove attachment',onclick:()=>{pendingFiles.splice(i,1);drawStaged();}},'✕'))));
  }
  async function attachNoteFile(file){
    const fd=new FormData(); fd.append('file',file);
    toast('Uploading…');
    try{
      const r=await fetch('/api/projects/'+p.id+'/note-file',{method:'POST',body:fd});
      if(!r.ok)throw new Error(await r.text());
      pendingFiles.push(await r.json()); drawStaged();
    }catch(e){ toast('Upload failed: '+e.message); }
  }
  const attachRow=el('div',{style:'display:flex;gap:8px;align-items:center;margin-top:8px'});
  const attInp=addDrop(attachRow,'.pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx,.zip,.msg,.eml',f=>attachNoteFile(f),{multiple:true});
  function postNote(){
    const txt=noteInp.value.trim();
    if(!txt&&!pendingFiles.length){ toast('Write a note or attach a file first.'); return; }
    p.progressNotes.push({id:uid('n'),date:today(),ts:new Date().toISOString(),username:USER,note:txt,files:pendingFiles.splice(0)});
    noteInp.value=''; drawStaged(); drawNotes();
  }
  attachRow.append(
    el('button',{class:'btn ghost sm',title:'Attach files to the note (or drop them anywhere on this row)',onclick:()=>attInp.click()},'📎 Attach'),
    el('div',{style:'flex:1'}),
    el('button',{class:'btn accent sm',onclick:postNote},'Post note'));
  const noteList=el('div',{class:'pn-list',style:'margin-top:12px'});
  const fmtNoteWhen=n=>{
    if(n.ts){ const d=new Date(n.ts); if(!isNaN(d)) return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }
    return fmtDate(n.date);
  };
  function drawNotes(){
    actChip.textContent=p.progressNotes.length?String(p.progressNotes.length):'none yet';
    noteList.innerHTML='';
    p.progressNotes.slice().reverse().forEach(n=>{
      const body2=el('div',{style:'flex:1;min-width:0'});
      body2.append(el('div',{style:'font-size:11px;color:var(--ink-3)'},
        el('span',{class:'mono'},fmtNoteWhen(n)),
        n.username?el('span',{style:'font-weight:600;color:var(--ink-2)'},'  ·  '+n.username):''));
      if(n.note) body2.append(el('div',{style:'margin-top:2px;white-space:pre-wrap'},n.note));
      if(Array.isArray(n.files)&&n.files.length){
        const fw=el('div',{style:'display:flex;gap:10px;flex-wrap:wrap;margin-top:4px'});
        n.files.forEach(fl=>fw.append(el('span',{style:'display:inline-flex;align-items:center;gap:3px'},
          el('a',{href:'/api/files/'+fl.fileKey+'?name='+encodeURIComponent(fl.fileName||'attachment'),style:'font-size:12px;color:var(--blue)'},'📎 '+(fl.fileName||'attachment')),
          el('button',{class:'btn ghost sm',style:'padding:0 4px;font-size:10px',title:'Remove this attachment — logged on save; the file stays in storage',
            onclick:()=>{if(confirm('Remove attachment “'+(fl.fileName||'file')+'” from this note? Recorded in the change log when you save.')){n.files=n.files.filter(x=>x!==fl);drawNotes();}}},'✕'))));
        body2.append(fw);
      }
      noteList.append(el('div',{class:'pn-item',style:'align-items:flex-start'}, body2,
        el('button',{class:'btn ghost sm',title:'Remove note',onclick:()=>{if(confirm('Remove this note?')){p.progressNotes=p.progressNotes.filter(x=>x.id!==n.id);drawNotes();}}},'✕')));
    });
    if(!p.progressNotes.length) noteList.append(el('div',{style:'font-size:12px;color:var(--ink-3)'},'No notes yet. Notes are stamped with your name and the time, and save with the project.'));
  }
  actBody.append(noteInp, stagedWrap, attachRow, noteList);
  actPanel.append(actBody); b.append(actPanel);
  drawNotes();

  if(!isNew){
    b.append(el('div',{style:'margin-top:18px;display:flex'}, el('div',{style:'flex:1'}),
      el('button',{class:'btn danger',onclick:()=>{if(confirm('Delete this project?'))del();}},'Delete project')));
    // linked GL
    const gls=S.gl.filter(g=>g.linkedProjectId===p.id);
    if(gls.length){
      const gp=el('div',{class:'panel',style:'margin-top:16px;overflow:auto'});
      gp.append(el('div',{class:'ph'}, el('h3',{},'Linked ledger entries')));
      const t=el('table',{class:'tbl'});t.append(el('thead',{},tr(th('Date'),th('Vendor'),th('Amount','r'))));
      const tbb=el('tbody');gls.forEach(g=>tbb.append(tr(td(g.date),td(g.vendor),tdn(g.amount,1))));
      t.append(tbb);gp.append(t);b.append(gp);
    }
  }

  // Two-column layout: everything on the left, the lifecycle track on the right
  // (keeps notes visible without scrolling past the tall step list).
  const edGrid=el('div',{class:'editor-grid'});
  const edMain=el('div',{class:'ed-main'});
  const edSide=el('div',{class:'ed-side'});
  Array.from(b.childNodes).forEach(n=>{ if(n===stepsPanel) edSide.append(n); else edMain.append(n); });
  edGrid.append(edMain, edSide);
  b.append(edGrid);
  applyMode();

  sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
}

/* Plain-English status for a project (used in the property update email). */
function projStatusLabel(p){
  if(p.onHold) return 'On hold';
  if(isComplete(p)) return 'Completed';
  if(isInHouse(p)) return 'In-house — '+pct(ihPct(p))+' complete';
  const ph=phase(p);
  if(ph==='note') return 'Planned — no cost yet';
  if(ph==='discussed') return 'Discussed / awaiting approval';
  if(ph==='paid') return 'Paid — awaiting closeout';
  const s=stage(p); return (s>=0 && LIFECYCLE[s]) ? LIFECYCLE[s].label : 'In progress';
}
/* Forward-looking status for the email tables: what the project is waiting on
   now (vs. projStatusLabel, which names the furthest completed stage). */
function projNextStatus(p){
  if(p.onHold) return 'On hold';
  if(isInHouse(p)) return 'In-house — '+pct(ihPct(p))+' complete';
  if(isComplete(p)) return 'Completed';
  const s=p.steps||{};
  if(s.paid) return 'Paid — awaiting closeout';
  if(s.workCompleted) return 'Work done — awaiting payment';
  if(s.workStarted) return 'Work in progress';
  if(s.signed) return 'Awaiting work start';
  if(s.contractGenerated) return 'Awaiting countersignature';
  if(s.approved) return 'Awaiting contract';
  const bidCt=(p.bids||[]).filter(b=>b.fileKey||(b.files&&b.files.length)).length;
  return `Awaiting approval · ${bidCt}/3 bids`;
}
/* Greeting name for the update email: saved override wins, else derived from
   the first To address (local part before the dot: kianna.parisien@… →
   "Kianna"), else the manager's first name. */
function greetingNameFor(p){
  if(p.updateGreeting&&p.updateGreeting.trim()) return p.updateGreeting.trim();
  const firstAddr=String(p.updateTo||'').split(/[;,]/)[0].trim();
  if(firstAddr.includes('@')){
    const seg=firstAddr.split('@')[0].split('.')[0].replace(/[^a-z'\-]/gi,'');
    if(seg) return seg.charAt(0).toUpperCase()+seg.slice(1).toLowerCase();
  }
  return (p.manager||'').trim().split(/\s+/)[0]||'';
}
/* Build the "is this up to date?" email for a property: SP budget/cash summary +
   where each active project sits. Returns {subject, html} for the dialog and
   the dashboard bulk download. */
function buildUpdateEmail(code){
  const p=PROP(code)||{}; const cm=cashModel(code);
  const budget=Number(p.spBudget)||0, spent=glSpentFor(code), remaining=budget-spent;
  const asOf=(S.cash[code]&&S.cash[code].asOfDate)||S.meta.cashAsOf||'';
  // Split the tracked pipeline into what's counted in the cash projections
  // (outstanding commitments) and everything else still open (discussed,
  // on hold, paid-awaiting-closeout). Completed work and bare notes stay out.
  const byStage=(a,b)=>(stage(b)-stage(a))||(projOutflow(b)-projOutflow(a));
  const included=cm.outstanding.slice().sort(byStage);
  const inclSet=new Set(included);
  // Discussed/notes are opt-in per property (off by default); Above-the-Line never appears.
  const inclDisc=!!p.updateIncludeDiscussed;
  const excluded=projForProp(code)
    .filter(x=>!inclSet.has(x)&&!isComplete(x)&&!isATL(x)&&(inclDisc||(phase(x)!=='discussed'&&phase(x)!=='note')))
    .sort(byStage);
  const firstName=greetingNameFor(p);
  const nowD=new Date();
  const subject=`SP Update Check - ${code} ${String(nowD.getDate()).padStart(2,'0')}/${String(nowD.getMonth()+1).padStart(2,'0')}/${nowD.getFullYear()}`;

  // HTML body with real tables. Inline styles + hard-coded colors only — this
  // gets pasted into Outlook, where CSS variables and stylesheets don't exist.
  const NEG='#b4452f';
  const tdL='padding:6px 12px;border:1px solid #d6dade;font-size:13px;font-family:Calibri,Arial,sans-serif;';
  const tdR=tdL+'text-align:right;white-space:nowrap;';
  const moneyCell=(n,extra='')=>`<td style="${tdR}${Number(n)<0?'color:'+NEG+';':''}${extra}">${esc(fmt(n))}</td>`;
  const hdTxt='font-family:Calibri,Arial,sans-serif;font-size:13px;font-weight:bold;margin:16px 0 6px;';
  // Each status subsection gets its own tint: [group-header bg, member-row bg].
  // Cool tones for committed work; warm tones for the not-in-projections table.
  const COOL_TINTS=[['#dcebe2','#f2f9f5'],['#dde9f4','#f3f8fc'],['#e8e1f5','#f6f3fb'],['#dcebeb','#f1f8f8'],['#e4e7ec','#f4f6f8']];
  const WARM_TINTS=[['#f7ecca','#fcf7e9'],['#f6e0cd','#fbf2ea'],['#f4d9d4','#fbf0ee'],['#f2e3d3','#faf3ea'],['#efe0e0','#f9f2f2']];
  // Lien-waiver state: filed > received > pending; N/A for in-house / no-contract.
  const lienCell=x=>{ if(isInHouse(x)||x.noContract) return '—';
    const s=x.steps||{}; return s.lienWaiver?'Received':'Pending'; };
  const projTable=(list,tints,full)=>{
    const order=[]; const by=new Map();
    list.forEach(x=>{ const lab=projStatusLabel(x); if(!by.has(lab)){by.set(lab,[]);order.push(lab);} by.get(lab).push(x); });
    const th=(txt,st='text-align:left')=>`<th style="${tdL}background:#e9ecf0;${st}">${txt}</th>`;
    let t=`<table style="border-collapse:collapse">`
      +`<tr>${th('Project')}${th('Amount','text-align:right')}`
      +(full?`${th('Planned start','text-align:center')}${th('Complete by','text-align:center')}`:'')
      +th('Status')
      +(full?th('Lien waiver','text-align:center'):'')
      +`</tr>`;
    const nCols=full?6:3;
    order.forEach((lab,gi)=>{
      const [gbg,rbg]=tints[gi%tints.length];
      t+=`<tr><td colspan="${nCols}" style="${tdL}background:${gbg};font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:.04em">${esc(lab)}</td></tr>`;
      by.get(lab).forEach(x=>{
        const sh=shareFor(x,code);
        const amt=(isInHouse(x)?ihRemaining(x):projOutflow(x))*sh;
        const nm=(x.name||'(untitled)')+(isSplitP(x)?` (${Math.round(sh*100)}% share of ${fmt(isInHouse(x)?ihRemaining(x):projOutflow(x),false)})`:'');
        t+=`<tr><td style="${tdL}background:${rbg}">${esc(nm)}</td>${moneyCell(amt,'background:'+rbg+';')}`
          +(full?`<td style="${tdL}background:${rbg};text-align:center">${esc(x.plannedStart?fmtDateShort(x.plannedStart):'—')}</td>`
               +`<td style="${tdL}background:${rbg};text-align:center">${esc(x.plannedEnd?fmtDateShort(x.plannedEnd):'—')}</td>`:'')
          +`<td style="${tdL}background:${rbg}">${esc(projNextStatus(x))}</td>`
          +(full?`<td style="${tdL}background:${rbg};text-align:center">${esc(lienCell(x))}</td>`:'')
          +`</tr>`;
      });
    });
    return t+`</table>`;
  };
  const noneP=t=>`<p style="font-family:Calibri,Arial,sans-serif;font-size:13px;margin:0">${t}</p>`;
  const projRemaining=budget-spent-cm.outstandingTotal;
  let html=`<p style="font-family:Calibri,Arial,sans-serif;font-size:13px;margin:0 0 12px">Hi${firstName?' '+esc(firstName):''},</p>`
    +`<p style="font-family:Calibri,Arial,sans-serif;font-size:13px;margin:0 0 14px">Could you confirm the summary below is up to date, and flag any changes to costs, status, or new projects to add?</p>`
    +`<p style="${hdTxt}">SPECIAL PROJECTS SUMMARY${asOf?` (as of ${esc(asOf)})`:''}</p>`
    +`<table style="border-collapse:collapse">`
    +`<tr><td style="${tdL}">SP Budget</td>${moneyCell(budget)}</tr>`
    +`<tr><td style="${tdL}">Spent to date</td>${moneyCell(spent)}</tr>`
    +`<tr><td style="${tdL}">Remaining budget</td>${moneyCell(remaining)}</tr>`
    +`<tr><td style="${tdL}">Outstanding commitments</td>${moneyCell(cm.outstandingTotal)}</tr>`
    +`<tr><td style="${tdL}font-weight:bold;background:#f2f4f7">Budget remaining (projected)</td>${moneyCell(projRemaining,'font-weight:bold;background:#f2f4f7;')}</tr>`
    +`</table>`
    +`<p style="${hdTxt}">PROJECTS IN CASH PROJECTIONS (${included.length})</p>`
    +(included.length?projTable(included,COOL_TINTS,true):noneP('(none committed)'))
    +`<p style="${hdTxt}">PROJECTS NOT IN CASH PROJECTIONS (${excluded.length})</p>`
    +(excluded.length?projTable(excluded,WARM_TINTS,false):noneP('(none)'))
    +`<p style="font-family:Calibri,Arial,sans-serif;font-size:13px;margin:14px 0 0">Please reply with any updates or corrections. Thanks!</p>`;
  return {subject, html};
}

/* RFC-822 unsent draft (X-Unsent: 1) — Outlook opens it as a compose window
   with the HTML rendered and To/Cc pre-filled; mailto can't carry formatting. */
function buildEml({subject,to,cc,html}){
  const htmlDoc='<html><head><meta charset="utf-8"></head><body>'+html+'</body></html>';
  const bytes=new TextEncoder().encode(htmlDoc);
  let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
  const b64=btoa(bin).replace(/(.{76})/g,'$1\r\n');
  const hv=s=>String(s||'').replace(/[\r\n]+/g,' ').trim();
  return (hv(to)?'To: '+hv(to)+'\r\n':'')+(hv(cc)?'Cc: '+hv(cc)+'\r\n':'')
    +'Subject: '+hv(subject)+'\r\nX-Unsent: 1\r\nMIME-Version: 1.0\r\n'
    +'Content-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n'+b64;
}
const emlFileName=subject=>String(subject).replace(/[\\/:*?"<>|]/g,'-')+'.eml';
function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const a=el('a',{href:url,download:name});
  document.body.append(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}
/* Minimal STORE-only (no compression) .zip so all drafts download as one file. */
function makeZip(files){   // files: [{name, bytes:Uint8Array}]
  const enc=new TextEncoder();
  const tbl=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c;}return t;})();
  const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=tbl[(c^b[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
  const u16=n=>[n&255,(n>>8)&255], u32=n=>[n&255,(n>>8)&255,(n>>16)&255,(n>>24)&255];
  const now=new Date();
  const dosT=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
  const dosD=(((now.getFullYear()-1980)&0x7F)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  const chunks=[]; const central=[]; let offset=0;
  files.forEach(f=>{
    const nameB=enc.encode(f.name); const crc=crc32(f.bytes); const sz=f.bytes.length;
    const local=new Uint8Array([0x50,0x4B,3,4,...u16(20),...u16(0),...u16(0),...u16(dosT),...u16(dosD),...u32(crc),...u32(sz),...u32(sz),...u16(nameB.length),...u16(0)]);
    chunks.push(local,nameB,f.bytes);
    central.push({nameB,crc,sz,off:offset});
    offset+=local.length+nameB.length+sz;
  });
  const cdStart=offset;
  central.forEach(c=>{
    const hdr=new Uint8Array([0x50,0x4B,1,2,...u16(20),...u16(20),...u16(0),...u16(0),...u16(dosT),...u16(dosD),...u32(c.crc),...u32(c.sz),...u32(c.sz),...u16(c.nameB.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(c.off)]);
    chunks.push(hdr,c.nameB); offset+=hdr.length+c.nameB.length;
  });
  chunks.push(new Uint8Array([0x50,0x4B,5,6,...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(offset-cdStart),...u32(cdStart),...u16(0)]));
  return new Blob(chunks,{type:'application/zip'});
}
/* Remember per-property email settings (To/CC/greeting + include flags) so
   drafts come pre-addressed and the bulk download knows who's in. */
async function saveEmailSettings(code,s){
  const pr=PROP(code);
  const same=pr && pr.updateTo===s.to && pr.updateCc===s.cc && (pr.updateGreeting||'')===s.greeting
    && (pr.updateEnabled!==false)===(s.enabled!==false) && (pr.updateIncludeDiscussed===true)===(s.includeDiscussed===true);
  if(same) return false;
  try{
    await API.send('PATCH','/properties/'+code+'/recipients',{updateTo:s.to,updateCc:s.cc,updateGreeting:s.greeting,updateEnabled:s.enabled!==false,updateIncludeDiscussed:s.includeDiscussed===true});
    if(pr){pr.updateTo=s.to;pr.updateCc=s.cc;pr.updateGreeting=s.greeting;pr.updateEnabled=s.enabled!==false;pr.updateIncludeDiscussed=s.includeDiscussed===true;}
    return true;
  }catch(e){ toast('Could not save email settings: '+e.message); return false; }
}

/* Dashboard "⚙ Email setup": every property in one grid — include checkbox,
   To / CC / greeting and the discussed toggle. Saves back to property settings. */
function openEmailSetup(){
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet',style:'max-width:980px'});
  const inpStyle='width:100%;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--panel);color:var(--ink);font-size:12.5px';
  const rows=[];
  const regOrder=regionNames();
  const propsSorted=S.properties.slice().sort((a,b)=>(regOrder.indexOf(a.region)-regOrder.indexOf(b.region))||a.code.localeCompare(b.code));
  const grid=el('div',{style:'overflow:auto'});
  const t=el('table',{class:'tbl'});
  t.append(el('thead',{},tr(th('In'),th('Property'),th('To'),th('CC'),th('Greeting'),th('Discussed/notes'))));
  const tb=el('tbody');
  propsSorted.forEach(pr=>{
    const inC=el('input',{type:'checkbox',title:'Include in the bulk "Update emails" download'}); inC.checked=pr.updateEnabled!==false;
    const toI=el('input',{value:pr.updateTo||'',placeholder:'to@…',style:inpStyle});
    const ccI=el('input',{value:pr.updateCc||'',placeholder:'cc@… (optional)',style:inpStyle});
    const grI=el('input',{value:pr.updateGreeting||'',placeholder:'auto',style:inpStyle+';max-width:110px'});
    const dC=el('input',{type:'checkbox',title:'Include discussed / notes projects in this property’s email'}); dC.checked=pr.updateIncludeDiscussed===true;
    rows.push({code:pr.code,inC,toI,ccI,grI,dC});
    tb.append(tr(td(inC),
      td(el('span',{style:'display:inline-flex;align-items:center;gap:6px'},el('span',{style:`width:9px;height:9px;border-radius:2px;background:${pcolor(pr.code)};display:inline-block`}),el('strong',{},pr.code))),
      td(toI),td(ccI),td(grI),td(dC)));
  });
  t.append(tb); grid.append(t);
  const saveAll=async()=>{
    let n=0;
    for(const r of rows){
      const changed=await saveEmailSettings(r.code,{to:r.toI.value.trim(),cc:r.ccI.value.trim(),greeting:r.grI.value.trim(),enabled:r.inC.checked,includeDiscussed:r.dC.checked});
      if(changed)n++;
    }
    scrim.remove();
    toast(n?`Email settings saved for ${n} propert${n===1?'y':'ies'}`:'No changes');
    render();
  };
  sheet.append(
    el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Update-email setup'),
      el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'),
      el('button',{class:'btn accent',onclick:saveAll},'Save all')),
    el('div',{class:'sb'},
      el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'“In” controls the bulk ⬇ Update emails download. “Discussed/notes” adds pre-approval projects and bare notes to that property’s email (off = committed work only). All of this saves to the property and also applies to individual drafts.'),
      grid));
  scrim.append(sheet); document.body.append(scrim);
}

function openUpdateEmail(code){
  const p=PROP(code)||{};
  const {subject,html}=buildUpdateEmail(code);
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Draft update email · '+code), el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Close'));
  const bb=el('div',{class:'sb'});
  bb.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'"Outlook draft" opens a ready-to-send compose window with the tables intact; Copy pastes rich.'));
  const inpStyle='width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)';
  const lbl=t=>el('label',{style:'display:block;font-size:11.5px;font-weight:600;color:var(--ink-2);margin:10px 0 4px'},t);
  // Compact recipients line + ⚙ settings popup (To / CC / greeting live there).
  const recipTxt=el('span',{style:'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--ink-2)'});
  const refreshRecip=()=>{ const pr=PROP(code)||{};
    recipTxt.textContent=(pr.updateTo?'To: '+pr.updateTo:'To: — (set recipients)')+(pr.updateCc?'   ·   CC: '+pr.updateCc:''); };
  refreshRecip();
  function openRecipSettings(){
    const pr=PROP(code)||{};
    const s2=el('div',{class:'scrim modal-center',style:'z-index:2000',onclick:e=>{if(e.target===s2)closeSettings();}});
    const sh2=el('div',{class:'sheet'});
    const autoName=(()=>{const t={...pr,updateGreeting:''};return greetingNameFor(t);})();
    const toI=el('input',{value:pr.updateTo||'',placeholder:'kianna.parisien@monarchinvestment.com; …',style:inpStyle});
    const ccI=el('input',{value:pr.updateCc||'',placeholder:'regional@…; accounting@… (optional)',style:inpStyle});
    const grI=el('input',{value:pr.updateGreeting||'',placeholder:autoName?`auto: ${autoName}`:'auto from the To address',style:inpStyle});
    const discChk=el('input',{type:'checkbox',onchange:()=>{}}); discChk.checked=pr.updateIncludeDiscussed===true;
    const enChk=el('input',{type:'checkbox'}); enChk.checked=pr.updateEnabled!==false;
    const closeSettings=async()=>{
      const changed=await saveEmailSettings(code,{to:toI.value.trim(),cc:ccI.value.trim(),greeting:grI.value.trim(),enabled:enChk.checked,includeDiscussed:discChk.checked});
      s2.remove(); refreshRecip();
      if(changed){ bodyDiv.innerHTML=buildUpdateEmail(code).html; }   // greeting/content may have changed
    };
    sh2.append(el('div',{class:'sh'}, el('h2',{style:'font-size:15px;flex:1'},'Email settings · '+code), el('button',{class:'btn ghost',onclick:closeSettings},'Done')),
      el('div',{class:'sb'},
        el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12px'},'Saved with the property — drafts (including the dashboard bulk download) come pre-addressed. Greeting is pulled from the To address unless overridden.'),
        lbl('To'),toI, lbl('CC'),ccI, lbl('Greeting name (override)'),grI,
        el('label',{class:'chk',style:'display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13px'},discChk,'Include discussed / notes projects in the email (off = committed work only)'),
        el('label',{class:'chk',style:'display:flex;gap:8px;align-items:center;margin-top:8px;font-size:13px'},enChk,'Include this property in the dashboard "Update emails" bulk download')));
    s2.append(sh2); document.body.append(s2);
  }
  const subInp=el('input',{value:subject,style:inpStyle});
  // White canvas regardless of app theme — it previews how the email will look.
  const bodyDiv=el('div',{contenteditable:'true',style:'background:#ffffff;color:#1b1e26;border:1px solid var(--line);border-radius:8px;padding:14px;min-height:260px;max-height:46vh;overflow:auto;margin-top:4px'});
  bodyDiv.innerHTML=html;
  const copyBtn=el('button',{class:'btn',onclick:async()=>{
    try{
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':new Blob([bodyDiv.innerHTML],{type:'text/html'}),
        'text/plain':new Blob([bodyDiv.innerText],{type:'text/plain'})})]);
      toast('Copied — paste into Outlook');
    }catch(e){
      const r=document.createRange(); r.selectNodeContents(bodyDiv);
      const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
      document.execCommand('copy'); sel.removeAllRanges();
      toast('Copied — paste into Outlook');
    }
  }},'📋 Copy');
  const emlBtn=el('button',{class:'btn accent',onclick:()=>{
    const pr=PROP(code)||{};
    const eml=buildEml({subject:subInp.value,to:pr.updateTo,cc:pr.updateCc,html:bodyDiv.innerHTML});
    downloadBlob(new Blob([eml],{type:'message/rfc822'}), emlFileName(subInp.value));
    toast('Draft downloaded — open it and Outlook composes with formatting');
  }},'✉ Outlook draft');
  const mailBtn=el('button',{class:'btn ghost',onclick:()=>{const pr=PROP(code)||{};window.location.href='mailto:'+encodeURIComponent(pr.updateTo||'')+'?cc='+encodeURIComponent(pr.updateCc||'')+'&subject='+encodeURIComponent(subInp.value)+'&body='+encodeURIComponent(bodyDiv.innerText);}},'Plain-text email');
  bb.append(
    el('div',{style:'display:flex;align-items:center;gap:8px;margin-bottom:2px'}, recipTxt,
      el('button',{class:'btn ghost sm',title:'To / CC / greeting — saved with the property',onclick:openRecipSettings},'⚙')),
    lbl('Subject'),subInp, lbl('Body'),bodyDiv,
    el('div',{style:'display:flex;gap:8px;margin-top:12px;justify-content:flex-end'},mailBtn,copyBtn,emlBtn));
  sheet.append(head,bb); scrim.append(sheet); document.body.append(scrim);
}

/* =========================================================
   PROPERTY DETAIL
========================================================= */
function viewProperty(){
  const code=VIEW.prop||S.properties[0].code;
  const p=PROP(code); const c=S.cash[code]||{};
  const budget=Number(p.spBudget)||0;
  const glSpent=glSpentFor(code);
  const cushSpent=c.spSpent!=null?Number(c.spSpent):null;
  const spent=glSpent||cushSpent||0;
  const remaining=budget-spent;
  const cm=cashModel(code);
  const am=auditModel(code);
  const usedPct=budget?spent/budget:0;
  const cashToday=cm.cashToday;
  // cpd calculated later after projEndCash
  // years remaining on the loan, from the cash record's maturity date (MM/DD/YYYY)
  let loanYrs=null;
  if(c.loanDue){ const m=String(c.loanDue).split('/'); if(m.length===3){ const due=new Date(+m[2],+m[0]-1,+m[1]); if(!isNaN(due)){ loanYrs=(due-new Date())/(1000*60*60*24*365.25); } } }
  const cashPerYr=(loanYrs!=null&&loanYrs>0)?cashToday/loanYrs:null;
  // conditional formatting
  const remTone = remaining<0?'bad':(budget&&remaining<budget*0.15?'warn':'good');
  // cpdTone and projEndTone declared after projEndCash below
  const projToBudget = budget-cm.outstandingTotal-spent;   // SP budget less committed-unpaid less spent
  const ptbTone = projToBudget<0?'bad':(budget&&projToBudget<budget*0.15?'warn':'good');

  // --- annual accretion + interest projection ---
  const asOf = c.asOfDate || S.meta.cashAsOf || '';
  const moOf = (()=>{ const iso=String(asOf).match(/^(\d{4})-(\d{2})/); const us=String(asOf).match(/^(\d{1,2})\//); return iso?+iso[2]:(us?+us[1]:0); })();
  const qtrsLeft = moOf?Math.max(0,5-Math.ceil(moOf/3)):0;   // count current quarter (Q2 -> 3)
  const monthsLeft = moOf?Math.max(0,12-moOf):0;
  const sentPct = c.returnSent!=null?Number(c.returnSent):0;
  const cushMade = c.returnEarned!=null?Number(c.returnEarned):0;
  const madePct = p.accretionPct!=null?Number(p.accretionPct):cushMade;
  const capitalDollars = (c.capital!=null?Number(c.capital):0)*1000;   // stored in $K
  const accretion = ((madePct-sentPct)/100)/4*capitalDollars*qtrsLeft;
  // avg monthly interest income = mean of the interest-income postings (manual override wins)
  const intLines = S.gl.filter(g=>g.property===code && isInterestGL(g));
  const intTotal = intLines.reduce((a,g)=>a+Math.abs(Number(g.amount)||0),0);
  const autoAvgInt = intLines.length ? intTotal/intLines.length : 0;
  const avgInt = (p.avgMonthlyInterest!=null && Number(p.avgMonthlyInterest)>0) ? Number(p.avgMonthlyInterest) : autoAvgInt;
  const projTotalSpend = spent + cm.outstandingTotal;          // spent to date + committed (not yet paid)
  // Current quarter distribution: prorated by months elapsed (May=2/3 of Q, Jun=3/3, etc.)
  const currentQtr = moOf ? Math.ceil(moOf/3) : 0;
  const monthsAccrued = moOf ? ((moOf-1)%3)+1 : 0;   // Apr=1, May=2, Jun=3, Jul=1, …
  const distQtrs = p.distributionQuarters||{};
  const effectiveSentPct = distQtrs['rate']!=null ? Number(distQtrs['rate']) : sentPct;
  const monthlyDist = (effectiveSentPct/100/12)*capitalDollars;
  const currentQtrDistDefault = monthlyDist*monthsAccrued;
  const currentQtrDist = distQtrs['current']!=null ? Number(distQtrs['current']) : currentQtrDistDefault;

  // Future quarters: add NET accretion only (earned − sent); distributions are funded by earnings so net = spread
  const futureQtrs = Math.max(0, qtrsLeft-1);
  const netAccretionPerQtr = ((madePct-effectiveSentPct)/100/4)*capitalDollars;
  const futureAccretion = netAccretionPerQtr*futureQtrs;
  const accrTileVal = futureAccretion;

  const inclAccretion = p.includeAccretionInProj!==false;
  const inclReturns = p.includeReturnsInProj!==false;

  // Proj Remaining Spend w Interest = outstanding net of future interest income
  const projRemainingSpendInt = cm.outstandingTotal - avgInt*monthsLeft;

  // Proj YYYY end Cash = cash − current Q distribution + future Q net accretion − remaining SP spend
  const projEndCash = cashToday
    - projRemainingSpendInt
    - (inclReturns ? currentQtrDist : 0)
    + (inclAccretion ? futureAccretion : 0);
  const projEndTone = projEndCash<0?'bad':(projEndCash<cashToday*0.25?'warn':'good');
  const cpd = p.units ? projEndCash/Number(p.units) : null;
  const cpdTone = cpd==null?'none':(cpd>=3000?'good':(cpd>=2000?'warn':'bad'));

  async function saveSettings(s){ try{ await API.send('PATCH','/properties/'+code+'/settings',s); await afterWrite('Saved'); }catch(e){ toast('Save failed: '+e.message); } }
  const allSettings=(overrides={})=>Object.assign({accretionPct:p.accretionPct??null,avgMonthlyInterest:avgInt,includeAccretionInProj:p.includeAccretionInProj!==false,includeReturnsInProj:p.includeReturnsInProj!==false,distributionQuarters:p.distributionQuarters||{}},overrides);
  const detRow=(k,v)=>el('div',{style:'display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid var(--line-2);font-size:13px'}, el('span',{},k), el('span',{class:'mono'+((typeof v==='number'&&v<0)?' neg':''),style:'font-weight:600'}, typeof v==='number'?fmt(v):v));
  function openAccretion(){
    let edited=madePct;
    let editedSent=effectiveSentPct;
    let editedIncl=p.includeAccretionInProj!==false;
    const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
    const sheet=el('div',{class:'sheet'}); const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Annual accretion · '+code), el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Close'));
    const b=el('div',{class:'sb'});
    b.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'Accretion grows the cash position but never affects SP budget or spend. Estimate = (return earned − return sent) ÷ 4 × capital × quarters remaining in the year.'));
    const body=el('div',{});
    const redraw=()=>{ body.innerHTML=''; const acc=((edited-editedSent)/100/4)*capitalDollars*futureQtrs;
      body.append(detRow('Spread', (edited-editedSent).toFixed(2)+'%'), detRow('Capital', fmt(capitalDollars)),
        detRow('Future quarters (after current Q)', String(futureQtrs)), detRow('Net accretion (in Proj end Cash)', acc)); };
    redraw();
    const earnInp=el('input',{type:'number',step:'0.01',value:String(madePct),style:'width:120px;padding:8px 10px;border:1px solid var(--line);border-radius:8px',oninput:e=>{edited=parseFloat(e.target.value)||0;redraw();}});
    const sentInp=el('input',{type:'number',step:'0.01',value:String(effectiveSentPct.toFixed(2)),style:'width:120px;padding:8px 10px;border:1px solid var(--line);border-radius:8px',oninput:e=>{editedSent=parseFloat(e.target.value)||0;redraw();}});
    const inclChk=el('input',{type:'checkbox',id:'incl-acc',checked:editedIncl,style:'margin-right:6px',onchange:e=>{editedIncl=e.target.checked;}});
    b.append(
      el('div',{class:'field'}, el('label',{},'Return earned % — defaults to cushion'), earnInp),
      el('div',{class:'field',style:'margin-top:8px'}, el('label',{},'Return sent % — cushion: '+sentPct.toFixed(2)+'%'), sentInp),
      body,
      el('div',{style:'display:flex;align-items:center;gap:6px;margin:12px 0 4px'}, inclChk, el('label',{for:'incl-acc',style:'font-size:13px;cursor:pointer'},'Include accretion in Proj end Cash')),
      el('div',{style:'display:flex;gap:8px;margin-top:12px'}, el('div',{style:'flex:1'}),
        el('button',{class:'btn ghost',onclick:()=>{edited=cushMade;earnInp.value=String(cushMade);editedSent=sentPct;sentInp.value=sentPct.toFixed(2);redraw();}},'Reset to cushion'),
        el('button',{class:'btn accent',onclick:async()=>{
          const newQtrs=Object.assign({},p.distributionQuarters||{});
          if(Math.abs(editedSent-sentPct)<0.005){delete newQtrs['rate'];}else{newQtrs['rate']=editedSent;}
          scrim.remove();await saveSettings(allSettings({accretionPct:edited,includeAccretionInProj:editedIncl,distributionQuarters:newQtrs}));
        }},'Save')
      )
    );
    sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
  }
  function openInterest(){
    let edited=avgInt;
    const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
    const sheet=el('div',{class:'sheet'}); const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Projection with interest · '+code), el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Close'));
    const b=el('div',{class:'sb'});
    b.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'Interest-income sweeps posted to the SP GL are averaged per posting (override below). The projection reduces projected total spend by that average for the remaining months of the year.'));
    const body=el('div',{});
    const redraw=()=>{ body.innerHTML=''; body.append(
      detRow('Interest postings (GL)', String(intLines.length)),
      detRow('Total interest income', intTotal),
      detRow('Average per posting', intLines.length?intTotal/intLines.length:0),
      detRow('Avg monthly interest (used)', edited),
      detRow('Months remaining', String(monthsLeft)),
      detRow('Projected interest', edited*monthsLeft),
      detRow('Projected total spend', projTotalSpend),
      detRow('Projected spend net interest', projTotalSpend-edited*monthsLeft)); };
    redraw();
    const inp=el('input',{type:'number',step:'1',value:String(Math.round(avgInt)),style:'width:160px;padding:8px 10px;border:1px solid var(--line);border-radius:8px',oninput:e=>{edited=parseFloat(e.target.value)||0;redraw();}});
    b.append(el('div',{class:'field'}, el('label',{},'Avg monthly interest — blank/0 uses the GL average'), inp), body,
      el('div',{style:'display:flex;gap:8px;margin-top:12px'}, el('div',{style:'flex:1'}),
        el('button',{class:'btn accent',onclick:async()=>{scrim.remove();await saveSettings(allSettings({avgMonthlyInterest:edited}));}},'Save')));
    sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
  }
  function openReturns(){
    let editedIncl=p.includeReturnsInProj!==false;
    let editedRate=distQtrs['rate']!=null ? Number(distQtrs['rate']) : sentPct;
    let editedAmt=currentQtrDist;
    const summary=el('div',{style:'background:var(--surface-2,#f5f5f5);border-radius:8px;padding:10px 12px;margin:10px 0;font-size:13px'});
    const amtInp=el('input',{type:'number',step:'1',value:String(Math.round(editedAmt)),
      style:'width:160px;padding:8px 10px;border:1px solid var(--line);border-radius:8px',
      oninput:e=>{editedAmt=parseFloat(e.target.value)||0;}});
    const redrawSummary=()=>{
      const eff=isNaN(editedRate)?sentPct:editedRate;
      const dist=(eff/100/12)*capitalDollars*monthsAccrued;
      const futAcc=((madePct-eff)/100/4)*capitalDollars*futureQtrs;
      while(summary.firstChild)summary.removeChild(summary.firstChild);
      summary.append(
        detRow('Q'+currentQtr+' distribution ('+monthsAccrued+' of 3 months)',dist),
        detRow('Future accretion ('+futureQtrs+'q × '+(madePct-eff).toFixed(2)+'% spread)',futAcc));
      amtInp.value=String(Math.round(dist)); editedAmt=dist;
    };
    const rateInp=el('input',{type:'number',step:'0.01',value:String(editedRate.toFixed(2)),
      style:'width:120px;padding:8px 10px;border:1px solid var(--line);border-radius:8px',
      oninput:e=>{editedRate=parseFloat(e.target.value)||0;redrawSummary();}});
    const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
    const sheet=el('div',{class:'sheet'}); const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Q'+currentQtr+' distribution · '+code), el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Close'));
    const b=el('div',{class:'sb'});
    b.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:12.5px'},'Current quarter distribution is deducted from Proj end Cash. Future quarters add net accretion (earned − sent) only — distributions are funded by earnings so the net effect is the spread.'));
    const inclChk=el('input',{type:'checkbox',id:'incl-ret',checked:editedIncl,style:'margin-right:6px',onchange:e=>{editedIncl=e.target.checked;}});
    b.append(el('div',{style:'display:flex;align-items:center;gap:6px;margin-bottom:14px'}, inclChk, el('label',{for:'incl-ret',style:'font-size:13px;cursor:pointer'},'Include in Proj end Cash')));
    b.append(detRow('Return rate sent (cushion)',sentPct.toFixed(2)+'%'));
    b.append(detRow('Capital',fmt(capitalDollars)));
    b.append(el('div',{class:'field',style:'margin-top:10px'},el('label',{},'Distribution rate (%)'),rateInp));
    b.append(summary);
    redrawSummary();
    b.append(
      el('div',{class:'field',style:'margin-top:10px'},el('label',{},'Q'+currentQtr+' distribution override ($)'),amtInp),
      el('div',{style:'display:flex;gap:8px;margin-top:14px'},el('div',{style:'flex:1'}),
        el('button',{class:'btn ghost',onclick:()=>{editedRate=sentPct;rateInp.value=sentPct.toFixed(2);redrawSummary();}},'Reset rate'),
        el('button',{class:'btn accent',onclick:async()=>{
          const eff=isNaN(editedRate)?sentPct:editedRate;
          const calcDef=(eff/100/12)*capitalDollars*monthsAccrued;
          const newQtrs=Object.assign({},p.distributionQuarters||{});
          if(Math.abs(eff-sentPct)<0.005){delete newQtrs['rate'];}else{newQtrs['rate']=eff;}
          if(Math.abs(editedAmt-calcDef)<1){delete newQtrs['current'];}else{newQtrs['current']=editedAmt;}
          scrim.remove();await saveSettings(allSettings({includeReturnsInProj:editedIncl,distributionQuarters:newQtrs}));
        }},'Save')
      )
    );
    sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
  }

  const fy=(asOf||today()).slice(0,4);
  // YYYY Budget Proj = Total Budgeted − Spent to date − Outstanding Commitments + Interest Projection (if any)
  //                  = Remaining budget − Projected outstanding spend net interest
  const yyyyBudgetProj = budget - spent - projRemainingSpendInt;
  const ybpTone = yyyyBudgetProj<0?'bad':(budget&&yyyyBudgetProj<budget*0.15?'warn':'good');
  const intProj = avgInt*monthsLeft;
  const projEndSub=[inclReturns?`− ${fmt(currentQtrDist,false)} Q${currentQtr} distrib`:null, inclAccretion&&futureAccretion?`+ ${fmt(futureAccretion,false)} accretion`:null].filter(Boolean).join(' · ')||'after committed';
  const bar=propHead(p,
    [ el('button',{class:'btn',onclick:()=>openUpdateEmail(code)},'📧 Update email'),
      el('button',{class:'btn',onclick:()=>{VIEW.tab='cash';render();}},'Adjust cash'),
      el('button',{class:'btn accent',onclick:()=>{VIEW.prop=code;openProject(null);}},'+ New project') ],
    [ hstat('Spent to date', fmt(spent), 'none', 'posted per GL'),
      hstat('Current cash', fmt(cashToday), 'none', c.asOfDate?('as of '+c.asOfDate):'snapshot + adj'),
      hstat(`Proj addt Expenses ${fy}`, fmt(projRemainingSpendInt), 'none', intProj?`net ${fmt(intProj,false)} interest income`:'committed, not yet paid', openInterest),
      hstat(`Remaining in ${fy}`, fmt(yyyyBudgetProj), ybpTone, `${fmt(remaining,false)} budget less proj spend`),
      hstat(`${fy} Remaining Accretion`, fmt(accrTileVal), futureAccretion>=0?'good':'bad', `${(madePct-effectiveSentPct).toFixed(2)}% spread · ${futureQtrs}q future${inclAccretion?'':' · excl.'}`, openAccretion),
      hstat(`Proj ${fy} end Cash`, fmt(projEndCash), projEndTone, projEndSub, openReturns),
      hstat('Cash / door', cpd==null?'—':fmt(cpd), cpdTone, p.units?`${p.units} units (proj end cash)`:'no unit count') ]);
  const body=el('div',{class:'grid',style:'grid-template-columns:330px 1fr'});

  // LEFT: cash + loan
  // On phones these two panels are collapsed by default to save vertical space
  // (they're reference data); on desktop they stay expanded as before.
  const isMobile = window.matchMedia('(max-width:820px)').matches;
  const left=el('div',{class:'grid',style:'gap:16px;align-content:start'});
  const cashPanel=el('details',{class:'panel coll'}); cashPanel.open=!isMobile;
  cashPanel.append(el('summary',{class:'ph coll-sum'}, el('span',{class:'chev'},'▸'), el('h3',{},'Cash position'), el('div',{class:'sp'}), el('span',{class:'chip'},`snapshot ${c.asOfDate||S.meta.cashAsOf||'—'}`)));
  const sl=el('div',{class:'pad stat-list'});
  const row=(k,v,cls,sub)=>el('div',{class:'sl'+(cls?' '+cls:'')}, el('span',{class:'k'},k,sub?el('span',{class:'sl-sub'},sub):null), el('span',{class:'v'+(typeof v==='number'&&v<0?' neg':'')},typeof v==='number'?fmt(v):v));
  // Projected cash with an expandable, line-by-line breakdown by status.
  const projCashRow=(()=>{
    const mini=(k,v,o={})=>el('div',{style:`display:flex;justify-content:space-between;gap:10px;padding:2px 0;font-size:12px;${o.strong?'font-weight:600;':'color:var(--ink-2);'}${o.indent?'padding-left:16px;':''}`},
      el('span',{},k), el('span',{class:'mono'+((typeof v==='number'&&v<0)?' neg':'')}, typeof v==='number'?fmt(v):v));
    const grp=t=>el('div',{style:'font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);margin:8px 0 2px'},t);
    const bd=el('div',{style:'padding:8px 0 2px;border-top:1px dashed var(--line-2);margin-top:6px'});
    bd.append(mini('Cash today',cm.cashToday,{strong:true}));
    if(cm.outstanding.length){
      bd.append(grp('Less — outstanding (approved, not yet paid)'));
      cm.outstanding.forEach(p=>bd.append(mini('− '+(p.name||'(untitled)'), -(p.inHouse?ihRemaining(p):projOutflow(p)), {indent:true})));
      bd.append(mini('Subtotal outstanding', -cm.outstandingTotal, {strong:true,indent:true}));
    } else { bd.append(mini('Less — outstanding', 0, {indent:true})); }
    bd.append(mini('= Projected cash', cm.projectedCash, {strong:true}));
    if(cm.paid.length){
      bd.append(grp('For reference — paid (already out)'));
      cm.paid.forEach(p=>bd.append(mini(p.name||'(untitled)', (p.inHouse?ihDone(p):projOutflow(p)), {indent:true})));
    }
    if(cm.discussed.length){
      bd.append(grp('For reference — discussed (not committed)'));
      cm.discussed.forEach(p=>bd.append(mini(p.name||'(untitled)', projOutflow(p), {indent:true})));
    }
    const d=el('details',{});
    d.append(el('summary',{class:'sl',style:'cursor:pointer;align-items:flex-start'},
      el('span',{class:'k'},'Projected cash', el('span',{class:'sl-sub'},'once open work is paid · show math')),
      el('span',{class:'v'+(cm.projectedCash<0?' neg':'')}, fmt(cm.projectedCash))), bd);
    return d;
  })();
  sl.append(
    row('Cash snapshot', cm.snapshot==null?'—':cm.snapshot,null,'from cushion report'),
    row('Mid-month adjustments', cm.adj),
    row('Cash today', cm.cashToday,'hl','final · actual'),
    row('Outstanding commitments', cm.outstandingTotal?-cm.outstandingTotal:0,null,'approved, not yet paid'),
    projCashRow,
    row('SP budget (2026)', budget,null,'annual capex budget'),
    row('Spent to date', spent,null,'posted per GL'),
    row('Remaining', remaining,null,pct(usedPct)+' of budget used'),
    row('Spent vs SP budget', budget-(spent+cm.outstandingTotal),null,'budget less spent & committed'),
    cm.discussedTotal?row('Discussed / ideas', cm.discussedTotal,null,'not yet committed'):null,
  );
  cashPanel.append(sl); left.append(cashPanel);

  const loanPanel=el('details',{class:'panel coll'}); loanPanel.open=!isMobile;
  loanPanel.append(el('summary',{class:'ph coll-sum'}, el('span',{class:'chev'},'▸'), el('h3',{},'Loan & valuation')));
  const sl3=el('div',{class:'pad stat-list'});
  sl3.append(
    row('Market value', c.marketValue!=null?Number(c.marketValue):'—'),
    row('Loan amount', c.loanAmount!=null?Number(c.loanAmount):'—'),
    row('LTV', c.ltv!=null?pctWhole(c.ltv):'—'),
    row('Loan rate', c.loanRate!=null?pctWhole(c.loanRate):'—'),
    row('Loan matures', c.loanDue||'—'),
    row('DCR', c.dcr!=null?Number(c.dcr).toFixed(2)+'x':'—'),
    row('NOI', c.noi!=null?Number(c.noi):'—'),
    row('Units', p.units?String(p.units):'—'),
    row('Cash / yr of loan', cashPerYr==null?'—':cashPerYr, null, loanYrs!=null&&loanYrs>0?`${loanYrs.toFixed(1)} yrs to ${c.loanDue}`:'no loan maturity'),
  );
  loanPanel.append(sl3); left.append(loanPanel);

  // RIGHT: projects (grouped) + reconciliation + GL
  const right=el('div',{class:'grid',style:'gap:16px;align-content:start'});
  const projsAll=projForProp(code).filter(p2=>inDateRange(p2,PFILT));
  const atlProjs=projsAll.filter(isATL);            // operational-cashflow work: own group, hidden by default
  const projs=projsAll.filter(p2=>!isATL(p2));
  if(PFILT.hide.atl===undefined)PFILT.hide.atl=true;
  const pj=el('div',{class:'panel'});
  const counts={}; PHASES.forEach(ph=>counts[ph.key]=projs.filter(p2=>phase(p2)===ph.key).length);
  // phase filter chips — click to hide/show a completion group
  const filt=el('div',{class:'phasefilt'});
  PHASES.forEach(ph=>{ if(!counts[ph.key])return; const hidden=!!PFILT.hide[ph.key];
    filt.append(el('button',{class:'pf-chip'+(hidden?' off':''),title:hidden?'Show':'Hide',onclick:()=>{PFILT.hide[ph.key]=!PFILT.hide[ph.key];render();}},
      el('span',{},ph.label), el('span',{class:'pf-n'},String(counts[ph.key]))));
  });
  if(atlProjs.length){ const hidden=!!PFILT.hide.atl;
    filt.append(el('button',{class:'pf-chip'+(hidden?' off':''),title:(hidden?'Show':'Hide')+' — operationally funded, excluded from SP projections',
      onclick:()=>{PFILT.hide.atl=!PFILT.hide.atl;render();}},
      el('span',{},'Above the Line'), el('span',{class:'pf-n'},String(atlProjs.length))));
  }
  // Header + filters stay together in one sticky unit so they're visible while
  // scrolling the projects list (until the whole section scrolls past).
  const stick=el('div',{class:'pj-stick'},
    el('div',{class:'ph'}, el('h3',{},'Projects'), el('div',{class:'sp'}), el('span',{class:'chip'},`${projs.length} total`)),
    el('div',{class:'pad pj-filters',style:'padding-bottom:8px'},dateFilterGroup(PFILT),el('div',{class:'pj-gap'}),filt,
      el('div',{class:'pj-hint',style:'font-size:11px;color:var(--ink-3);margin-top:8px'},'Auto-grouped by completion. Click a group to hide it; 📌 pins a project to the top.')));
  pj.append(stick);
  const pb=el('div',{class:'proj-list'});
  if(!projs.length)pb.append(el('div',{class:'empty'},'No projects yet for this property.'));
  function projRow(pr){
    const ih=isInHouse(pr);
    const split=isSplitP(pr);
    const fullCost=ih?ihTotal(pr):(pr.actualCost!=null?pr.actualCost:pr.anticipatedCost);
    // Split projects show this property's slice (the tooltip carries the total).
    const costVal=split&&fullCost!=null?Number(fullCost)*shareFor(pr,code):fullCost;
    const hasCost=costVal!=null&&costVal!==''&&!isNaN(Number(costVal));
    const r=el('div',{class:'clickrow proj-row',onclick:()=>openProject(pr.id)});
    const head=el('div',{class:'pr-head'},
      el('button',{class:'pinbtn'+(pr.pinned?' on':''),title:pr.pinned?'Unpin':'Pin to top',onclick:e=>{e.stopPropagation();pr.pinned=!pr.pinned;saveProject(pr,pr.pinned?'Pinned':'Unpinned');}},'📌'),
      el('strong',{class:'pr-name'}, pr.name), projSym(pr),
      split?el('span',{class:'chip',title:`Split across ${allocsOf(pr).map(a=>a.property+' '+a.pct+'%').join(' · ')} — total ${fmt(fullCost,false)}`},`⇄ ${Math.round(shareFor(pr,code)*100)}%`):null,
      el('div',{class:'pr-right'},
        hasCost?el('span',{class:'mono pr-cost',title:split?`This property’s share of ${fmt(fullCost,false)} total`:''},fmt(costVal,false)):null,
        el('span',{class:'pr-date'}, el('span',{class:'pr-cat'},pr.category+' · '), fmtDateShort(pr.dateAdded))));
    r.append(head, ih?progressEl(pr):trackEl(pr));
    return r;
  }
  const pinned=projs.filter(p2=>p2.pinned && !PFILT.hide[phase(p2)]);
  if(pinned.length){ pb.append(el('div',{class:'grp-h pinned'},'📌 Pinned', el('span',{class:'grp-n'},String(pinned.length)))); pinned.forEach(pr=>pb.append(projRow(pr))); }
  PHASES.forEach(ph=>{
    if(PFILT.hide[ph.key])return;
    const list=projs.filter(p2=>phase(p2)===ph.key && !p2.pinned);
    if(!list.length)return;
    list.sort((a,b)=>(stage(b)-stage(a))||(b.dateAdded||'').localeCompare(a.dateAdded||''));
    pb.append(el('div',{class:'grp-h'}, ph.label, el('span',{class:'grp-n'},String(list.length))));
    list.forEach(pr=>pb.append(projRow(pr)));
  });
  if(atlProjs.length&&!PFILT.hide.atl){
    pb.append(el('div',{class:'grp-h'},'Above the Line · operational cashflow', el('span',{class:'grp-n'},String(atlProjs.length))));
    atlProjs.slice().sort((a,b)=>(b.dateAdded||'').localeCompare(a.dateAdded||'')).forEach(pr=>pb.append(projRow(pr)));
  }
  pj.append(pb); right.append(pj);

  // reconciliation & flags
  const auditP=el('div',{class:'panel'});
  const reviewN=am.unplanned.length+am.paidNoGL.length;
  auditP.append(el('div',{class:'ph'}, el('h3',{},'Reconciliation & flags'), el('div',{class:'sp'}),
    el('span',{class:'chip'+(reviewN?' hold':' done')}, reviewN?`${reviewN} to review`:'all clear')));
  const ab=el('div',{class:'pad'});
  ab.append(el('div',{class:'recon'},
    reconCell('GL posted',am.glTotal),
    reconCell('Paid per tracker',cm.paidTotal),
    reconCell('Difference',am.glTotal-cm.paidTotal,Math.abs(am.glTotal-cm.paidTotal)>OVER_THRESHOLD)));
  ab.append(flagBlock('Posted over $5,000 — unplanned',
    am.unplanned.map(g=>({title:g.vendor||g.category,sub:(g.date||'')+' · '+g.category,amt:g.amount})),'rust',
    'Large ledger postings not linked to a tracked project. Link them on the ledger below, or add the project so the spend is accounted for.'));
  ab.append(flagBlock('Marked paid — no ledger match',
    am.paidNoGL.map(p2=>({title:p2.name,sub:p2.category,amt:projOutflow(p2),onclick:()=>openProject(p2.id)})),'amber',
    'Flagged paid in the tracker but with no linked GL entry to confirm. Link a ledger line below to finalize.'));
  auditP.append(ab); right.append(auditP);

  // GL
  const gls=S.gl.filter(g=>g.property===code);
  const glCats=[...new Set(gls.map(g=>g.category).filter(Boolean))].sort();
  let glView=gls.slice();
  if(GLFILT.hideSmall) glView=glView.filter(g=>Math.abs(Number(g.amount)||0)>=1000);
  if(GLFILT.cat) glView=glView.filter(g=>g.category===GLFILT.cat);
  if(GLFILT.match==='linked') glView=glView.filter(g=>!!g.linkedProjectId);
  if(GLFILT.match==='unlinked') glView=glView.filter(g=>!g.linkedProjectId&&!isInterestGL(g));
  if(GLFILT.match==='interest') glView=glView.filter(g=>isInterestGL(g));
  // Sweep/interest income is never budgeted SP spend — hidden by default unless explicitly viewed
  if(GLFILT.hideInterest && GLFILT.match!=='interest') glView=glView.filter(g=>!isInterestGL(g));
  glView.sort((a,b)=>Math.abs(Number(b.amount)||0)-Math.abs(Number(a.amount)||0)||(String(a.category||'').localeCompare(String(b.category||''))));
  const gp=el('div',{class:'panel',style:'overflow:auto'});
  const glCatSel=el('select',{class:'mini-sel',onchange:e=>{GLFILT.cat=e.target.value;render();}},
    el('option',{value:''},'All categories'),
    ...glCats.map(cat=>el('option',{value:cat,...(GLFILT.cat===cat?{selected:true}:{})},cat)));
  const glMatchSel=el('select',{class:'mini-sel',onchange:e=>{GLFILT.match=e.target.value;render();}},
    el('option',{value:'',...(GLFILT.match===''?{selected:true}:{})},'All lines'),
    el('option',{value:'unlinked',...(GLFILT.match==='unlinked'?{selected:true}:{})},'Unlinked'),
    el('option',{value:'linked',...(GLFILT.match==='linked'?{selected:true}:{})},'Linked'),
    el('option',{value:'interest',...(GLFILT.match==='interest'?{selected:true}:{})},'Interest income'));
  const glHideChk=el('input',{type:'checkbox',...(GLFILT.hideSmall?{checked:true}:{}),onchange:e=>{GLFILT.hideSmall=e.target.checked;render();}});
  const glHideIntChk=el('input',{type:'checkbox',...(GLFILT.hideInterest?{checked:true}:{}),...(GLFILT.match==='interest'?{disabled:true}:{}),onchange:e=>{GLFILT.hideInterest=e.target.checked;render();}});
  gp.append(el('div',{class:'ph'}, el('h3',{},'General ledger — SP spend'), el('div',{class:'sp'}),
    el('span',{class:'chip'},`${glView.length}${glView.length!==gls.length?' of '+gls.length:''} lines`),
    el('span',{class:'chip'},fmt(glSpent))));
  gp.append(el('div',{style:'display:flex;gap:10px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--line-2);flex-wrap:wrap'},
    glCatSel, glMatchSel,
    el('label',{style:'display:flex;align-items:center;gap:5px;font-size:12.5px;cursor:pointer'}, glHideChk, 'Hide under $1,000'),
    el('label',{style:`display:flex;align-items:center;gap:5px;font-size:12.5px;cursor:pointer${GLFILT.match==='interest'?';opacity:.5':''}`,title:'Sweep/interest income is never budgeted SP spend'}, glHideIntChk, 'Hide interest income')));
  if(glView.length){
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('Amount','r'),th('Category'),th('Date'),th('Vendor / description'),th('Match'))));
    const tbb=el('tbody');
    glView.forEach(g=>{
      tbb.append(tr(tdn(g.amount,1),td(el('span',{style:'font-size:12px'},g.category)),
        td(el('span',{class:'mono',style:'font-size:12px'},g.date)),
        td(el('div',{style:'font-size:12px;max-width:260px'}, el('div',{},g.vendor), g.remarks?el('div',{style:'color:var(--ink-3);font-size:11px'},g.remarks):null)),
        td(glLinkCell(g,code))));
    });
    t.append(tbb); gp.append(t);
  } else gp.append(el('div',{class:'empty'},gls.length?'No lines match the current filters.':'No ledger lines for this property. Upload a general ledger on the Data tab.'));
  right.append(gp);

  body.append(left,right);
  return {bar,body};
}
/* GL link cell: shows the linked project or a Match button with a best-guess hint. */
function glLinkCell(g,code){
  const cell=el('div',{class:'gl-link'});
  if(isInterestGL(g)){ cell.append(el('span',{class:'chip',title:'Interest income — excluded from matching; feeds the interest projection'},'interest income')); return cell; }
  if(g.linkedProjectId){
    const pr=S.projects.find(x=>x.id===g.linkedProjectId);
    cell.append(el('button',{class:'gl-linked',title:pr?('Re-match · '+pr.name):'',onclick:()=>openGLMatch(g,code)}, '🔗 '+(pr?pr.name.slice(0,20):'(missing)')));
    if(g.partial)cell.append(el('span',{class:'chip',style:'background:var(--amber-soft);color:var(--amber)'},'partial'));
    cell.append(el('button',{class:'btn ghost sm',title:'Unlink',onclick:()=>{g.linkedProjectId=null;g.partial=false;linkGl(g,'Unlinked');}},'✕'));
  } else {
    const cands=projForProp(code).map(pr=>({pr,...glMatchScore(g,pr)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    cell.append(el('button',{class:'btn sm accent',onclick:()=>openGLMatch(g,code)},'Match…'));
    if(cands[0])cell.append(el('button',{class:'gl-hint',title:'Suggested: '+cands[0].pr.name,onclick:()=>openGLMatch(g,code)},'≈ '+cands[0].pr.name.slice(0,16)));
  }
  return cell;
}
/* Matcher modal: ranked rough matches + tie-out options (update total / partial / link). */
function openGLMatch(g,code){
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Match ledger line to a project'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Close'));
  const b=el('div',{class:'sb'});
  b.append(el('div',{class:'panel pad'},
    el('div',{style:'display:flex;gap:10px;align-items:center;flex-wrap:wrap'},
      el('strong',{class:'mono',style:'font-size:16px'},fmt(g.amount)), el('span',{class:'chip'},g.category||'—'),
      el('span',{style:'color:var(--ink-3);font-size:12px'},g.date||'')),
    el('div',{style:'margin-top:5px;font-size:13px'},g.vendor||''),
    g.remarks?el('div',{style:'font-size:11.5px;color:var(--ink-3);margin-top:2px'},g.remarks):null));
  let q='';
  const listWrap=el('div',{class:'panel',style:'margin-top:14px;overflow:hidden'});
  const search=el('input',{type:'search',placeholder:'Search this property’s projects…',style:'width:100%;padding:10px 12px;border:0;border-bottom:1px solid var(--line-2);background:var(--panel-2)',oninput:e=>{q=e.target.value.toLowerCase();draw();}});
  const rows=el('div',{style:'max-height:52vh;overflow:auto'});
  listWrap.append(search,rows); b.append(listWrap);
  function commitLink(pr,mode){
    g.linkedProjectId=pr.id;
    const amt=Math.abs(Number(g.amount)||0);
    if(mode==='update'){
      if(pr.inHouse){ pr.totalToComplete=amt; pr.amountCompleted=amt; }
      else { pr.actualCost=amt; pr.anticipatedCost=pr.anticipatedCost!=null?pr.anticipatedCost:amt; pr.steps.workCompleted=true; pr.steps.paid=true; }
      g.partial=false;
    } else if(mode==='partial'){
      g.partial=true;
      if(pr.inHouse){ pr.amountCompleted=Math.min(ihTotal(pr)||amt,(Number(pr.amountCompleted)||0)+amt); }
      else { pr.steps.workStarted=true; }   // partial payment — work underway, not fully paid
    } else {
      if(!pr.inHouse){ pr.steps.workCompleted=true; pr.steps.paid=true; }
      g.partial=false;
    }
    scrim.remove(); saveMatch(g,pr,'Ledger line matched');
  }
  function draw(){
    rows.innerHTML='';
    let cands=projForProp(code).map(pr=>({pr,...glMatchScore(g,pr)}));
    if(q)cands=cands.filter(x=>(x.pr.name+' '+x.pr.category+' '+(x.pr.contractor||'')).toLowerCase().includes(q));
    cands.sort((a,b)=>b.score-a.score || (b.pr.dateAdded||'').localeCompare(a.pr.dateAdded||''));
    if(!cands.length){rows.append(el('div',{class:'empty'},'No matching projects.'));return;}
    cands.slice(0,40).forEach(({pr,score,reasons})=>{
      const total=pr.inHouse?ihTotal(pr):projOutflow(pr);
      const row=el('div',{class:'gm-row'});
      const rh=el('div',{class:'gm-head'},
        el('div',{style:'flex:1;min-width:0'},
          el('div',{class:'gm-name'},pr.name, pr.inHouse?el('span',{class:'chip ih',style:'margin-left:6px'},'In-house'):null),
          el('div',{class:'gm-sub'}, pr.category+(total?(' · total '+fmt(total,false)):' · no total'))),
        score>0?el('span',{class:'gm-score'},score+'%'):null);
      const rwrap=el('div',{class:'gm-reasons'}); reasons.forEach(rs=>rwrap.append(el('span',{class:'gm-tag'},rs)));
      row.append(rh); if(reasons.length)row.append(rwrap);
      const diff = total>0 && Math.abs(Math.abs(g.amount)-total)/Math.max(Math.abs(g.amount),total) > 0.01;
      const actions=el('div',{class:'gm-actions'});
      if(diff){
        actions.append(el('div',{class:'gm-note'},`Ledger ${fmt(g.amount)} vs project total ${fmt(total)} — how should this tie out?`),
          el('div',{style:'display:flex;gap:7px;flex-wrap:wrap'},
            el('button',{class:'btn sm accent',onclick:()=>commitLink(pr,'update')},`Set total to ${fmt(g.amount,false)}`),
            el('button',{class:'btn sm',onclick:()=>commitLink(pr,'partial')},'Partial payment'),
            el('button',{class:'btn sm ghost',onclick:()=>commitLink(pr,'link')},'Link, keep total')));
      } else {
        actions.append(el('button',{class:'btn sm accent',onclick:()=>commitLink(pr,'update')},'Tie out & link'));
      }
      row.append(actions); rows.append(row);
    });
  }
  draw();
  sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
}

/* =========================================================
   CASH & LOANS
========================================================= */
/* =========================================================
   QUARTERLY SUMMARY (Money tab) — narrative draft language per
   portfolio/property for a chosen quarter, in the style of the
   quarterly investor reports. Built from the quarter's GL lines
   (notes/vendors/linked projects) plus the tracker pipeline for
   the "future special projects" sentence.
========================================================= */
// Portfolio membership is the per-property "portfolio" field (editable in
// Settings). Properties sharing a portfolio name form one portfolio card;
// a property with no portfolio gets its own property-style card.
function portfolios(){
  const by=new Map(); const regOrder=regionNames();
  const props=S.properties.slice().sort((a,b)=>
    (regOrder.indexOf(a.region)-regOrder.indexOf(b.region))||a.code.localeCompare(b.code));
  props.forEach(p=>{
    const name=(p.portfolio||'').trim()||p.name||p.code;
    if(!by.has(name))by.set(name,{key:name,name,props:[]});
    by.get(name).props.push(p.code);
  });
  return [...by.values()];
}
const fmtQK=n=>'$'+Math.round(Math.abs(n)/1000)+'K';   // report convention: $36K
// Normalize a GL date to ISO regardless of stored format (ISO, MM/DD/YYYY, M/D/YY).
function isoDateOf(v){
  const raw=String(v||'').trim(); if(!raw)return '';
  if(/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0,10);
  let m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if(m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/); if(m) return `20${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  return '';
}
const qtrOf=iso=>{ const m=+String(iso||'').slice(5,7); return m?Math.ceil(m/3):null; };
function qRange(y,q){ const endM=q*3; const last=new Date(y,endM,0).getDate();
  return [`${y}-${String(endM-2).padStart(2,'0')}-01`, `${y}-${String(endM).padStart(2,'0')}-${String(last).padStart(2,'0')}`]; }
const glForQuarter=(code,y,q)=>{ const [s,e]=qRange(y,q); return S.gl.filter(g=>{ const d=isoDateOf(g.date); return g.property===code&&d&&d>=s&&d<=e; }); };
// Human-ish description of a GL line: linked project name > remarks > vendor > category.
function glDesc(g){
  const linked=g.linkedProjectId&&S.projects.find(p=>p.id===g.linkedProjectId);
  let d=String((linked&&linked.name)||g.remarks||g.vendor||g.category||'miscellaneous work').trim();
  if(d===d.toUpperCase()) d=d.toLowerCase();
  return d.replace(/\.$/,'');
}
const lcFirst=s=>{ s=String(s).trim().replace(/\.$/,''); return /^[A-Z][a-z]/.test(s)?s.charAt(0).toLowerCase()+s.slice(1):s; };
const joinAnd=arr=>{ arr=arr.filter(Boolean); if(!arr.length)return ''; if(arr.length===1)return arr[0];
  if(arr.length===2)return arr[0]+' as well as '+arr[1];
  return arr.slice(0,-1).join(', ')+', as well as '+arr[arr.length-1]; };
// Pipeline items that read as "future" work: discussed / notes / on hold / approved but not yet started.
function futureSPList(code){
  const seen=new Set();
  return projForProp(code)
    .filter(p=>!isComplete(p)&&!isPaidP(p)&&!(p.steps&&p.steps.workStarted)&&phase(p)!=='done'&&!isATL(p))
    .sort((a,b)=>projOutflow(b)-projOutflow(a))
    .map(p=>lcFirst(p.name)).filter(Boolean)
    .filter(n=>{ const k=n.toLowerCase(); if(seen.has(k))return false; seen.add(k); return true; });
}
function qSpend(code,y,q){
  const lines=glForQuarter(code,y,q);
  const interest=lines.filter(isInterestGL).reduce((a,g)=>a+Math.abs(+g.amount||0),0);
  const total=lines.filter(g=>!isInterestGL(g)).reduce((a,g)=>a+(+g.amount||0),0);
  const items=lines.filter(g=>!isInterestGL(g)&&(+g.amount||0)>0).sort((a,b)=>b.amount-a.amount);
  return {total,interest,items};
}
function topDescs(items,limit,withProp){
  const out=[],seen=new Set();
  for(const it of items){
    const g=it.g||it, code=it.code;
    let d=glDesc(g); const k=d.toLowerCase();
    if(seen.has(k))continue; seen.add(k);
    if(withProp&&code){ const nm=(PROP(code)||{}).name||code; d+=' at '+nm; }
    out.push({d,amt:+g.amount});
    if(out.length>=limit)break;
  }
  return out;
}
function propQuarterDraft(code,y,q){
  const {total,interest,items}=qSpend(code,y,q);
  const parts=[];
  parts.push(total>500?`${fmtQK(total)} was spent on Special Projects throughout the quarter.`
                      :'Special Projects spend was minimal during the quarter.');
  const ds=topDescs(items,4,false);
  if(ds.length){
    parts.push(`The largest cost incurred was attributed to ${ds[0].d} (${fmtQK(ds[0].amt)}).`);
    if(ds.length>1) parts.push(`Other costs included ${joinAnd(ds.slice(1).map(x=>x.d))}.`);
  }
  if(interest>500) parts.push(`The property benefited from ${fmtQK(interest)} of interest income accrued throughout the quarter, resulting in an effective SP cost of ${fmtQK(total-interest)}.`);
  const fut=futureSPList(code).slice(0,7);
  if(fut.length) parts.push(`Future Special Projects could include ${joinAnd(fut)}.`);
  return parts.join('  ');
}
function portQuarterDraft(pf,y,q){
  let total=0,interest=0; const items=[];
  pf.props.forEach(code=>{ const s=qSpend(code,y,q); total+=s.total; interest+=s.interest; s.items.forEach(g=>items.push({g,code})); });
  items.sort((a,b)=>b.g.amount-a.g.amount);
  const parts=[`${fmtQK(total)} was spent on Special Projects during the quarter.`];
  const ds=topDescs(items,4,true);
  if(ds.length) parts.push(`Special Projects included costs associated with ${joinAnd(ds.map(x=>x.d))}.`);
  if(interest>500) parts.push(`The portfolio did benefit from ${fmtQK(interest)} of interest income accrued throughout the quarter, resulting in an effective SP cost of ${fmtQK(total-interest)}.`);
  const fut=[];
  pf.props.forEach(code=>{ const nm=(PROP(code)||{}).name||code;
    futureSPList(code).slice(0,3).forEach(f=>fut.push(`${f} at ${nm}`)); });
  if(fut.length) parts.push(`Future Special Projects may include ${joinAnd(fut.slice(0,8))}.`);
  parts.push('On top of these projects, we intend to also continue to address curb appeal items and other minor building repairs throughout the portfolio, as our attention to street appeal and resident satisfaction has allowed for further rental growth and sustained occupancy.');
  return parts.join('  ');
}
function quarterlySummaryPanel(){
  const isMobile=window.matchMedia('(max-width:820px)').matches;
  const dates=S.gl.map(g=>isoDateOf(g.date)).filter(Boolean).sort();
  const undated=S.gl.length-dates.length;
  // Default to the last *completed* quarter that has GL data (reports are
  // written for finished quarters; a just-started quarter is mostly empty).
  if(!QS.year){
    const t=today(); let ly=+t.slice(0,4), lq=(qtrOf(t)||1)-1; if(lq<1){lq=4;ly--;}   // last completed
    const qs=[...new Set(dates.map(d=>`${d.slice(0,4)}-${qtrOf(d)}`))].sort();        // quarters with data
    const pick=qs.filter(k=>k<=`${ly}-${lq}`).pop()||qs.pop();
    if(pick){ QS.year=+pick.split('-')[0]; QS.q=+pick.split('-')[1]; }
    else { QS.year=ly; QS.q=lq; }
  }
  const qs=el('details',{class:'panel coll'}); qs.open=!isMobile;
  qs.append(el('summary',{class:'ph coll-sum'}, el('span',{class:'chev'},'▸'), el('h3',{},'Quarterly summary'), el('div',{class:'sp'}),
    el('span',{class:'chip'},`Q${QS.q} ${QS.year}`)));
  const bodyEl=el('div',{class:'pad'});
  // quarter picker
  const years=[...new Set([...dates.map(d=>+d.slice(0,4)),QS.year])].sort();
  const yearSel=el('select',{class:'mini-sel',onchange:e=>{QS.year=+e.target.value;render();}});
  years.forEach(y=>yearSel.append(el('option',{value:String(y),...(QS.year===y?{selected:true}:{})},String(y))));
  const qSel=el('select',{class:'mini-sel',onchange:e=>{QS.q=+e.target.value;render();}});
  [1,2,3,4].forEach(n=>qSel.append(el('option',{value:String(n),...(QS.q===n?{selected:true}:{})},'Q'+n)));
  bodyEl.append(el('div',{style:'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px'},
    el('span',{class:'bub-lab'},'Quarter'), qSel, yearSel,
    el('span',{style:'font-size:11.5px;color:var(--ink-3)'},'Drafts built from the quarter’s GL (notes, vendors, linked projects) + the tracker pipeline. Edit freely, then copy.')));
  if(undated>0) bodyEl.append(el('div',{style:'font-size:12px;color:var(--rust);margin-bottom:10px'},
    `⚠ ${undated} GL line${undated!==1?'s have':' has'} no usable date, so they can't be placed in a quarter. Re-upload the GL to fix the dates.`));
  if(!dates.length) bodyEl.append(el('div',{style:'font-size:12px;color:var(--ink-3);margin-bottom:10px'},
    'No dated GL lines loaded yet — totals below will be empty until a GL is uploaded.'));
  const copyBtn=txtEl=>el('button',{class:'btn ghost sm',onclick:async()=>{try{await navigator.clipboard.writeText(txtEl.value);toast('Copied');}catch(e){txtEl.select();document.execCommand('copy');toast('Copied');}}},'📋 Copy');
  const draftBox=text=>{ const ta=el('textarea',{class:'qs-draft'}); ta.value=text; return ta; };
  // One report per portfolio: multi-property portfolios get a single high-level
  // summary; standalone sites (WYND) get the property-style narrative.
  portfolios().forEach(pf=>{
    const card=el('div',{class:'qs-card'});
    card.append(el('div',{class:'qs-head'}, el('strong',{},pf.name),
      el('span',{class:'bs-meta'},pf.props.join(' · '))));
    const ta=draftBox(pf.props.length>1?portQuarterDraft(pf,QS.year,QS.q):propQuarterDraft(pf.props[0],QS.year,QS.q));
    card.append(el('div',{class:'qs-row'}, el('span',{class:'qs-lab'},pf.props.length>1?'Portfolio report':'Property report'), copyBtn(ta)), ta);
    bodyEl.append(card);
  });
  qs.append(bodyEl);
  return qs;
}

function viewCash(){
  const bar=topbar('Money','Cash & Loans',
    el('button',{class:'btn accent',onclick:openAdjust},'+ Cash adjustment'));
  const body=el('div',{class:'grid'});

  // snapshot table
  const sp=el('div',{class:'panel',style:'overflow:auto'});
  sp.append(el('div',{class:'ph'}, el('h3',{},'Cash snapshot & loan terms'), el('div',{class:'sp'}), el('span',{class:'chip'},`cushion as of ${S.meta.cashAsOf||'—'}`)));
  const tbl=el('table',{class:'tbl'});
  tbl.append(el('thead',{},tr(th('Property'),th('Snapshot cash','r'),th('Adjustments','r'),th('Cash today','r'),
    th('Outstanding','r'),th('Projected cash','r'),
    th('SP remaining','r'),th('Loan amount','r'),th('Rate','r'),th('LTV','r'),th('Matures','r'),th('DCR','r'))));
  const tb=el('tbody');
  regionNames().forEach(reg=>{
    if(!S.properties.some(p=>p.region===reg))return;
    tb.append(el('tr',{class:'grp'}, el('td',{colspan:12},reg)));
    S.properties.filter(p=>p.region===reg).forEach(p=>{
      const c=S.cash[p.code]||{}; const adj=cashAdjFor(p.code); const cmm=cashModel(p.code);
      tb.append(el('tr',{class:'clickrow',onclick:()=>{VIEW.tab='property';VIEW.prop=p.code;render();}},
        td(el('strong',{},p.code)),
        tdn(c.cash,1), td(el('span',{class:adj<0?'mono neg':'mono'},adj?fmt(adj):'—'),'r'),
        td(el('span',{class:'mono',style:'font-weight:600'},fmt(effectiveCash(p.code))),'r'),
        td(el('span',{class:'mono'+(cmm.outstandingTotal?' neg':'')},cmm.outstandingTotal?fmt(-cmm.outstandingTotal):'—'),'r'),
        td(el('span',{class:'mono',style:'font-weight:600'},fmt(cmm.projectedCash)),'r'),
        tdn(c.spRemaining,1), tdn(c.loanAmount,1),
        td(el('span',{class:'mono'},c.loanRate!=null?pctWhole(c.loanRate):'—'),'r'),
        td(el('span',{class:'mono'},c.ltv!=null?pctWhole(c.ltv):'—'),'r'),
        td(el('span',{class:'mono',style:'font-size:12px'},c.loanDue||'—'),'r'),
        td(el('span',{class:'mono'},c.dcr!=null?Number(c.dcr).toFixed(2)+'x':'—'),'r')));
    });
  });
  tbl.append(tb); sp.append(tbl); body.append(sp);

  // adjustments ledger
  const ap=el('div',{class:'panel'});
  ap.append(el('div',{class:'ph'}, el('h3',{},'Mid-month cash adjustments'), el('div',{class:'sp'}),
    el('button',{class:'btn sm accent',onclick:openAdjust},'+ Add')));
  const ab=el('div',{});
  if(!S.cashAdjustments.length)ab.append(el('div',{class:'empty'},el('div',{class:'big'},'No adjustments yet'),'Record cash moves between monthly cushion reports — they layer on top of the snapshot.'));
  else{
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('Date'),th('Property'),th('Note'),th('Amount','r'),th(''))));
    const tbb=el('tbody');
    S.cashAdjustments.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).forEach(a=>{
      tbb.append(tr(td(el('span',{class:'mono',style:'font-size:12px'},a.date)),
        td(propChip(a.property)),
        td(a.note||'—'),
        td(el('span',{class:a.amount<0?'mono neg':'mono'},fmt(a.amount)),'r'),
        td(el('button',{class:'btn ghost sm',onclick:()=>{delAdj(a.id);}},'✕'))));
    });
    t.append(tbb); ab.append(t);
  }
  ap.append(ab); body.append(ap);

  // quarterly narrative drafts
  body.append(quarterlySummaryPanel());
  return {bar,body};
}
function openAdjust(){
  const a={id:uid('A'),property:VIEW.prop||S.properties[0].code,date:today(),amount:null,note:''};
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const propSel=el('select',{onchange:e=>a.property=e.target.value});
  S.properties.forEach(pr=>propSel.append(el('option',{value:pr.code,...(a.property===pr.code?{selected:true}:{})},`${pr.code} — ${pr.name}`)));
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Cash adjustment'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'));
  const b=el('div',{class:'sb'});
  const f=(l,n)=>el('div',{class:'field'},el('label',{},l),n);
  b.append(f('Property',propSel));
  b.append(el('div',{class:'frow'},
    f('Date',el('input',{type:'date',value:a.date,oninput:e=>a.date=e.target.value})),
    f('Amount (+ in / − out)',el('input',{type:'number',placeholder:'0',oninput:e=>a.amount=e.target.value===''?null:+e.target.value}))));
  b.append(f('Note',el('input',{placeholder:'e.g. distribution, large invoice, transfer',oninput:e=>a.note=e.target.value})));
  b.append(el('div',{style:'display:flex;gap:8px;margin-top:8px'}, el('div',{style:'flex:1'}),
    el('button',{class:'btn accent',onclick:()=>{if(a.amount==null){toast('Enter an amount.');return;}scrim.remove();addAdj(a);}},'Save adjustment')));
  sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
}

/* =========================================================
   DATA / UPLOAD
========================================================= */
function viewData(){
  const bar=topbar('Data','Upload & Data');
  const body=el('div',{class:'grid',style:'grid-template-columns:1fr 1fr'});

  body.append(uploadPanel('General ledger','GL', 'Pulls SP account spend by property & category. Confirms work completed and vendors paid.',
    'gl', S.meta.glPeriod?`Loaded · ${S.meta.glPeriod} · ${S.gl.length} lines`:'No GL loaded'));
  body.append(uploadPanel('Cash cushion report','Cushion','Updates each property’s cash position, SP budget/spend and loan terms.',
    'cushion', S.meta.cashAsOf?`Loaded · as of ${S.meta.cashAsOf}`:'No cushion loaded'));

  // import history (raw files are kept — re-download any past upload)
  const hist=el('div',{class:'panel',style:'grid-column:1/-1'});
  hist.append(el('div',{class:'ph'}, el('h3',{},'Import history'), el('div',{class:'sp'}),
    el('span',{class:'chip'},'uploaded files are kept')));
  const histPad=el('div',{class:'pad'});
  histPad.append(el('div',{style:'color:var(--ink-3);font-size:13px'},'Loading…'));
  hist.append(histPad); body.append(hist);
  API.get('/imports').then(rows=>{
    histPad.innerHTML='';
    if(!rows.length){ histPad.append(el('div',{style:'color:var(--ink-3);font-size:13px'},'No imports recorded yet — history starts with the next confirmed upload.')); return; }
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('When'),th('Type'),th('Label'),th('Rows','r'),th('By'),th('File'))));
    const tb2=el('tbody');
    rows.forEach(i=>tb2.append(tr(
      td(i.createdAt?new Date(i.createdAt).toLocaleString():'—'),
      td(i.kind==='gl'?'General ledger':'Cash cushion'),
      td(i.label||'—'), tdn(i.count), td(i.username||'—'),
      td(i.fileKey?el('a',{href:`/api/files/${i.fileKey}?name=${encodeURIComponent(i.fileName||'import.xlsx')}`,style:'color:var(--blue)'},i.fileName||'download'):'—'))));
    t.append(tb2);
    histPad.append(el('div',{style:'overflow:auto'},t));
  }).catch(()=>{ histPad.innerHTML=''; histPad.append(el('div',{style:'color:var(--ink-3);font-size:13px'},'Could not load import history.')); });

  // backup panel
  const bk=el('div',{class:'panel',style:'grid-column:1/-1'});
  bk.append(el('div',{class:'ph'}, el('h3',{},'Backup & restore')));
  const bb=el('div',{class:'pad'});
  bb.append(el('p',{style:'color:var(--ink-3);margin-top:0;font-size:13px'},
    'Data is saved to the shared database for everyone on the team. Export a JSON backup to keep a safe copy or move data between environments; importing a backup replaces ALL current data.'));
  const rowb=el('div',{style:'display:flex;gap:10px;flex-wrap:wrap'});
  rowb.append(
    el('button',{class:'btn pri',onclick:exportBackup},'⬇ Export backup (.json)'),
    (()=>{const lbl=el('button',{class:'btn',onclick:()=>inp.click()},'⬆ Import backup');const inp=addDrop(lbl,'.json',f=>importBackup(f));return lbl;})(),
    el('button',{class:'btn',onclick:exportCSV},'⬇ Export projects (.csv)'),
    el('div',{style:'flex:1'}),
    el('button',{class:'btn danger',onclick:()=>{if(confirm('Reset everything to the seeded starter data? This affects ALL users and cannot be undone.')){resetSeed();}}},'Reset to starter data'));
  bb.append(rowb);
  bk.append(bb); body.append(bk);

  // counts
  const stats=el('div',{class:'panel',style:'grid-column:1/-1'});
  stats.append(el('div',{class:'ph'}, el('h3',{},'What’s loaded')));
  const sg=el('div',{class:'pad',style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px'});
  const stat=(l,v)=>el('div',{}, el('div',{class:'kpi'}, el('div',{class:'lab'},l), el('div',{class:'val'},v)));
  sg.append(stat('Properties',S.properties.length),stat('Projects',S.projects.length),
    stat('GL lines',S.gl.length),stat('Cash adjustments',S.cashAdjustments.length));
  stats.append(sg); body.append(stats);
  return {bar,body};
}
function uploadPanel(title,tag,desc,kind,status){
  const p=el('div',{class:'panel'});
  p.append(el('div',{class:'ph'}, el('h3',{},title), el('div',{class:'sp'}), el('span',{class:'chip'},status)));
  const pad=el('div',{class:'pad'});
  pad.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:13px'},desc));
  const drop=el('div',{class:'drop'});
  drop.append(el('div',{style:'font-size:26px'},'⇪'), el('div',{class:'big'},`Drop the ${tag} .xlsx here`),
    el('div',{style:'color:var(--ink-3);font-size:12.5px'},'or click to choose a file'));
  const inp=el('input',{type:'file',accept:'.xlsx,.xls',style:'display:none',onchange:e=>{if(e.target.files[0])uploadImport(e.target.files[0],kind);}});
  drop.append(inp);
  drop.addEventListener('click',()=>inp.click());
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('hot');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('hot'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('hot');const f=e.dataTransfer.files[0];if(f)uploadImport(f,kind);});
  pad.append(drop); p.append(pad); return p;
}
async function uploadImport(file,kind){
  if(!file)return;
  const fd=new FormData(); fd.append('file',file);
  toast('Uploading…');
  try{
    const r=await fetch('/api/import/'+kind,{method:'POST',body:fd});
    if(!r.ok){ let msg; try{msg=(await r.json()).error;}catch(e){ msg='Could not read that file.'; } toast(msg||'Could not read that file.'); return; }
    const data=await r.json();
    if(kind==='gl') glPreview(data); else cushionPreview(data);
  }catch(e){ toast('Upload failed: '+e.message); }
}

/* ---- GL parser ---- */
function glPreview(data){
  const {token,count,period,byProperty,unknownCodes}=data;
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Confirm general ledger import'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'),
    el('button',{class:'btn accent',onclick:async()=>{ try{ await API.send('POST','/import/gl/confirm',{token}); scrim.remove(); await afterWrite(`Imported ${count} ledger lines`); }catch(e){ toast('Import failed: '+e.message); } }},`Import ${count} lines`));
  const b=el('div',{class:'sb'});
  b.append(el('p',{style:'margin-top:0;color:var(--ink-3)'},`Found ${count} SP ledger lines${period?` for ${period}`:''}. Lines for the properties in this file are replaced; other properties keep their data. Spend by property:`));
  if(unknownCodes&&unknownCodes.length) b.append(el('p',{style:'font-size:12.5px;color:var(--wheat-d);background:var(--wheat-soft);border-radius:8px;padding:8px 10px'},
    `Also found ${unknownCodes.length} code${unknownCodes.length>1?'s':''} not set up yet: ${unknownCodes.join(', ')}. Their lines are kept and appear automatically when the property is added in Settings.`));
  const t=el('table',{class:'tbl'});t.append(el('thead',{},tr(th('Property'),th('Net spend','r'))));
  const known=new Set(S.properties.map(p=>p.code));
  const tbb=el('tbody');Object.keys(byProperty).sort().forEach(k=>tbb.append(tr(td(known.has(k)?k:k+' (new)'),tdn(byProperty[k],1))));
  t.append(tbb);b.append(el('div',{class:'panel',style:'overflow:auto'},t));
  sheet.append(head,b);scrim.append(sheet);document.body.append(scrim);
}
function cushionPreview(data){
  const {token,count,asOf,found,unknownCodes}=data;
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},'Confirm cash cushion import'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'),
    el('button',{class:'btn accent',onclick:async()=>{ try{ await API.send('POST','/import/cushion/confirm',{token}); scrim.remove(); await afterWrite('Cash cushion updated'); }catch(e){ toast('Import failed: '+e.message); } }},'Apply update'));
  const b=el('div',{class:'sb'});
  b.append(el('p',{style:'margin-top:0;color:var(--ink-3)'},`Matched ${count} properties · as of ${asOf}. Mid-month adjustments are preserved and continue to layer on top.`));
  if(unknownCodes&&unknownCodes.length) b.append(el('p',{style:'font-size:12.5px;color:var(--wheat-d);background:var(--wheat-soft);border-radius:8px;padding:8px 10px'},
    `Includes ${unknownCodes.length} propert${unknownCodes.length>1?'ies':'y'} not set up yet: ${unknownCodes.join(', ')}. Their snapshots are kept and appear automatically when added in Settings.`));
  const t=el('table',{class:'tbl'});t.append(el('thead',{},tr(th('Property'),th('Cash','r'),th('SP budget','r'),th('SP spent','r'),th('Loan','r'),th('Matures','r'))));
  const tbb=el('tbody');Object.keys(found).sort().forEach(k=>{const c=found[k];tbb.append(tr(td(k),tdn(c.cash,1),tdn(c.spBudget,1),tdn(c.spSpent,1),tdn(c.loanAmount,1),td(c.loanDue||'—','r')));});
  t.append(tbb);b.append(el('div',{class:'panel',style:'overflow:auto'},t));
  sheet.append(head,b);scrim.append(sheet);document.body.append(scrim);
}

/* ---- backup ---- */
function exportBackup(){ const a=el('a',{href:'/api/export/backup.json'}); document.body.append(a); a.click(); a.remove(); toast('Backup downloading…'); }
function importBackup(file){ if(!file)return; const fr=new FileReader(); fr.onload=async e=>{ try{ const d=JSON.parse(e.target.result); if(!d.properties||!d.projects)throw 0; await restoreBackup(d); }catch(err){ toast('That file is not a valid backup.'); } }; fr.readAsText(file); }
function exportCSV(){ const a=el('a',{href:'/api/export/projects.csv'}); document.body.append(a); a.click(); a.remove(); toast('Projects CSV downloading…'); }

/* =========================================================
   CHANGE LOG (Admin) — every write, attributed to a user
========================================================= */
function viewChangelog(){
  const bar=topbar('Admin','Change log');
  const body=el('div',{});
  async function load(more){
    if(CLOG.loading)return; CLOG.loading=true;
    try{
      const params=new URLSearchParams({limit:'100'});
      if(more&&CLOG.rows.length)params.set('before',CLOG.rows[CLOG.rows.length-1].ts);
      if(CLOG.user)params.set('user',CLOG.user);
      if(CLOG.prop)params.set('property',CLOG.prop);
      const rows=await API.get('/changelog?'+params.toString());
      CLOG.rows=more?CLOG.rows.concat(rows):rows;
      CLOG.done=rows.length<100;
    }catch(e){ CLOG.done=true; toast('Could not load the change log: '+e.message); }
    CLOG.loading=false; render();
  }
  if(!CLOG.rows.length&&!CLOG.done&&!CLOG.loading) load(false);

  const p=el('div',{class:'panel'});
  // filters
  const users=[...new Set(CLOG.rows.map(r=>r.username).filter(Boolean))].sort();
  const userSel=el('select',{class:'mini-sel',onchange:e=>{CLOG.user=e.target.value;CLOG.rows=[];CLOG.done=false;render();}},
    el('option',{value:''},'All users'), ...users.map(u=>el('option',{value:u,...(CLOG.user===u?{selected:true}:{})},u)));
  if(CLOG.user&&!users.includes(CLOG.user)) userSel.append(el('option',{value:CLOG.user,selected:true},CLOG.user));
  const propSel=el('select',{class:'mini-sel',onchange:e=>{CLOG.prop=e.target.value;CLOG.rows=[];CLOG.done=false;render();}},
    el('option',{value:''},'All properties'), ...S.properties.map(pr=>el('option',{value:pr.code,...(CLOG.prop===pr.code?{selected:true}:{})},pr.code)));
  const refresh=el('button',{class:'btn ghost sm',onclick:()=>{CLOG.rows=[];CLOG.done=false;render();}},'↻ Refresh');
  p.append(el('div',{class:'ph'}, el('h3',{},'Recent changes'), el('div',{class:'sp'}), userSel, propSel, refresh));

  const pad=el('div',{class:'pad'});
  if(CLOG.loading&&!CLOG.rows.length) pad.append(el('div',{style:'color:var(--ink-3);font-size:13px'},'Loading…'));
  else if(!CLOG.rows.length) pad.append(el('div',{class:'empty'},'No changes recorded yet — the log starts with the next edit.'));
  else{
    const t=el('table',{class:'tbl'});
    t.append(el('thead',{},tr(th('When'),th('Who'),th('Property'),th('What changed'))));
    const tb=el('tbody');
    CLOG.rows.forEach(r=>{
      const dt=r.ts?new Date(r.ts):null;
      tb.append(tr(
        td(el('span',{class:'mono',style:'font-size:12px;white-space:nowrap'},dt?dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' '+dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'—')),
        td(el('span',{style:'font-weight:600'},r.username||'—')),
        td(r.property?propChip(r.property):'—'),
        td(el('span',{style:'font-size:13px'},r.summary||r.action))));
    });
    t.append(tb);
    pad.append(el('div',{style:'overflow:auto'},t));
    if(!CLOG.done) pad.append(el('div',{style:'margin-top:12px'},
      el('button',{class:'btn',onclick:()=>load(true)},CLOG.loading?'Loading…':'Load more')));
  }
  p.append(pad); body.append(p);
  return {bar,body};
}

/* =========================================================
   SETTINGS (Admin) — app title, regions, properties
========================================================= */
function viewSettings(){
  const bar=topbar('Admin','Settings');
  const body=el('div',{class:'grid'});
  const inpStyle='width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)';

  /* --- app title --- */
  const tp=el('div',{class:'panel'});
  tp.append(el('div',{class:'ph'}, el('h3',{},'App title')));
  const tpad=el('div',{class:'pad'});
  const titleI=el('input',{value:S.meta.appTitle||'',placeholder:'Monarch SP Tracker',style:inpStyle});
  tpad.append(el('p',{style:'margin-top:0;color:var(--ink-3);font-size:13px'},'Shown in the sidebar, the browser tab and the login screen.'));
  tpad.append(el('div',{style:'display:flex;gap:8px'}, titleI,
    el('button',{class:'btn accent',onclick:async()=>{ try{ await API.send('PATCH','/meta',{appTitle:titleI.value}); await afterWrite('Title updated'); }catch(e){ toast('Failed: '+e.message); } }},'Save')));
  tp.append(tpad); body.append(tp);

  /* --- regions --- */
  const rp=el('div',{class:'panel'});
  rp.append(el('div',{class:'ph'}, el('h3',{},'Regions'), el('div',{class:'sp'}), el('span',{class:'chip'},String((S.regions||[]).length))));
  const rpad=el('div',{class:'pad'});
  const regs=(S.regions||[]).slice();
  regs.forEach((r,i)=>{
    const row=el('div',{style:'display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)'});
    const nProps=S.properties.filter(p=>p.region===r.name).length;
    row.append(
      el('span',{style:'flex:1;font-weight:600'},r.name),
      el('span',{class:'chip'},`${nProps} propert${nProps===1?'y':'ies'}`),
      el('button',{class:'btn ghost sm',title:'Move up',disabled:i===0?'':null,onclick:async()=>{ if(i===0)return;
        try{ await API.send('PATCH','/regions/'+encodeURIComponent(r.name),{sort:regs[i-1].sort});
             await API.send('PATCH','/regions/'+encodeURIComponent(regs[i-1].name),{sort:r.sort});
             await afterWrite('Region order updated'); }catch(e){ toast('Failed: '+e.message); } }},'↑'),
      el('button',{class:'btn ghost sm',title:'Move down',disabled:i===regs.length-1?'':null,onclick:async()=>{ if(i===regs.length-1)return;
        try{ await API.send('PATCH','/regions/'+encodeURIComponent(r.name),{sort:regs[i+1].sort});
             await API.send('PATCH','/regions/'+encodeURIComponent(regs[i+1].name),{sort:r.sort});
             await afterWrite('Region order updated'); }catch(e){ toast('Failed: '+e.message); } }},'↓'),
      el('button',{class:'btn ghost sm',title:'Rename',onclick:async()=>{ const n=prompt('Rename region "'+r.name+'" to:',r.name); if(!n||n.trim()===r.name)return;
        try{ await API.send('PATCH','/regions/'+encodeURIComponent(r.name),{name:n.trim()}); await afterWrite('Region renamed'); }catch(e){ toast('Failed: '+e.message); } }},'✎'),
      el('button',{class:'btn ghost sm',title:'Delete',onclick:async()=>{ if(!confirm('Delete region "'+r.name+'"? Only possible when it has no properties.'))return;
        try{ await API.send('DELETE','/regions/'+encodeURIComponent(r.name)); await afterWrite('Region deleted'); }catch(e){ toast(e.message); } }},'🗑'));
    rpad.append(row);
  });
  const newRegI=el('input',{placeholder:'New region name…',style:inpStyle+';flex:1'});
  rpad.append(el('div',{style:'display:flex;gap:8px;margin-top:12px'}, newRegI,
    el('button',{class:'btn accent',onclick:async()=>{ const n=newRegI.value.trim(); if(!n){toast('Enter a region name');return;}
      try{ await API.send('POST','/regions',{name:n}); await afterWrite('Region "'+n+'" added'); }catch(e){ toast('Failed: '+e.message); } }},'+ Add region')));
  rp.append(rpad); body.append(rp);

  /* --- properties --- */
  const pp=el('div',{class:'panel',style:'grid-column:1/-1'});
  pp.append(el('div',{class:'ph'}, el('h3',{},'Properties'), el('div',{class:'sp'}),
    el('button',{class:'btn accent sm',onclick:()=>openPropertyEditor(null)},'+ Add property')));
  const ppad=el('div',{class:'pad',style:'overflow:auto'});
  const t=el('table',{class:'tbl'});
  t.append(el('thead',{},tr(th(''),th('Code'),th('Name'),th('Region'),th('Manager'),th('Portfolio'),th('Units','r'),th('SP budget','r'),th(''))));
  const tb=el('tbody');
  const regOrder=regionNames();
  S.properties.slice().sort((a,b)=>(regOrder.indexOf(a.region)-regOrder.indexOf(b.region))||a.code.localeCompare(b.code)).forEach(pr=>{
    tb.append(tr(
      td(el('span',{style:`display:inline-block;width:12px;height:12px;border-radius:3px;background:${pcolor(pr.code)}`})),
      td(el('strong',{},pr.code)), td(pr.name), td(pr.region), td(pr.manager||'—'), td(pr.portfolio||'—'),
      tdn(pr.units||null), tdn(pr.spBudget,1),
      td(el('button',{class:'btn ghost sm',onclick:()=>openPropertyEditor(pr.code)},'Edit'))));
  });
  t.append(tb); ppad.append(t);
  ppad.append(el('p',{style:'color:var(--ink-3);font-size:12.5px;margin-bottom:0'},
    'Adding a property whose code already appeared in an imported GL or cushion file picks that data up automatically — nothing needs re-uploading.'));
  pp.append(ppad); body.append(pp);
  return {bar,body};
}

function openPropertyEditor(code){
  const pr=code?S.properties.find(p=>p.code===code):null;
  const inpStyle='width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)';
  const scrim=el('div',{class:'scrim modal-center',onclick:e=>{if(e.target===scrim)scrim.remove();}});
  const sheet=el('div',{class:'sheet'});
  const f={};
  const field=(label,key,val,attrs={})=>{ f[key]=el('input',{value:val==null?'':String(val),style:inpStyle,...attrs});
    return el('div',{style:'margin-bottom:10px'}, el('div',{style:'font-size:11.5px;color:var(--ink-3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em'},label), f[key]); };
  const regSel=el('select',{style:inpStyle});
  regionNames().forEach(r=>regSel.append(el('option',{value:r,...((pr?pr.region:'')===r?{selected:true}:{})},r)));
  f.region=regSel;
  const b=el('div',{class:'sb'});
  const grid2=(...kids)=>el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:0 14px'},...kids);
  b.append(
    grid2(field('Code (Yardi pcode)','code',pr?pr.code:'',pr?{disabled:''}:{placeholder:'e.g. ABCD'}),
          el('div',{style:'margin-bottom:10px'}, el('div',{style:'font-size:11.5px;color:var(--ink-3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em'},'Region'), regSel)),
    field('Property name','name',pr?pr.name:''),
    grid2(field('Manager','manager',pr?pr.manager:''),
          field('Portfolio (quarterly summary group)','portfolio',pr?pr.portfolio:'',{placeholder:'blank = own report card'})),
    grid2(field('Units','units',pr?pr.units:''),
          field('SP budget ($)','spBudget',pr?pr.spBudget:'')),
    grid2((()=>{ f.color=el('input',{type:'color',style:'width:100%;height:38px;padding:2px;border:1px solid var(--line);border-radius:8px;background:var(--panel)'});
        f.color.value=(pr&&pr.color&&/^#[0-9a-fA-F]{6}$/.test(pr.color))?pr.color:pcolor(pr?pr.code:'')||'#5e97cc';
        return el('div',{style:'margin-bottom:10px'}, el('div',{style:'font-size:11.5px;color:var(--ink-3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em'},'Color'), f.color); })(),
          field('Contract code (filenames)','contractCode',pr?pr.contractCode:'',{placeholder:'defaults to the property code'})),
    field('Owner entity (contracts)','ownerEntity',pr?pr.ownerEntity:''),
    field('Property address','address',pr?pr.address:''),
    field('Owner notice address','ownerNoticeAddr',pr?pr.ownerNoticeAddr:''));
  if(pr){
    b.append(el('div',{style:'margin-top:6px'},
      el('button',{class:'btn danger sm',onclick:async()=>{ if(!confirm(`Delete ${pr.code} — ${pr.name}? Blocked if it has projects, contracts or cash adjustments. Imported GL/cushion data is kept.`))return;
        try{ await API.send('DELETE','/properties/'+pr.code); scrim.remove(); await afterWrite('Property deleted'); }catch(e){ toast(e.message); } }},'Delete property')));
  }
  const save=async()=>{
    const payload={ code:pr?pr.code:f.code.value, name:f.name.value, region:f.region.value, manager:f.manager.value,
      portfolio:f.portfolio.value, color:f.color.value, contractCode:f.contractCode.value, ownerEntity:f.ownerEntity.value,
      address:f.address.value, ownerNoticeAddr:f.ownerNoticeAddr.value, units:f.units.value, spBudget:f.spBudget.value };
    try{
      if(pr) await API.send('PATCH','/properties/'+pr.code,payload);
      else{
        const r=await API.send('POST','/properties',payload);
        if(r.existingGlLines) toast(`${r.existingGlLines} previously imported GL lines are now visible for ${r.code}`);
      }
      scrim.remove(); await afterWrite(pr?'Property updated':'Property added');
    }catch(e){ toast('Save failed: '+e.message); }
  };
  const head=el('div',{class:'sh'}, el('h2',{style:'font-size:16px;flex:1'},pr?`Edit ${pr.code} — ${pr.name}`:'Add property'),
    el('button',{class:'btn ghost',onclick:()=>scrim.remove()},'Cancel'),
    el('button',{class:'btn accent',onclick:save},pr?'Save changes':'Add property'));
  sheet.append(head,b); scrim.append(sheet); document.body.append(scrim);
}

/* ---------- tiny table builders ---------- */
function tr(...kids){return el('tr',{},...kids);}
function th(t,cls){return el('th',{class:cls==='r'?'r':''},t);}
function td(c,cls){return el('td',{class:cls==='r'?'r':''},c&&c.nodeType?c:document.createTextNode(c==null?'':c));}
function tdn(n,money){return el('td',{class:'num r'},money?fmt(n):(n==null?'—':String(n)));}

/* ---------- toast ---------- */
let _toastT;function toast(msg){let t=$('.toast');if(t)t.remove();t=el('div',{class:'toast'},msg);document.body.append(t);clearTimeout(_toastT);_toastT=setTimeout(()=>t.remove(),2400);}

/* ---------- Contractor directory ---------- */
function viewDirectory(){
  const bar=topbar('Directory','Contractor Directory');
  const body=el('div',{class:'panel pad',style:'max-width:900px'});

  // Import banner
  const importRow=el('div',{style:'display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;border:2px dashed var(--line-2);border-radius:6px;padding:10px;transition:background .15s'});
  const importBtn=el('button',{class:'btn accent sm',onclick:()=>xlsxInput.click()},'⬆ Import from Excel');
  importRow.append(importBtn,
    el('span',{style:'font-size:12px;color:var(--ink-3)'},'Import Vendor Directory Excel or drop it here. Existing names are updated, not duplicated.'));
  const xlsxInput=addDrop(importRow,'.xlsx,.xls',async file=>{
    importBtn.disabled=true; importBtn.textContent='Importing…';
    const fd=new FormData(); fd.append('file',file);
    try{
      const r=await fetch('/api/contractors/import',{method:'POST',body:fd});
      const j=await r.json();
      if(!r.ok){toast(j.error||'Import failed');return;}
      await afterWrite(`Imported ${j.count} contractors`);
    }catch(e){toast('Import failed: '+e.message);}
    finally{importBtn.disabled=false;importBtn.textContent='⬆ Import from Excel';}
  });
  body.append(importRow);

  // Add single contractor
  const addRow=el('div',{style:'display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap'});
  const nameInp=el('input',{placeholder:'Contractor name',style:'flex:2;min-width:160px'});
  const addrInp=el('input',{placeholder:'Address',style:'flex:3;min-width:160px'});
  const phoneInp=el('input',{placeholder:'Phone',style:'flex:1;min-width:100px'});
  const addBtn=el('button',{class:'btn sm',onclick:async()=>{
    const name=nameInp.value.trim();
    if(!name){toast('Name is required');return;}
    addBtn.disabled=true;
    try{
      const r=await fetch('/api/contractors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,address:addrInp.value.trim(),phone:phoneInp.value.trim()})});
      if(!r.ok){const j=await r.json().catch(()=>({}));toast(j.error||'Failed');return;}
      nameInp.value=''; addrInp.value=''; phoneInp.value='';
      await afterWrite('Contractor added');
    }catch(e){toast('Failed: '+e.message);}
    finally{addBtn.disabled=false;}
  }},'Add');
  addRow.append(nameInp,addrInp,phoneInp,addBtn);
  body.append(el('div',{style:'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);margin-bottom:6px'},'Add contractor'),addRow);

  // Contractor table
  const ctrs=S.contractors||[];
  if(!ctrs.length){
    body.append(el('div',{class:'empty'},el('div',{class:'big'},'No contractors yet'),'Import the Vendor Directory Excel or add one above.'));
  } else {
    const tbl=el('table',{class:'tbl',style:'width:100%'});
    tbl.append(el('thead',{},tr(th('Name'),th('Address'),th('Phone'),th(''))));
    const tbody=el('tbody');
    ctrs.forEach(c=>{
      const row=tr(
        td(c.name),
        td(c.address||'—'),
        td(c.phone||'—'),
        el('td',{class:'r'},el('button',{class:'btn ghost sm',onclick:async()=>{
          if(!confirm(`Remove "${c.name}" from the directory?`))return;
          await fetch('/api/contractors/'+c.id,{method:'DELETE'});
          await afterWrite('Contractor removed');
        }},'Remove'))
      );
      tbody.append(row);
    });
    tbl.append(tbody);
    body.append(el('div',{style:'overflow-x:auto'},tbl));
  }

  return {bar,body};
}

start();
