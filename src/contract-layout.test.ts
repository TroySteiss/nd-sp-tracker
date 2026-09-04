import { describe, it, expect } from 'vitest';
import { PDFDocument, PDFName, degrees } from 'pdf-lib';
import {
  pageView, visualToPage, stampFootprint, stampSignature,
  SIG_MAX_H_PCT, SIG_BASELINE_DROP, type PageView,
} from './contract-layout.js';

/* The countersign stamper's geometry. A click in the browser is a fraction of the
   page AS DISPLAYED (CropBox, then /Rotate, origin top-left). These pin down the
   mapping back into unrotated user space for every rotation a scanner produces,
   with a CropBox that does not start at 0,0 so origin handling is exercised too. */

// A 612x792 window at 44,54 inside a bigger MediaBox.
const CB = { x: 44, y: 54, width: 612, height: 792 };
const view = (rot: 0 | 90 | 180 | 270): PageView => {
  const landscape = rot === 90 || rot === 270;
  return { cb: CB, rot, vw: landscape ? CB.height : CB.width, vh: landscape ? CB.width : CB.height };
};
const close = (p: { x: number; y: number }, x: number, y: number) => {
  expect(p.x).toBeCloseTo(x, 6);
  expect(p.y).toBeCloseTo(y, 6);
};
const L = CB.x, R = CB.x + CB.width, B = CB.y, T = CB.y + CB.height;

describe('visualToPage', () => {
  it('rot 0: displayed corners are the CropBox corners, y flipped', () => {
    const v = view(0);
    close(visualToPage(v, 0, 0), L, T);    // displayed top-left
    close(visualToPage(v, 1, 0), R, T);
    close(visualToPage(v, 0, 1), L, B);
    close(visualToPage(v, 1, 1), R, B);
  });
  it('rot 90 (shown turned clockwise): displayed top-left is the unrotated bottom-left', () => {
    const v = view(90);
    expect([v.vw, v.vh]).toEqual([792, 612]);
    close(visualToPage(v, 0, 0), L, B);
    close(visualToPage(v, 1, 0), L, T);    // displayed top-right ← unrotated top-left
    close(visualToPage(v, 0, 1), R, B);    // displayed bottom-left ← unrotated bottom-right
    close(visualToPage(v, 1, 1), R, T);
  });
  it('rot 180: displayed top-left is the unrotated bottom-right', () => {
    const v = view(180);
    close(visualToPage(v, 0, 0), R, B);
    close(visualToPage(v, 1, 1), L, T);
  });
  it('rot 270 (shown turned anticlockwise): displayed top-left is the unrotated top-right', () => {
    const v = view(270);
    expect([v.vw, v.vh]).toEqual([792, 612]);
    close(visualToPage(v, 0, 0), R, T);
    close(visualToPage(v, 1, 0), R, B);    // displayed top-right ← unrotated bottom-right
    close(visualToPage(v, 0, 1), L, T);    // displayed bottom-left ← unrotated top-left
    close(visualToPage(v, 1, 1), L, B);
  });
  it('the displayed centre is the CropBox centre under every rotation', () => {
    for (const rot of [0, 90, 180, 270] as const) close(visualToPage(view(rot), 0.5, 0.5), L + 306, B + 396);
  });
  it('a point a quarter along and a tenth down lands consistently when the page turns', () => {
    // Same physical spot on the paper, seen through each rotation.
    const p0 = visualToPage(view(0), 0.25, 0.1);
    // Turning the paper 90° clockwise moves that spot: displayed x = 1 - old y-fraction... check by round trip
    // through the physical point instead: physical (x,y) in user space is what all four must agree on
    // when given the fraction that a viewer would report for it.
    const fx = (p0.x - L) / CB.width, fy = (p0.y - B) / CB.height;   // physical fractions from bottom-left
    close(visualToPage(view(90), fy, fx), p0.x, p0.y);
    close(visualToPage(view(180), 1 - fx, fy), p0.x, p0.y);
    close(visualToPage(view(270), 1 - fy, 1 - fx), p0.x, p0.y);
  });
  it('clamps fractions to the page', () => {
    close(visualToPage(view(0), -3, 7), L, B);
  });
});

describe('stampFootprint', () => {
  it('keeps the aspect ratio when the signature is short enough', () => {
    const fp = stampFootprint(view(0), 400, 40, { xPct: 0.1, yPct: 0.5, widthPct: 0.2 });
    expect(fp.w).toBeCloseTo(0.2 * 612);
    expect(fp.h).toBeCloseTo(fp.w / 10);
    expect(fp.left).toBeCloseTo(61.2);
    expect(fp.line).toBeCloseTo(396);
    expect(fp.bottom).toBeCloseTo(396 + fp.h * SIG_BASELINE_DROP);   // a fifth hangs below the line
  });
  it('caps the height so a tall scrawl cannot run up into the Owner line, shrinking width to match', () => {
    const fp = stampFootprint(view(0), 300, 120, { xPct: 0.1, yPct: 0.5, widthPct: 0.22 });
    expect(fp.h).toBeCloseTo(SIG_MAX_H_PCT * 792);
    expect(fp.w).toBeCloseTo(fp.h * (300 / 120));
    expect(fp.w).toBeLessThan(0.22 * 612);
  });
  it('sizes against the DISPLAYED page on a rotated one', () => {
    const fp = stampFootprint(view(90), 400, 40, { xPct: 0.1, yPct: 0.5, widthPct: 0.2 });
    expect(fp.w).toBeCloseTo(0.2 * 792);
    expect(fp.left).toBeCloseTo(79.2);
    expect(fp.line).toBeCloseTo(306);
  });
  it('falls back to defaults for out-of-range width/height fractions', () => {
    const fp = stampFootprint(view(0), 400, 40, { xPct: 0, yPct: 0, widthPct: 0.9, maxHeightPct: 0.9 });
    expect(fp.w).toBeCloseTo(0.2 * 612);
  });
});

describe('pageView', () => {
  it('reads CropBox, MediaBox intersection and /Rotate off a real page', async () => {
    const doc = await PDFDocument.create();
    const pg = doc.addPage([700, 900]);
    pg.setCropBox(44, 54, 612, 792);
    pg.setRotation(degrees(90));
    const v = pageView(pg);
    expect(v.rot).toBe(90);
    expect(v.cb).toEqual({ x: 44, y: 54, width: 612, height: 792 });
    expect([v.vw, v.vh]).toEqual([792, 612]);
  });
  it('normalises odd rotation values and ignores a CropBox outside the MediaBox', async () => {
    const doc = await PDFDocument.create();
    const pg = doc.addPage([612, 792]);
    pg.setRotation(degrees(-90));
    expect(pageView(pg).rot).toBe(270);
    pg.setRotation(degrees(450));
    expect(pageView(pg).rot).toBe(90);
    pg.setCropBox(5000, 5000, 10, 10);
    expect(pageView(pg).cb).toEqual({ x: 0, y: 0, width: 612, height: 792 });
  });
});

describe('stampSignature', () => {
  // 1x1 transparent PNG.
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  const stampedPage = async (rot: number) => {
    const doc = await PDFDocument.create();
    doc.addPage([612, 792]);
    const pg = doc.addPage([612, 792]);
    pg.setRotation(degrees(rot));
    const out = await stampSignature(Buffer.from(await doc.save()), PNG, {
      page: 2, xPct: 0.16, yPct: 0.6, widthPct: 0.22, name: 'Troy Steiss', title: 'Asset Manager', dateText: '09/04/2026',
    });
    const re = await PDFDocument.load(out);
    return re.getPages();
  };
  it('draws the image and the three fill lines onto the requested page only, for every rotation', async () => {
    for (const rot of [0, 90, 180, 270]) {
      const pages = await stampedPage(rot);
      expect(pages).toHaveLength(2);
      const xo = pages[1].node.Resources()?.lookup(PDFName.of('XObject'));
      expect(xo, `rot ${rot}: image XObject present`).toBeTruthy();
      expect(pages[0].node.Resources()?.lookup(PDFName.of('XObject'))).toBeFalsy();
      // Rotation survives the round trip (we draw into unrotated space; the page attribute is untouched).
      expect(pages[1].getRotation().angle).toBe(rot);
    }
  });
});
