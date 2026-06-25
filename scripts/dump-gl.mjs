import * as XLSX from 'xlsx';
import { readFileSync } from 'node:fs';
const wb = XLSX.read(readFileSync(process.argv[2]), { type: 'buffer', cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
let acct = null, cat = null;
for (const r of rows) {
  const a = (r[0] == null ? '' : String(r[0])).trim();
  if (/^\d{4}$/.test(a)) { acct = a; cat = (r[4] ? String(r[4]) : '').trim(); console.log(`\n## ${acct} ${cat}`); continue; }
  if (/^[a-zA-Z]{4,5}$/.test(a)) {
    const debit = parseFloat(String(r[7] || '0').replace(/[^0-9.\-]/g, '')) || 0;
    const credit = parseFloat(String(r[8] || '0').replace(/[^0-9.\-]/g, '')) || 0;
    const net = debit - credit;
    console.log(`${a} | ${String(r[2]||'').slice(0,10)} | vend="${String(r[4]||'').slice(0,30)}" | ctrl=${String(r[5]||'')} | net=${net} | rem="${String(r[10]||'').slice(0,40)}"`);
  }
}
