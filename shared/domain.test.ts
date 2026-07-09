import { describe, it, expect } from 'vitest';
import {
  Project, AppState, STEP_KEYS, APPROVED_IDX, OVER_THRESHOLD,
  phase, isComplete, projOutflow, stage, stepsDone, stepsTotal,
  advance, toggleStep, appKeys, isNA, applyCostRules,
  cashModel, auditModel, glMatchScore, glSpentFor, cashAdjFor,
  toneRemaining, toneProjected, toneCashPerDoor, yearsToMaturity, PROPERTIES, isAboveLine,
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
