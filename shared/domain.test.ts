import { describe, it, expect } from 'vitest';
import {
  Project, AppState, STEP_KEYS, APPROVED_IDX, OVER_THRESHOLD,
  phase, isComplete, projOutflow, stage, stepsDone, stepsTotal,
  advance, toggleStep, appKeys, isNA, applyCostRules,
  cashModel, auditModel, glMatchScore, glSpentFor, cashAdjFor,
  toneRemaining, toneProjected, toneCashPerDoor, yearsToMaturity, PROPERTIES, isAboveLine,
  allocsOf, isSplit, shareFor, involvesProp, projOutflowFor, projForProp,
  PLAN_POST, normalizePlanYears, onPlan, planFor, planTotal, planForProp, planTotalForProp,
  lenderFlagged, planHorizonEnd, planYearCols, isHexColor, hexToHsl, hslToHex, shadesOf, regionShadeMap,
  autoPlanAmount, autoPlanYear, effPlanFor, effPlanTotal, effPlanForProp, effPlanTotalForProp, inPlan,
} from './domain.js';

function proj(over: Partial<Project> = {}): Project {
  return { id: 'P1', property: 'CLND', category: 'GENERAL', name: 'Test', steps: {}, ...over };
}
function blankState(over: Partial<AppState> = {}): AppState {
  return { meta: {}, properties: [], cash: {}, cashAdjustments: [], gl: [], projects: [], ...over };
}

describe('constants', () => {
  it('approved is index 2; 10 steps; $5k threshold', () => {
    expect(APPROVED_IDX).toBe(2);
    expect(STEP_KEYS.length).toBe(10);
    expect(OVER_THRESHOLD).toBe(5000);
  });
});

describe('phase decision tree (spec §4.3)', () => {
  it('onHold wins over everything', () => {
    expect(phase(proj({ onHold: true, steps: { paid: true } }))).toBe('hold');
  });
  it('in-house: no target/done = note; done>=target = done; else active', () => {
    expect(phase(proj({ inHouse: true }))).toBe('note');
    expect(phase(proj({ inHouse: true, totalToComplete: 100, amountCompleted: 100 }))).toBe('done');
    expect(phase(proj({ inHouse: true, totalToComplete: 100, amountCompleted: 40 }))).toBe('active');
  });
  it('contractor: complete > paid > approved > note(no cost) > discussed', () => {
    expect(phase(proj({ steps: { completed: true } }))).toBe('done');
    expect(phase(proj({ steps: { paid: true } }))).toBe('paid');
    expect(phase(proj({ steps: { approved: true } }))).toBe('active');
    expect(phase(proj({ steps: {} }))).toBe('note');
    expect(phase(proj({ anticipatedCost: 1000, steps: {} }))).toBe('discussed');
  });
});

describe('advance & cascade (spec §5.2)', () => {
  it('advance ticks the next applicable step', () => {
    const p = proj();
    advance(p); // -> planned
    expect(p.steps!.planned).toBe(true);
    advance(p); // -> gotBids
    expect(p.steps!.gotBids).toBe(true);
  });
  it('advancing past approved fills all prior non-NA steps', () => {
    const p = proj({ steps: { planned: true, gotBids: true, approved: true } });
    advance(p); // -> contractGenerated (index 3 > APPROVED_IDX)
    expect(p.steps!.contractGenerated).toBe(true);
    // all prior should be true already
    STEP_KEYS.slice(0, 3).forEach(k => expect(p.steps![k]).toBe(true));
  });
  it('toggling ON a post-approval step cascades earlier steps true', () => {
    const p = proj();
    const idx = STEP_KEYS.indexOf('workStarted');
    toggleStep(p, idx);
    expect(p.steps!.workStarted).toBe(true);
    STEP_KEYS.slice(0, idx).forEach(k => expect(p.steps![k]).toBe(true));
  });
  it('turning OFF approved clears every later step', () => {
    const p = proj({ steps: {} });
    // build up to workCompleted
    toggleStep(p, STEP_KEYS.indexOf('workCompleted'));
    expect(p.steps!.approved).toBe(true);
    // now turn off approved
    toggleStep(p, APPROVED_IDX);
    expect(p.steps!.approved).toBe(false);
    expect(p.steps!.workCompleted).toBe(false);
    expect(p.steps!.workStarted).toBe(false);
  });
  it('no-contract excludes the contract steps from cascade and applicable count', () => {
    const p = proj({ noContract: true });
    expect(appKeys(p)).not.toContain('signed');
    expect(stepsTotal(p)).toBe(8);
    toggleStep(p, STEP_KEYS.indexOf('workStarted'));
    // contract steps stay false because they're N/A
    expect(p.steps!.signed).toBeFalsy();
    expect(p.steps!.contractGenerated).toBeFalsy();
    expect(p.steps!.planned).toBe(true);
    expect(isNA(p, 'signed')).toBe(true);
  });
});

describe('cost rules (spec §5.3/§5.4)', () => {
  it('entering a cost auto-ticks planned', () => {
    const p = proj({ anticipatedCost: 1200 });
    applyCostRules(p);
    expect(p.steps!.planned).toBe(true);
  });
  it('sub-$5k contractor work auto-defaults to no-contract', () => {
    const p = proj({ anticipatedCost: 1200 });
    applyCostRules(p);
    expect(p.noContract).toBe(true);
  });
  it('>=$5k does NOT auto-default no-contract', () => {
    const p = proj({ anticipatedCost: 9000 });
    applyCostRules(p);
    expect(p.noContract).toBe(false);
  });
  it('manual noContractSet stops the auto-default', () => {
    const p = proj({ anticipatedCost: 1200, noContractSet: true, noContract: false });
    applyCostRules(p);
    expect(p.noContract).toBe(false);
  });
  it('actualCost overrides anticipatedCost', () => {
    expect(projOutflow(proj({ anticipatedCost: 100, actualCost: 250 }))).toBe(250);
  });
});

describe('cashModel (spec §7.1)', () => {
  it('projects outstanding active work against snapshot+adjustments', () => {
    const st = blankState({
      cash: { CLND: { cash: 100000 } },
      cashAdjustments: [{ id: 'A1', property: 'CLND', date: '2026-06-01', amount: -5000 }],
      projects: [
        proj({ id: 'P1', steps: { approved: true }, anticipatedCost: 20000 }),   // active -> outstanding
        proj({ id: 'P2', steps: { paid: true }, anticipatedCost: 8000 }),         // paid
        proj({ id: 'P3', anticipatedCost: 3000, steps: {} }),                     // discussed
      ],
    });
    const m = cashModel(st, 'CLND');
    expect(m.cashToday).toBe(95000);
    expect(m.outstandingTotal).toBe(20000);
    expect(m.paidTotal).toBe(8000);
    expect(m.discussedTotal).toBe(3000);
    expect(m.projectedCash).toBe(75000);
  });
  it('in-house budget mode: done=paid, remaining=outstanding; quantity excluded', () => {
    const st = blankState({
      cash: { CLND: { cash: 50000 } },
      projects: [
        proj({ id: 'P1', inHouse: true, ihUnit: 'budget', totalToComplete: 10000, amountCompleted: 4000 }),
        proj({ id: 'P2', inHouse: true, ihUnit: 'quantity', totalToComplete: 50, amountCompleted: 10 }),
      ],
    });
    const m = cashModel(st, 'CLND');
    expect(m.paidTotal).toBe(4000);
    expect(m.outstandingTotal).toBe(6000);
    expect(m.projectedCash).toBe(44000);
  });
});

describe('auditModel (spec §7.2)', () => {
  it('flags >$5k unlinked GL and paid-without-GL', () => {
    const st = blankState({
      gl: [
        { id: 'G1', property: 'CLND', amount: 9000, category: 'HVAC' },          // unplanned (>5k, unlinked)
        { id: 'G2', property: 'CLND', amount: 2000, linkedProjectId: 'P1' },
      ],
      projects: [
        proj({ id: 'P1', steps: { paid: true } }),  // has GL backing
        proj({ id: 'P2', steps: { paid: true } }),  // paid but no GL
      ],
    });
    const a = auditModel(st, 'CLND');
    expect(a.glTotal).toBe(11000);
    expect(a.unplanned.map(g => g.id)).toEqual(['G1']);
    expect(a.paidNoGL.map(p => p.id)).toEqual(['P2']);
  });
});

describe('glMatchScore (spec §7.3)', () => {
  it('category + exact dollar + name overlap scores high', () => {
    const g = { id: 'G1', property: 'CLND', amount: 10000, category: 'HVAC', vendor: 'Kevins Plumbing', remarks: 'heaters' };
    const p = proj({ category: 'HVAC', anticipatedCost: 10000, name: 'Kevins heaters', contractor: 'Kevins Plumbing' });
    const { score, reasons } = glMatchScore(g, p);
    expect(reasons).toContain('category');
    expect(reasons).toContain('exact $');
    expect(score).toBeGreaterThan(80);
  });
});

describe('tile tones (spec §7.4)', () => {
  it('remaining tone', () => {
    expect(toneRemaining(-1, 100)).toBe('bad');
    expect(toneRemaining(10, 100)).toBe('warn');   // <15%
    expect(toneRemaining(50, 100)).toBe('good');
  });
  it('projected tone', () => {
    expect(toneProjected(-1, 100)).toBe('bad');
    expect(toneProjected(20, 100)).toBe('warn');   // <25%
    expect(toneProjected(50, 100)).toBe('good');
  });
  it('cash per door tone', () => {
    expect(toneCashPerDoor(3000)).toBe('good');
    expect(toneCashPerDoor(2500)).toBe('warn');
    expect(toneCashPerDoor(1500)).toBe('bad');
  });
  it('years to maturity', () => {
    const y = yearsToMaturity('06/22/2028', new Date('2026-06-22'));
    expect(y).toBeGreaterThan(1.9);
    expect(y).toBeLessThan(2.1);
  });
});

describe('Above the Line (operationally funded)', () => {
  it('detects the phrase case-insensitively anywhere in the name', () => {
    expect(isAboveLine(proj({ name: 'Roof — Above the Line' }))).toBe(true);
    expect(isAboveLine(proj({ name: 'ABOVE THE LINE parking lot' }))).toBe(true);
    expect(isAboveLine(proj({ name: 'Above-average roof' }))).toBe(false);
  });
  it('is excluded from cash projections entirely (outstanding, discussed, paid)', () => {
    const atl = proj({ id: 'A1', name: 'Above the Line HVAC', anticipatedCost: 10000, steps: { planned: true, gotBids: true, approved: true } });
    const normal = proj({ id: 'N1', name: 'Normal HVAC', anticipatedCost: 8000, steps: { planned: true, gotBids: true, approved: true } });
    const st = blankState({ projects: [atl, normal], cash: { CLND: { cash: 50000 } } });
    const cm = cashModel(st, 'CLND');
    expect(cm.outstanding.map((p) => p.id)).toEqual(['N1']);
    expect(cm.outstandingTotal).toBe(8000);
    expect(cm.projectedCash).toBe(42000);
  });
  it('needs no GL tie-out: paid ATL projects are not flagged', () => {
    const atl = proj({ id: 'A1', name: 'Above the Line paving', actualCost: 9000, steps: { paid: true } });
    const st = blankState({ projects: [atl] });
    const am = auditModel(st, 'CLND');
    expect(am.paid.length).toBe(0);
    expect(am.paidNoGL.length).toBe(0);
  });
});

describe('multi-property split', () => {
  const split = proj({
    id: 'S1', property: 'CLND', anticipatedCost: 100000,
    steps: { planned: true, gotBids: true, approved: true },
    split: { mode: 'units', list: [{ property: 'CLND', pct: 60 }, { property: 'SPND', pct: 40 }] },
  });
  it('defaults to a single 100% allocation when unsplit', () => {
    const single = proj({ anticipatedCost: 5000 });
    expect(isSplit(single)).toBe(false);
    expect(allocsOf(single)).toEqual([{ property: 'CLND', pct: 100 }]);
    expect(shareFor(single, 'CLND')).toBe(1);
    expect(shareFor(single, 'SPND')).toBe(0);
  });
  it('exposes per-property shares and membership', () => {
    expect(isSplit(split)).toBe(true);
    expect(involvesProp(split, 'SPND')).toBe(true);
    expect(involvesProp(split, 'TPND')).toBe(false);
    expect(projOutflowFor(split, 'CLND')).toBe(60000);
    expect(projOutflowFor(split, 'SPND')).toBe(40000);
  });
  it('appears in both properties and splits cash projections pro-rata', () => {
    const st = blankState({ projects: [split], cash: { CLND: { cash: 200000 }, SPND: { cash: 100000 } } });
    expect(projForProp(st, 'CLND').length).toBe(1);
    expect(projForProp(st, 'SPND').length).toBe(1);
    const cmC = cashModel(st, 'CLND'), cmS = cashModel(st, 'SPND');
    expect(cmC.outstandingTotal).toBe(60000);
    expect(cmS.outstandingTotal).toBe(40000);
    expect(cmC.projectedCash).toBe(140000);
    expect(cmS.projectedCash).toBe(60000);
  });
  it('GL match scoring compares against the property share of the total', () => {
    const g = { id: 'G1', property: 'SPND', category: 'GENERAL', amount: 40000 } as any;
    const { reasons } = glMatchScore(g, split);
    expect(reasons).toContain('exact $');
  });
});

describe('reference data (seed defaults — runtime source of truth is the properties table)', () => {
  it('seed list carries region + portfolio per property', () => {
    const clnd = PROPERTIES.find((p) => p.code === 'CLND')!;
    const bcnd = PROPERTIES.find((p) => p.code === 'BCND')!;
    expect(clnd.region).toBe('Minot');
    expect(bcnd.region).toBe('Williston');
    expect(clnd.portfolio).toBe('Minot 4 Portfolio');
    expect(PROPERTIES.every((p) => p.region && p.manager && p.portfolio)).toBe(true);
  });
});

describe('long-range plan (migration 028)', () => {
  it('normalizePlanYears keeps 4-digit years and "post", drops junk, rounds to cents', () => {
    expect(normalizePlanYears({ '2026': 75000, '2027': '25000.129', post: 50000, '26': 1, banana: 9, '2028': -5, '2029': 0 }))
      .toEqual({ '2026': 75000, '2027': 25000.13, post: 50000, '2029': 0 });   // explicit zero KEPT — it opts out of the auto layer
    expect(normalizePlanYears({})).toBeNull();
    expect(normalizePlanYears(null)).toBeNull();
    expect(normalizePlanYears([1, 2])).toBeNull();
    expect(normalizePlanYears({ '2026': 'abc' })).toBeNull();
  });
  it('onPlan / planFor / planTotal', () => {
    const p = proj({ planYears: { '2026': 75000, '2027': 75000, post: 50000 } });
    expect(onPlan(p)).toBe(true);
    expect(onPlan(proj())).toBe(false);
    expect(planFor(p, '2026')).toBe(75000);
    expect(planFor(p, '2030')).toBe(0);
    expect(planFor(p, PLAN_POST)).toBe(50000);
    expect(planTotal(p)).toBe(200000);
  });
  it('split projects share plan dollars like costs', () => {
    const p = proj({ planYears: { '2026': 100000 }, split: { mode: 'custom', list: [{ property: 'CLND', pct: 60 }, { property: 'SPND', pct: 40 }] } });
    expect(planForProp(p, 'CLND', '2026')).toBe(60000);
    expect(planForProp(p, 'SPND', '2026')).toBe(40000);
    expect(planTotalForProp(p, 'SPND')).toBe(40000);
  });
  it('planHorizonEnd: override > loan-due year > now+4, clamped', () => {
    expect(planHorizonEnd({ planEndYear: 2028 }, { loanDue: '12/1/2031' }, 2026)).toBe(2028);
    expect(planHorizonEnd({}, { loanDue: '12/1/2031' }, 2026)).toBe(2031);           // 6-year loan → 6-year plan
    expect(planHorizonEnd({}, { loanDue: '6/30/2027' }, 2026)).toBe(2027);           // 2 years left → 2-year plan
    expect(planHorizonEnd({}, { loanDue: '2029-06-30' }, 2026)).toBe(2029);          // ISO text also parses
    expect(planHorizonEnd({}, {}, 2026)).toBe(2030);                                 // no loan info → 5 columns
    expect(planHorizonEnd(undefined, undefined, 2026)).toBe(2030);
    expect(planHorizonEnd({}, { loanDue: '1/1/2020' }, 2026)).toBe(2026);            // past due clamps to now
    expect(planHorizonEnd({}, { loanDue: '1/1/2099' }, 2026)).toBe(2040);            // typo clamps to now+14
  });
  it('planYearCols covers now..end plus any stray data years', () => {
    const p = proj({ planYears: { '2024': 5000, '2027': 1000 } });
    expect(planYearCols([p], 2028, 2026)).toEqual(['2024', '2026', '2027', '2028']);
    expect(planYearCols([], 2027, 2026)).toEqual(['2026', '2027']);
  });
  it('lenderFlagged on non-blank flags only', () => {
    expect(lenderFlagged(proj({ lenderFlag: 'Fannie' }))).toBe(true);
    expect(lenderFlagged(proj({ lenderFlag: '  ' }))).toBe(false);
    expect(lenderFlagged(proj())).toBe(false);
  });
  it('plan is a pure overlay — cash and audit models ignore it', () => {
    const p = proj({ planYears: { '2026': 500000 }, steps: { approved: true }, anticipatedCost: 10000 });
    const st = blankState({ projects: [p], cash: { CLND: { cash: 50000 } } });
    expect(cashModel(st, 'CLND').outstandingTotal).toBe(10000);   // anticipated, NOT the plan
    expect(cashModel(st, 'CLND').projectedCash).toBe(40000);
  });
});

describe('auto layer — the live pipeline is the plan\'s first year', () => {
  it('open projects flow projected spend into the current year by default', () => {
    const disc = proj({ anticipatedCost: 50000 });                                 // discussed
    const act = proj({ anticipatedCost: 80000, actualCost: 75000, steps: { approved: true } });
    expect(autoPlanAmount(disc)).toBe(50000);
    expect(autoPlanAmount(act)).toBe(75000);                                       // actual overrides anticipated
    expect(effPlanFor(disc, '2026', 2026)).toBe(50000);
    expect(effPlanFor(disc, '2027', 2026)).toBe(0);                                // auto lands in one year only
    expect(effPlanTotal(disc, 2026)).toBe(50000);
    expect(inPlan(disc)).toBe(true);
    expect(onPlan(disc)).toBe(false);
  });
  it('auto cost lands in the planned-end year, current year at earliest', () => {
    const thisYr = proj({ anticipatedCost: 40000, plannedEnd: '2026-11-30' });
    const future = proj({ anticipatedCost: 90000, plannedEnd: '2028-06-30' });
    const past = proj({ anticipatedCost: 20000, plannedEnd: '2024-01-15' });
    expect(autoPlanYear(thisYr, 2026)).toBe('2026');
    expect(autoPlanYear(future, 2026)).toBe('2028');
    expect(autoPlanYear(past, 2026)).toBe('2026');                                 // past end date floors to now
    expect(autoPlanYear(proj({ anticipatedCost: 1 }), 2026)).toBe('2026');         // no end date
    expect(effPlanFor(thisYr, '2026', 2026)).toBe(40000);                          // "ends 2026 → all cost in 2026"
    expect(effPlanFor(future, '2028', 2026)).toBe(90000);
    expect(effPlanFor(future, '2026', 2026)).toBe(0);
    expect(effPlanTotal(future, 2026)).toBe(90000);
    // the auto year always gets a column, even past the loan horizon
    expect(planYearCols([future], 2027, 2026)).toEqual(['2026', '2027', '2028']);
  });
  it('hold, done, notes, quantity in-house and ATL contribute nothing', () => {
    expect(autoPlanAmount(proj({ anticipatedCost: 50000, onHold: true }))).toBe(0);
    expect(autoPlanAmount(proj({ anticipatedCost: 50000, steps: { completed: true } }))).toBe(0);
    expect(autoPlanAmount(proj({}))).toBe(0);                                      // note — no cost
    expect(autoPlanAmount(proj({ inHouse: true, ihUnit: 'quantity', totalToComplete: 40 }))).toBe(0);
    expect(autoPlanAmount(proj({ name: 'Above the Line paint', anticipatedCost: 9000 }))).toBe(0);
    expect(autoPlanAmount(proj({ inHouse: true, totalToComplete: 30000, amountCompleted: 5000 }))).toBe(30000); // budget in-house = total
  });
  it('any explicit plan year takes the project off the auto layer — a zero too', () => {
    const spread = proj({ anticipatedCost: 375000, planYears: { '2027': 75000 } });
    expect(autoPlanAmount(spread)).toBe(0);
    expect(effPlanFor(spread, '2026', 2026)).toBe(0);                              // explicit spread wins entirely
    expect(effPlanFor(spread, '2027', 2026)).toBe(75000);
    const zeroed = proj({ anticipatedCost: 375000, planYears: { '2026': 0 } });
    expect(onPlan(zeroed)).toBe(true);
    expect(effPlanTotal(zeroed, 2026)).toBe(0);                                    // deliberately nothing this year
    expect(inPlan(zeroed)).toBe(true);
  });
  it('share-weights like everything else', () => {
    const p = proj({ anticipatedCost: 100000, split: { mode: 'custom', list: [{ property: 'CLND', pct: 60 }, { property: 'SPND', pct: 40 }] } });
    expect(effPlanForProp(p, 'SPND', '2026', 2026)).toBe(40000);
    expect(effPlanTotalForProp(p, 'CLND', 2026)).toBe(60000);
  });
});

describe('region colour ramps (migration 029)', () => {
  it('isHexColor accepts #rrggbb only', () => {
    expect(isHexColor('#3f7cb8')).toBe(true);
    expect(isHexColor('#ABCDEF')).toBe(true);
    expect(isHexColor('3f7cb8')).toBe(false);
    expect(isHexColor('#abc')).toBe(false);
    expect(isHexColor('')).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });
  it('hex → hsl → hex round-trips', () => {
    for (const hex of ['#3f7cb8', '#d2731f', '#4f9d69', '#808080', '#000000', '#ffffff']) {
      const h = hexToHsl(hex)!;
      expect(hslToHex(h.h, h.s, h.l)).toBe(hex);
    }
  });
  it('shadesOf returns n distinct shades, light → dark, same hue family', () => {
    const base = '#3f7cb8';
    const ramp = shadesOf(base, 5);
    expect(ramp.length).toBe(5);
    expect(new Set(ramp).size).toBe(5);                       // all distinct
    const ls = ramp.map((c) => hexToHsl(c)!.l);
    for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1]);   // monotonically darker
    // One hue family: 8-bit hex quantization drifts the recovered hue by a
    // degree or so, so assert closeness to the base rather than exact equality.
    const baseHue = hexToHsl(base)!.h;
    ramp.forEach((c) => expect(Math.abs(hexToHsl(c)!.h - baseHue)).toBeLessThan(3));
  });
  it('a one-property region keeps the base colour untouched', () => {
    expect(shadesOf('#3f7cb8', 1)).toEqual(['#3f7cb8']);
  });
  it('degenerates safely', () => {
    expect(shadesOf('nope', 4)).toEqual([]);
    expect(shadesOf('#3f7cb8', 0)).toEqual([]);
    expect(shadesOf('#ffffff', 3).length).toBe(3);            // extremes still produce a ramp
    expect(shadesOf('#000000', 3).length).toBe(3);
  });
  it('regionShadeMap keys by code in sorted order so shades are stable', () => {
    const m = regionShadeMap('#3f7cb8', ['TPND', 'CLND', 'SPND']);
    expect(Object.keys(m).sort()).toEqual(['CLND', 'SPND', 'TPND']);
    // CLND sorts first ⇒ lightest; TPND last ⇒ darkest
    expect(hexToHsl(m.CLND)!.l).toBeGreaterThan(hexToHsl(m.TPND)!.l);
    // re-running with the same inputs gives the same colours
    expect(regionShadeMap('#3f7cb8', ['SPND', 'CLND', 'TPND'])).toEqual(m);
  });
});
