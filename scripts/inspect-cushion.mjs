import * as XLSX from 'xlsx';
const path = process.argv[2];
const wb = XLSX.read((await import('node:fs')).readFileSync(path), { type: 'buffer', cellDates: true });
console.log('SHEETS:', wb.SheetNames.join(', '));
for (const name of wb.SheetNames) {
  if (/^_xlnm|microsoft|^ReportDate$/.test(name)) continue;
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
  console.log(`\n===== ${name} (${rows.length} rows) =====`);
  // print first 6 non-empty rows
  let shown = 0;
  for (let i = 0; i < rows.length && shown < 8; i++) {
    const r = (rows[i] || []).map(c => (c == null ? '' : String(c).slice(0, 22)));
    if (r.join('').trim() === '') continue;
    console.log(i + ': ' + r.slice(0, 24).join(' | '));
    shown++;
  }
}
