import * as XLSX from 'xlsx';
import { PROPERTIES, uid, type GLLine, type CashSnapshot } from '../shared/domain.js';

const KNOWN_CODES = PROPERTIES.map((p) => p.code);

/* ---------- Yardi SP general-ledger import (spec §8.1, ports handleGL) ---------- */
export interface GLParseResult {
  tx: GLLine[];
  period: string | null;
  byProperty: Record<string, number>;
}
export function parseGL(buffer: Buffer): GLParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });

  let acct: string | null = null, cat: string | null = null, period: string | null = null;
  const tx: GLLine[] = [];

  rows.forEach((r) => {
    const a = (r[0] == null ? '' : String(r[0])).trim();
    if (/Period\s*=/.test(String(r[0]) || '')) period = String(r[0]).replace(/Period\s*=/, '').trim();
    if (/^\d{4}$/.test(a)) { acct = a; cat = (r[4] ? String(r[4]) : '').replace(/^SP\s*/i, '').trim() || a; return; }
    if (/^[a-zA-Z]{4}$/.test(a)) {
      const code = a.toLowerCase() === 'tpndc' ? 'TPND' : a.toUpperCase();
      if (!KNOWN_CODES.includes(code)) return; // ignore unknown property codes
      const debit = parseFloat(String(r[7] || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const credit = parseFloat(String(r[8] || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const net = debit - credit;
      if (!net && !debit && !credit) return;
      let date: any = r[2];
      if (date instanceof Date) date = date.toISOString().slice(0, 10);
      else date = String(date || '').slice(0, 10);
      tx.push({
        id: uid('G'), property: code, account: acct || undefined, category: cat || 'GENERAL', date,
        vendor: String(r[4] || '').slice(0, 80), control: String(r[5] || ''),
        amount: Math.round(net * 100) / 100, remarks: String(r[10] || '').slice(0, 120), linkedProjectId: null,
      });
    }
  });

  const byProperty: Record<string, number> = {};
  tx.forEach((t) => { byProperty[t.property] = (byProperty[t.property] || 0) + t.amount; });
  return { tx, period, byProperty };
}

/* ---------- Cash-cushion import (spec §8.2, ports handleCushion) ---------- */
export interface CushionParseResult {
  found: Record<string, CashSnapshot>;
  asOf: string;
}
export function parseCushion(buffer: Buffer, fallbackAsOf: string): CushionParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });

  let hr = -1;
  const hcols: Record<string, number> = {};
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const idx = rows[i].findIndex((c) => String(c).trim().toLowerCase() === 'pcode');
    if (idx >= 0) { hr = i; rows[i].forEach((c, j) => { if (c != null) hcols[String(c).trim().toLowerCase()] = j; }); break; }
  }
  if (hr < 0) throw new Error('Could not find the Pcode column — is this a cushion report?');

  const find = (...names: string[]): number => {
    for (const n of names) { for (const k in hcols) { if (k.includes(n)) return hcols[k]; } }
    return -1;
  };
  const col = {
    pcode: hcols['pcode'], units: find('units'), cash: find('cash and cash', 'cash and cashlike'),
    spBudget: find('2026 starting sp', 'starting sp budget'), spSpent: find('sp spent 2026', 'sp spent'),
    spRemaining: find('2026 sp remaining', 'sp remaining'), adjCash: find('adjusted cash 06/30', 'adjusted cash'),
    noi: hcols['noi'], ds: hcols['ds'], dcr: hcols['dcr'], marketValue: find('new market value', 'market value'),
    loanAmount: find('loan amount'), ltv: hcols['ltv'], loanDue: find('loan due'), loanRate: find('loan rate'),
    ioEnd: find('interst only end', 'interest only end'),
    capital: find('capital'), returnEarned: find('earnings before sp'),
  };

  // "return sent" = the most recent COMPLETED quarter's distribution % (e.g. "QT 1 2026 Distribution %").
  let returnSentCol = -1, sentRank = -1;
  for (const k in hcols) {
    const m = k.match(/qt\s*([1-4]).*(20\d\d).*distribution/);
    if (m) { const rank = (+m[2]) * 4 + (+m[1]); if (rank > sentRank) { sentRank = rank; returnSentCol = hcols[k]; } }
  }

  let asOf = fallbackAsOf;
  for (const k in hcols) { const m = k.match(/(\d{1,2}\/\d{1,2}\/\d{4})/); if (k.includes('cash and cash') && m) { asOf = m[1]; break; } }

  const known = new Set(KNOWN_CODES.map((c) => c.toLowerCase()));
  const num = (r: any[], c: number): number | null => {
    if (c < 0) return null; const v = r[c]; if (v == null || v === '') return null;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n;
  };
  const str = (r: any[], c: number): string => (c < 0 ? '' : String(r[c] == null ? '' : r[c]).trim());

  const found: Record<string, CashSnapshot & { units?: number | null }> = {};
  for (let i = hr + 1; i < rows.length; i++) {
    const pc = str(rows[i], col.pcode).toLowerCase();
    if (known.has(pc)) {
      const r = rows[i]; const code = pc.toUpperCase();
      found[code] = {
        asOfDate: asOf, cash: num(r, col.cash), adjCash: num(r, col.adjCash), spBudget: num(r, col.spBudget),
        spSpent: num(r, col.spSpent), spRemaining: num(r, col.spRemaining), noi: num(r, col.noi), ds: num(r, col.ds),
        dcr: num(r, col.dcr), marketValue: num(r, col.marketValue), loanAmount: num(r, col.loanAmount), ltv: num(r, col.ltv),
        loanDue: str(r, col.loanDue), loanRate: num(r, col.loanRate), ioEnd: str(r, col.ioEnd),
        capital: num(r, col.capital), returnEarned: num(r, col.returnEarned), returnSent: num(r, returnSentCol),
        units: num(r, col.units),
      };
    }
  }
  if (!Object.keys(found).length) throw new Error('No matching ND properties found in the report.');
  return { found, asOf };
}
