import * as XLSX from 'xlsx';
import {
  type AppState, type Project, type Property,
  PLAN_POST, onPlan, planTotal, shareFor, involvesProp, isSplit, allocsOf,
  planHorizonEnd, planYearCols, isAboveLine, phase, phaseMeta,
  autoPlanAmount, autoPlanYear, effPlanFor, effPlanTotal, inPlan,
} from '../shared/domain.js';

/* =============================================================================
   Long-range plan workbook (TRMO Fannie Inspection Tracker layout, 028).

   Show-your-work structure (org policy): the "Raw Data" sheet holds every
   project's FULL plan amounts as plain values; each property sheet's year cells
   are FORMULAS = Raw Data amount × that property's share, and every total is a
   SUM over visible cells. Formula cells also carry a computed cached value so
   the file previews correctly before Excel recalculates.
   ============================================================================= */

type Cell = XLSX.CellObject;
const MONEY = '$#,##0';
const round2 = (n: number) => Math.round(n * 100) / 100;
const A = (r: number, c: number) => XLSX.utils.encode_cell({ r, c });

function setCell(ws: XLSX.WorkSheet, r: number, c: number, cell: Cell): void {
  ws[A(r, c)] = cell;
  const ref = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { r, c }, e: { r, c } };
  ref.s.r = Math.min(ref.s.r, r); ref.s.c = Math.min(ref.s.c, c);
  ref.e.r = Math.max(ref.e.r, r); ref.e.c = Math.max(ref.e.c, c);
  ws['!ref'] = XLSX.utils.encode_range(ref as XLSX.Range);
}
const txt = (v: any): Cell => ({ t: 's', v: v == null ? '' : String(v) });
const num = (v: number, z?: string): Cell => ({ t: 'n', v, ...(z ? { z } : {}) });
const fml = (f: string, v: number, z?: string): Cell => ({ t: 'n', f, v, ...(z ? { z } : {}) });

const statusOf = (p: Project): string => phaseMeta(phase(p))?.label || '';
const bidsOf = (p: Project): string =>
  (p.bids || [])
    .filter((b) => b.contractor || b.amount != null)
    .map((b) => b.amount != null ? `${b.contractor || '?'} — $${Number(b.amount).toLocaleString('en-US')}` : (b.contractor || ''))
    .join(' · ');
const attCount = (p: Project): number =>
  (p.progressNotes || []).reduce((a, n) => a + ((n.files || []).length), 0);
const contractCell = (p: Project): string =>
  p.steps?.signed ? 'Yes' : p.noContract ? 'N/A' : p.steps?.contractGenerated ? 'Sent' : '';
const yearLabel = (key: string, nowYear: number): string => {
  if (key === PLAN_POST) return 'Post-Refi';
  const n = +key - nowYear + 1;
  return n >= 1 ? `${key} (Yr ${n})` : key;
};

/** A property's plan rows: explicitly scheduled, the auto layer (this year's
    open pipeline flowing into the current year by default), and what's left
    out of the plan entirely (on hold / no cost). */
function rowsFor(state: AppState, code: string): { scheduled: Project[]; auto: Project[]; notIn: Project[] } {
  const projs = state.projects.filter((p) => involvesProp(p, code) && !isAboveLine(p));
  const scheduled = projs.filter(onPlan).sort((a, b) => planTotal(b) - planTotal(a));
  const auto = projs.filter((p) => inPlan(p) && !onPlan(p)).sort((a, b) => autoPlanAmount(b) - autoPlanAmount(a));
  const notIn = projs.filter((p) => !inPlan(p) && phase(p) !== 'done')
    .sort((a, b) => (Number(b.anticipatedCost) || 0) - (Number(a.anticipatedCost) || 0));
  return { scheduled, auto, notIn };
}

export function buildPlanWorkbook(state: AppState, codes: string[], now: Date): Buffer {
  const wb: XLSX.WorkBook = { SheetNames: [], Sheets: {} };
  const nowYear = now.getFullYear();
  const props = new Map<string, Property>(state.properties.map((p) => [p.code, p]));
  const perProp = new Map(codes.map((code) => [code, rowsFor(state, code)]));
  const endOf = (code: string) => planHorizonEnd(props.get(code), state.cash[code], nowYear);

  // Union year columns across the whole workbook — Raw Data and Summary share them.
  const maxEnd = Math.max(...codes.map(endOf));
  const allProjs = [...new Map(codes.flatMap((c) => { const r = perProp.get(c)!; return [...r.scheduled, ...r.auto, ...r.notIn]; }).map((p) => [p.id, p])).values()];
  const unionYears = planYearCols(allProjs, maxEnd, nowYear);
  const unionKeys = [...unionYears, PLAN_POST];

  /* ---------- Raw Data sheet (values only, FULL project amounts) ---------- */
  const raw: XLSX.WorkSheet = {};
  const RAW_META = ['Lead property', 'Split shares', 'Project ID', 'Project', 'Category', 'Lender flag', 'Kind', 'Plan source', 'In-house / Contractor', 'Contractor', 'Next steps', 'Status', 'Anticipated cost', 'Actual cost'];
  const RAW_Y0 = RAW_META.length;                       // first year column
  setCell(raw, 0, 0, txt('RAW DATA — full project amounts (not share-weighted). Property sheets multiply these by each property’s share, so a split project’s slices are reviewable. "auto" rows have no explicit schedule: their projected spend (actual, else anticipated cost) flows into the planned-end year (current year at earliest) by default.'));
  RAW_META.forEach((h, i) => setCell(raw, 2, i, txt(h)));
  unionKeys.forEach((k, i) => setCell(raw, 2, RAW_Y0 + i, txt(yearLabel(k, nowYear))));
  const RAW_ANT = RAW_META.indexOf('Anticipated cost'), RAW_ACT = RAW_META.indexOf('Actual cost');
  const rawRowOf = new Map<string, number>();           // project id → 0-based sheet row
  allProjs.forEach((p, i) => {
    const r = 3 + i;
    rawRowOf.set(p.id, r);
    const splitStr = isSplit(p) ? allocsOf(p).map((a) => `${a.property} ${a.pct}%`).join(' / ') : '';
    setCell(raw, r, 0, txt(p.property));
    setCell(raw, r, 1, txt(splitStr));
    setCell(raw, r, 2, txt(p.id));
    setCell(raw, r, 3, txt(p.name));
    setCell(raw, r, 4, txt(p.category));
    setCell(raw, r, 5, txt(p.lenderFlag || ''));
    setCell(raw, r, 6, txt(p.planKind === 'recurring' ? 'Recurring' : p.planKind === 'completion' ? 'To completion' : ''));
    setCell(raw, r, 7, txt(onPlan(p) ? 'plan' : autoPlanAmount(p) > 0 ? `auto → ${autoPlanYear(p, nowYear)}` : ''));
    setCell(raw, r, 8, txt(p.inHouse ? 'In-house' : 'Contractor'));
    setCell(raw, r, 9, txt(p.contractor || ''));
    setCell(raw, r, 10, txt(p.actionItem || ''));
    setCell(raw, r, 11, txt(statusOf(p)));
    if (p.anticipatedCost != null) setCell(raw, r, RAW_ANT, num(Number(p.anticipatedCost), MONEY));
    if (p.actualCost != null) setCell(raw, r, RAW_ACT, num(Number(p.actualCost), MONEY));
    // Effective amounts: explicit years as typed; auto rows land in the current year.
    unionKeys.forEach((k, i2) => { const v = effPlanFor(p, k, nowYear); if (v > 0) setCell(raw, r, RAW_Y0 + i2, num(v, MONEY)); });
  });
  raw['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 46 }, { wch: 20 }, { wch: 10 }, { wch: 13 }, { wch: 13 }, { wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, ...unionKeys.map(() => ({ wch: 12 }))];

  /* ---------- one sheet per property ---------- */
  // Property-sheet column layout (0-based).
  const PC = { desc: 0, lender: 1, who: 2, kind: 3, cat: 4, status: 5, ctr: 6, next: 7, bids: 8, share: 9, y0: 10 } as const;
  // Where each property's totals live, for the Summary sheet: yearKey → cell addr.
  const totCellOf = new Map<string, { sheet: string; byKey: Map<string, string>; planTotal: string; unschedEst: string | null }>();

  for (const code of codes) {
    const prop = props.get(code)!;
    const { scheduled, auto, notIn } = perProp.get(code)!;
    const gridRows = [...scheduled, ...auto];
    const endYear = endOf(code);
    const yearKeys = [...planYearCols(gridRows, endYear, nowYear), PLAN_POST];
    const nAfterYears = ['Plan Total', 'Est. Cost', 'Actual Cost', 'Est. Completion', 'Contract signed?', 'Photos/att.'];
    const cTotal = PC.y0 + yearKeys.length;             // Plan Total column
    const cEst = cTotal + 1, cAct = cTotal + 2, cEnd = cTotal + 3, cSig = cTotal + 4, cPho = cTotal + 5;

    const ws: XLSX.WorkSheet = {};
    const loanDue = state.cash[code]?.loanDue || '';
    setCell(ws, 0, 0, txt(`${code} — ${prop.name} — LONG-RANGE SP PLAN`));
    setCell(ws, 1, 0, txt(`Loan due: ${loanDue || 'n/a'}${prop.planEndYear ? ` · horizon override: ${prop.planEndYear}` : ''} · Plan through ${endYear} + Post-Refi · Generated ${now.toLocaleDateString('en-US')} · Amounts are ${code}’s share of shared projects`));
    const HEAD = 3;
    ['Description', 'Lender', 'In-house / Contractor', 'To Completion / Recurring', 'Category', 'Status', 'Contractor', 'Next steps', 'Bids', 'Share %'].forEach((h, i) => setCell(ws, HEAD, i, txt(h)));
    yearKeys.forEach((k, i) => setCell(ws, HEAD, PC.y0 + i, txt(yearLabel(k, nowYear))));
    nAfterYears.forEach((h, i) => setCell(ws, HEAD, cTotal + i, txt(h)));

    const first = HEAD + 1;
    gridRows.forEach((p, i) => {
      const r = first + i;
      const rr = rawRowOf.get(p.id)!;
      const isAuto = !onPlan(p);
      const share = shareFor(p, code);
      const shareAddr = `$${XLSX.utils.encode_col(PC.share)}${r + 1}`;
      setCell(ws, r, PC.desc, txt(p.name + (isSplit(p) ? '  ⇄' : '')));
      setCell(ws, r, PC.lender, txt(p.lenderFlag || ''));
      setCell(ws, r, PC.who, txt(p.inHouse ? 'In-house' : 'Contractor'));
      setCell(ws, r, PC.kind, txt(isAuto ? `Auto → ${autoPlanYear(p, nowYear)}` : p.planKind === 'recurring' ? 'Recurring' : 'Completion'));
      setCell(ws, r, PC.cat, txt(p.category));
      setCell(ws, r, PC.status, txt(statusOf(p)));
      setCell(ws, r, PC.ctr, txt(p.contractor || ''));
      setCell(ws, r, PC.next, txt(p.actionItem || ''));
      setCell(ws, r, PC.bids, txt(bidsOf(p)));
      setCell(ws, r, PC.share, num(share, '0%'));
      yearKeys.forEach((k, i2) => {
        const full = effPlanFor(p, k, nowYear);
        if (full <= 0) return;
        const rawAddr = `'Raw Data'!${A(rr, RAW_Y0 + unionKeys.indexOf(k))}`;
        setCell(ws, r, PC.y0 + i2, fml(`${rawAddr}*${shareAddr}`, round2(full * share), MONEY));
      });
      const y0Addr = A(r, PC.y0), yNAddr = A(r, PC.y0 + yearKeys.length - 1);
      setCell(ws, r, cTotal, fml(`SUM(${y0Addr}:${yNAddr})`, round2(effPlanTotal(p, nowYear) * share), MONEY));
      if (p.anticipatedCost != null) setCell(ws, r, cEst, fml(`'Raw Data'!${A(rr, RAW_ANT)}*${shareAddr}`, round2(Number(p.anticipatedCost) * share), MONEY));
      if (p.actualCost != null) setCell(ws, r, cAct, fml(`'Raw Data'!${A(rr, RAW_ACT)}*${shareAddr}`, round2(Number(p.actualCost) * share), MONEY));
      setCell(ws, r, cEnd, txt(p.plannedEnd || ''));
      setCell(ws, r, cSig, txt(contractCell(p)));
      const n = attCount(p); if (n) setCell(ws, r, cPho, num(n));
    });

    // TOTAL row (SUM formulas down each money column).
    const totR = first + gridRows.length;
    setCell(ws, totR, PC.desc, txt('TOTAL'));
    const byKey = new Map<string, string>();
    const sumCol = (c: number, cached: number) => gridRows.length
      ? fml(`SUM(${A(first, c)}:${A(totR - 1, c)})`, round2(cached), MONEY)
      : num(0, MONEY);
    yearKeys.forEach((k, i2) => {
      const cached = gridRows.reduce((a, p) => a + effPlanFor(p, k, nowYear) * shareFor(p, code), 0);
      setCell(ws, totR, PC.y0 + i2, sumCol(PC.y0 + i2, cached));
      byKey.set(k, A(totR, PC.y0 + i2));
    });
    setCell(ws, totR, cTotal, sumCol(cTotal, gridRows.reduce((a, p) => a + effPlanTotal(p, nowYear) * shareFor(p, code), 0)));
    setCell(ws, totR, cEst, sumCol(cEst, gridRows.reduce((a, p) => a + (Number(p.anticipatedCost) || 0) * shareFor(p, code), 0)));
    setCell(ws, totR, cAct, sumCol(cAct, gridRows.reduce((a, p) => a + (Number(p.actualCost) || 0) * shareFor(p, code), 0)));

    // Out of the plan entirely: on hold or no cost (open items with projected
    // spend flow into the current year automatically, so they're above).
    let unschedEstAddr: string | null = null;
    if (notIn.length) {
      const uHead = totR + 2;
      setCell(ws, uHead, PC.desc, txt('NOT IN PLAN — on hold / no cost assigned'));
      notIn.forEach((p, i) => {
        const r = uHead + 1 + i;
        const rr = rawRowOf.get(p.id)!;
        const share = shareFor(p, code);
        const shareAddr = `$${XLSX.utils.encode_col(PC.share)}${r + 1}`;
        setCell(ws, r, PC.desc, txt(p.name + (isSplit(p) ? '  ⇄' : '')));
        setCell(ws, r, PC.lender, txt(p.lenderFlag || ''));
        setCell(ws, r, PC.who, txt(p.inHouse ? 'In-house' : 'Contractor'));
        setCell(ws, r, PC.cat, txt(p.category));
        setCell(ws, r, PC.status, txt(statusOf(p)));
        setCell(ws, r, PC.ctr, txt(p.contractor || ''));
        setCell(ws, r, PC.next, txt(p.actionItem || ''));
        setCell(ws, r, PC.bids, txt(bidsOf(p)));
        setCell(ws, r, PC.share, num(share, '0%'));
        if (p.anticipatedCost != null) setCell(ws, r, cEst, fml(`'Raw Data'!${A(rr, RAW_ANT)}*${shareAddr}`, round2(Number(p.anticipatedCost) * share), MONEY));
      });
      const uTot = uHead + 1 + notIn.length;
      setCell(ws, uTot, PC.desc, txt('NOT-IN-PLAN TOTAL (est.)'));
      setCell(ws, uTot, cEst, fml(`SUM(${A(uHead + 1, cEst)}:${A(uTot - 1, cEst)})`,
        round2(notIn.reduce((a, p) => a + (Number(p.anticipatedCost) || 0) * shareFor(p, code), 0)), MONEY));
      unschedEstAddr = A(uTot, cEst);
    }

    ws['!cols'] = [{ wch: 46 }, { wch: 9 }, { wch: 17 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 34 }, { wch: 8 },
      ...yearKeys.map(() => ({ wch: 12 })), { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 9 }];
    XLSX.utils.book_append_sheet(wb, ws, code);
    totCellOf.set(code, { sheet: code, byKey, planTotal: A(totR, cTotal), unschedEst: unschedEstAddr });
  }

  /* ---------- Summary sheet (multi-property exports) ---------- */
  if (codes.length > 1) {
    const ws: XLSX.WorkSheet = {};
    setCell(ws, 0, 0, txt('LONG-RANGE SP PLAN — PORTFOLIO SUMMARY'));
    setCell(ws, 1, 0, txt(`Generated ${now.toLocaleDateString('en-US')} · every figure references its property sheet’s TOTAL row (share-weighted)`));
    const HEAD = 3, Y0 = 5;
    ['Region', 'Property', 'Name', 'Loan due', 'Plan through'].forEach((h, i) => setCell(ws, HEAD, i, txt(h)));
    unionKeys.forEach((k, i) => setCell(ws, HEAD, Y0 + i, txt(yearLabel(k, nowYear))));
    setCell(ws, HEAD, Y0 + unionKeys.length, txt('Plan Total'));
    setCell(ws, HEAD, Y0 + unionKeys.length + 1, txt('Not in plan (est.)'));
    codes.forEach((code, i) => {
      const r = HEAD + 1 + i;
      const prop = props.get(code)!;
      const t = totCellOf.get(code)!;
      const { scheduled, auto, notIn } = perProp.get(code)!;
      const gridRows = [...scheduled, ...auto];
      setCell(ws, r, 0, txt(prop.region || ''));
      setCell(ws, r, 1, txt(code));
      setCell(ws, r, 2, txt(prop.name));
      setCell(ws, r, 3, txt(state.cash[code]?.loanDue || ''));
      setCell(ws, r, 4, num(endOf(code), '0'));
      unionKeys.forEach((k, i2) => {
        const addr = t.byKey.get(k);
        if (!addr) return;
        const cached = gridRows.reduce((a, p) => a + effPlanFor(p, k, nowYear) * shareFor(p, code), 0);
        setCell(ws, r, Y0 + i2, fml(`'${code}'!${addr}`, round2(cached), MONEY));
      });
      setCell(ws, r, Y0 + unionKeys.length, fml(`'${code}'!${t.planTotal}`, round2(gridRows.reduce((a, p) => a + effPlanTotal(p, nowYear) * shareFor(p, code), 0)), MONEY));
      if (t.unschedEst) setCell(ws, r, Y0 + unionKeys.length + 1, fml(`'${code}'!${t.unschedEst}`, round2(notIn.reduce((a, p) => a + (Number(p.anticipatedCost) || 0) * shareFor(p, code), 0)), MONEY));
    });
    const totR = HEAD + 1 + codes.length;
    setCell(ws, totR, 0, txt('TOTAL'));
    for (let c = Y0; c <= Y0 + unionKeys.length + 1; c++) {
      let cached = 0;
      for (let r = HEAD + 1; r < totR; r++) { const cell = ws[A(r, c)] as Cell | undefined; if (cell && typeof cell.v === 'number') cached += cell.v; }
      setCell(ws, totR, c, fml(`SUM(${A(HEAD + 1, c)}:${A(totR - 1, c)})`, round2(cached), MONEY));
    }
    ws['!cols'] = [{ wch: 12 }, { wch: 9 }, { wch: 28 }, { wch: 12 }, { wch: 11 }, ...unionKeys.map(() => ({ wch: 12 })), { wch: 12 }, { wch: 14 }];
    // Summary goes first in the tab order.
    wb.SheetNames.unshift('Summary');
    wb.Sheets['Summary'] = ws;
  }

  XLSX.utils.book_append_sheet(wb, raw, 'Raw Data');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
