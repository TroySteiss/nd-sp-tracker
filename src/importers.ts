import * as XLSX from 'xlsx';
import { uid, type GLLine, type CashSnapshot } from '../shared/domain.js';

/* Property codes come from the DB (passed in by the routes), not a static list.
   Rows for codes we don't track yet are KEPT — they surface automatically when
   the property is added later, so files never need re-uploading. */

// Words that can appear in the code column with amounts but are never pcodes.
const STOPWORDS = new Set(['total', 'totals', 'grand', 'net', 'gross', 'notes', 'budget', 'period', 'asset', 'assets', 'equity', 'income', 'cash', 'debit', 'credit', 'pcode', 'ledger', 'report']);

/** Normalize a raw token to a property code. Exact match to a known code wins;
    then a known-code prefix (Yardi alias, e.g. "tpndc" → TPND); else the
    uppercased token itself (unknown-but-kept). Returns null for non-codes. */
function normalizeCode(raw: string, knownCodes: string[]): string | null {
  const t = String(raw || '').trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!/^[a-z]{3,6}$/.test(t) || STOPWORDS.has(t)) return null;
  const up = t.toUpperCase();
  if (knownCodes.includes(up)) return up;
  const alias = knownCodes.find((k) => k.length >= 4 && up.startsWith(k));
  return alias || up;
}

/* ---------- Yardi SP general-ledger import (spec §8.1, ports handleGL) ---------- */
export interface GLParseResult {
  tx: GLLine[];
  period: string | null;
  byProperty: Record<string, number>;
  unknownCodes: string[];
}
export function parseGL(buffer: Buffer, knownCodes: string[]): GLParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });

  let acct: string | null = null, cat: string | null = null, period: string | null = null;
  const tx: GLLine[] = [];

  rows.forEach((r) => {
    const a = (r[0] == null ? '' : String(r[0])).trim();
    if (/Period\s*=/.test(String(r[0]) || '')) period = String(r[0]).replace(/Period\s*=/, '').trim();
    if (/^\d{4}$/.test(a)) { acct = a; cat = (r[4] ? String(r[4]) : '').replace(/^SP\s*/i, '').trim() || a; return; }
    if (/^[a-zA-Z]{4,6}$/.test(a)) {
      const code = normalizeCode(a, knownCodes);
      if (!code) return;
      const debit = parseFloat(String(r[7] || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const credit = parseFloat(String(r[8] || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const net = debit - credit;
      if (!net && !debit && !credit) return;
      let date: any = r[2];
      if (date instanceof Date) date = date.toISOString().slice(0, 10);
      else if (typeof date === 'number' && date > 20000 && date < 80000) {
        // Excel serial date (days since 1899-12-30)
        date = new Date(Math.round((date - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
      } else {
        // raw:false → formatted text; normalize M/D/YY[YY] here so it survives dnull
        const raw = String(date || '').trim();
        const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        date = m ? `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : raw.slice(0, 10);
      }
      tx.push({
        id: uid('G'), property: code, account: acct || undefined, category: cat || 'GENERAL', date,
        vendor: String(r[4] || '').slice(0, 80), control: String(r[5] || ''),
        amount: Math.round(net * 100) / 100, remarks: String(r[10] || '').slice(0, 120), linkedProjectId: null,
      });
    }
  });

  const byProperty: Record<string, number> = {};
  tx.forEach((t) => { byProperty[t.property] = (byProperty[t.property] || 0) + t.amount; });
  const unknownCodes = [...new Set(tx.map((t) => t.property).filter((c) => !knownCodes.includes(c)))].sort();
  return { tx, period, byProperty, unknownCodes };
}

/* ---------- Cash-cushion import (spec §8.2, ports handleCushion) ---------- */
export interface CushionParseResult {
  found: Record<string, CashSnapshot & { units?: number | null }>;
  asOf: string;
  unknownCodes: string[];
}
export function parseCushion(buffer: Buffer, fallbackAsOf: string, knownCodes: string[]): CushionParseResult {
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
    cashAfterDist: find('cash after distribution'), projectedDist: find('projected distribution'),
  };

  // Quarterly budgeted return % (e.g. "QT 3 2026  Budget %"). Needs an AND match (quarter + year + "budget"),
  // which `find` (OR) can't do; header may carry a duplicate — last one in the row wins via hcols.
  const findQtrBudget = (q: number): number => {
    for (const k in hcols) { if (k.includes(`qt ${q} `) && k.includes('2026') && k.includes('budget')) return hcols[k]; }
    return -1;
  };
  const budCols = { q1: findQtrBudget(1), q2: findQtrBudget(2), q3: findQtrBudget(3), q4: findQtrBudget(4) };

  // "return sent" = the most recent COMPLETED quarter's distribution % (e.g. "QT 1 2026 Distribution %").
  let returnSentCol = -1, sentRank = -1;
  for (const k in hcols) {
    const m = k.match(/qt\s*([1-4]).*(20\d\d).*distribution/);
    if (m) { const rank = (+m[2]) * 4 + (+m[1]); if (rank > sentRank) { sentRank = rank; returnSentCol = hcols[k]; } }
  }

  let asOf = fallbackAsOf;
  for (const k in hcols) { const m = k.match(/(\d{1,2}\/\d{1,2}\/\d{4})/); if (k.includes('cash and cash') && m) { asOf = m[1]; break; } }

  const num = (r: any[], c: number): number | null => {
    if (c < 0) return null; const v = r[c]; if (v == null || v === '') return null;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n;
  };
  const str = (r: any[], c: number): string => (c < 0 ? '' : String(r[c] == null ? '' : r[c]).trim());

  const found: Record<string, CashSnapshot & { units?: number | null }> = {};
  for (let i = hr + 1; i < rows.length; i++) {
    // Keep every row whose Pcode looks like a property code — including ones we
    // don't track yet (their snapshots are stored and surface when added).
    const code = normalizeCode(str(rows[i], col.pcode), knownCodes);
    if (code) {
      const r = rows[i];
      found[code] = {
        asOfDate: asOf, cash: num(r, col.cash), adjCash: num(r, col.adjCash), spBudget: num(r, col.spBudget),
        spSpent: num(r, col.spSpent), spRemaining: num(r, col.spRemaining), noi: num(r, col.noi), ds: num(r, col.ds),
        dcr: num(r, col.dcr), marketValue: num(r, col.marketValue), loanAmount: num(r, col.loanAmount), ltv: num(r, col.ltv),
        loanDue: str(r, col.loanDue), loanRate: num(r, col.loanRate), ioEnd: str(r, col.ioEnd),
        capital: num(r, col.capital), returnEarned: num(r, col.returnEarned), returnSent: num(r, returnSentCol),
        cashAfterDist: num(r, col.cashAfterDist), projectedDist: num(r, col.projectedDist),
        budgetRetQ1: num(r, budCols.q1), budgetRetQ2: num(r, budCols.q2), budgetRetQ3: num(r, budCols.q3), budgetRetQ4: num(r, budCols.q4),
        units: num(r, col.units),
      };
    }
  }
  if (!Object.keys(found).length) throw new Error('No property rows found in the report.');
  const unknownCodes = Object.keys(found).filter((c) => !knownCodes.includes(c)).sort();
  return { found, asOf, unknownCodes };
}
