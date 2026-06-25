import * as XLSX from 'xlsx';
import { readFileSync } from 'node:fs';
const wb = XLSX.read(readFileSync(process.argv[2]), { type: 'buffer', cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
const cats = new Set();
let acct = null, cat = null;
const hits = [];
rows.forEach((r) => {
  const a = (r[0] == null ? '' : String(r[0])).trim();
  if (/^\d{4}$/.test(a)) { acct = a; cat = (r[4] ? String(r[4]) : '').trim(); cats.add(`${a}  ${cat}`); }
  const joined = (r || []).map(c => c == null ? '' : String(c)).join(' ').toLowerCase();
  if (/interest|income|sweep|earnings/.test(joined)) hits.push((r || []).map(c => c == null ? '' : String(c).slice(0, 26)).filter(Boolean).join(' | '));
});
console.log('=== ACCOUNT / CATEGORY headers ===');
[...cats].sort().forEach(c => console.log(c));
console.log('\n=== rows mentioning interest/income/sweep/earnings (first 25) ===');
hits.slice(0, 25).forEach(h => console.log(h));
