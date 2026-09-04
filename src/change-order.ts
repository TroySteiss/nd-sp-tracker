import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { PAGE_W, PAGE_H, MARGIN, CONTENT_W, TOP, BOTTOM, drawFormBox } from './contract-layout.js';

/* =============================================================================
   Change order generator.

   A FILLED version of the change-order form both contract templates carry as a
   blank exhibit (contract-multi.ts exhibitE — the Exhibit E grid of drawFormBox
   boxes). This one stands alone: it amends an already-generated contract, so it
   opens with a reference line naming the agreement it changes, and every value
   arrives from the caller and prints VERBATIM — the previous and revised
   Contract Sums are what the admin typed, never a derived total, for the same
   reason nothing is totalled on the contracts themselves.

   The blank exhibit in contract-multi.ts is deliberately untouched: it exists to
   be printed and completed by hand, and its wording is snapshot-verified against
   the executed Legend Lawn contract. Keep the two forms' wording in step — the
   labels and sentences below are the executed form's.

   One page, always. A description that will not fit is refused (code TOO_LONG)
   rather than silently truncated or spilled past the signature block.
   ============================================================================= */

export interface ChangeOrderVars {
  changeOrderNo: string;      // "1", "2", … — the server numbers them
  dateText: string;           // printed verbatim, e.g. "08/25/2026"
  agreementRef: string;       // "Independent Contractor Agreement dated 09/01/2025 — Legend Lawn Service LLC"
  contractorBlock: string;    // name + address, '\n'-separated
  ownerBlock: string;         // entity name(s) + address(es), '\n'-separated
  description: string;        // THE ... IS HEREBY CHANGED AS FOLLOWS
  additionalDays: string;     // "NONE" when none
  previousSum: string;        // verbatim, e.g. "$330,000.00"
  revisedSum: string;         // verbatim
}

/** Wrap text (honouring '\n' as hard breaks) to a width; returns the lines. */
function wrapLines(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const seg of String(text).split('\n')) {
    const words = seg.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) { out.push(line); line = w; }
      else line = test;
    }
    if (line) out.push(line);
  }
  return out;
}

export async function buildChangeOrder(v: ChangeOrderVars): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const roman = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  let y = TOP;

  const center = (txt: string, size: number, f: PDFFont, lead?: number) => {
    const w = f.widthOfTextAtSize(txt, size);
    page.drawText(txt, { x: (PAGE_W - w) / 2, y, size, font: f, color: rgb(0, 0, 0) });
    y -= (lead ?? size + 6);
  };

  center('CHANGE ORDER', 13, bold);
  center(`No. ${v.changeOrderNo}`, 11, bold);
  y -= 2;
  // Which agreement this amends — a standalone change order is meaningless
  // without it. Wrapped, since a multi-entity owner list can run long.
  for (const ln of wrapLines(v.agreementRef, roman, 9, CONTENT_W)) center(ln, 9, roman, 12);
  y -= 8;

  /* ---- the form grid: same boxes as the blank exhibit, with values inside ---- */
  const VAL_SIZE = 9.5, VAL_LEAD = 12;

  /** Label + value on one line inside a box (the No/Date/sum boxes). */
  const inlineBox = (label: string, value: string, h: number, half: 'left' | 'right') => {
    const w = (CONTENT_W - 12) / 2;
    const x = half === 'right' ? MARGIN + w + 12 : MARGIN;
    drawFormBox(page, { x, y, w, h, label, font: bold, size: 9 });
    const lw = bold.widthOfTextAtSize(label, 9);
    page.drawText(value, { x: x + 4 + lw + 5, y: y - 9 - 3, size: VAL_SIZE, font: roman, color: rgb(0, 0, 0) });
    if (half === 'right') y -= h + 8;
  };

  /** Label on top, wrapped value lines below (the address and description boxes). */
  const blockLines = (value: string, w: number) => wrapLines(value, roman, VAL_SIZE, w - 10);
  const blockBox = (label: string, lines: string[], h: number, o: { x: number; w: number }) => {
    drawFormBox(page, { x: o.x, y, w: o.w, h, label, font: bold, size: 9 });
    let ly = y - 9 - 3 - VAL_LEAD - 1;
    for (const ln of lines) {
      if (ly < y - h + 4) break;                 // fits by construction; belt and braces
      page.drawText(ln, { x: o.x + 5, y: ly, size: VAL_SIZE, font: roman, color: rgb(0, 0, 0) });
      ly -= VAL_LEAD;
    }
  };

  inlineBox('Change Order No:', v.changeOrderNo, 30, 'left');
  inlineBox('Date:', v.dateText, 30, 'right');

  // Contractor / Owner blocks side by side, equal height, sized to the longer.
  const halfW = (CONTENT_W - 12) / 2;
  const ctrLines = blockLines(v.contractorBlock, halfW);
  const ownLines = blockLines(v.ownerBlock, halfW);
  const pairH = Math.max(62, 18 + Math.max(ctrLines.length, ownLines.length) * VAL_LEAD + 6);
  blockBox("Contractor's Name and Address:", ctrLines, pairH, { x: MARGIN, w: halfW });
  blockBox("Owner's Name and Address:", ownLines, pairH, { x: MARGIN + halfW + 12, w: halfW });
  y -= pairH + 8;

  y -= 10;
  center('THE INDEPENDENT CONTRACTOR AGREEMENT IS HEREBY CHANGED AS FOLLOWS', 9, bold);
  y -= 2;

  // Everything below the description box is fixed-height — measure it, give the
  // description whatever is left, and refuse a description that still won't fit.
  const FIXED_BELOW =
    (34 + 8) +          // additional-days box
    (30 + 8) +          // previous / revised sum row
    12 + 14 + 14 +      // gap + the two all-other-terms lines
    6 + 17 +            // gap + ACCEPTANCE heading
    3 * 11 + 14 +       // acceptance paragraph (3 lines at 9pt) + gap
    2 * 26;             // the two signature lines
  const descLines = blockLines(v.description, CONTENT_W);
  const descNeed = 18 + descLines.length * VAL_LEAD + 6;
  const descAvail = (y - BOTTOM) - FIXED_BELOW;
  const descH = Math.max(150, Math.min(descNeed, descAvail));
  if (descNeed > descAvail) {
    const err: any = new Error(
      `The change description is too long to fit the one-page form — it needs roughly ` +
      `${descLines.length} lines and about ${Math.floor((descAvail - 24) / VAL_LEAD)} fit. Shorten it.`);
    err.code = 'TOO_LONG';
    throw err;
  }
  blockBox('', descLines, descH, { x: MARGIN, w: CONTENT_W });
  y -= descH + 8;

  {
    // Full-width box, label + value inline.
    const label = 'Additional Contract Days (if none, state "NONE"):';
    drawFormBox(page, { x: MARGIN, y, w: CONTENT_W, h: 34, label, font: bold, size: 9 });
    const lw = bold.widthOfTextAtSize(label, 9);
    page.drawText(v.additionalDays, { x: MARGIN + 4 + lw + 5, y: y - 9 - 3, size: VAL_SIZE, font: roman, color: rgb(0, 0, 0) });
    y -= 34 + 8;
  }
  inlineBox('PREVIOUS CONTRACT SUM: $', String(v.previousSum).replace(/^\$\s*/, ''), 30, 'left');
  inlineBox('REVISED CONTRACT SUM: $', String(v.revisedSum).replace(/^\$\s*/, ''), 30, 'right');

  y -= 12;
  center('ALL OTHER TERMS AND CONDITIONS OF THE CONTRACTOR AGREEMENT THAT ARE NOT', 8, bold, 14);
  center('CHANGED BY THIS CHANGE ORDER REMAIN IN FULL FORCE AND EFFECT.', 8, bold, 14);
  y -= 6;
  center('ACCEPTANCE', 11, bold);

  const accept = 'The above prices, specifications, and conditions are satisfactory, and are hereby accepted. The Contractor is authorized to do the work as specified, and the Owner shall make payments as outlined above.';
  for (const ln of wrapLines(accept, roman, 9, CONTENT_W)) {
    page.drawText(ln, { x: MARGIN, y, size: 9, font: roman, color: rgb(0, 0, 0) });
    y -= 11;
  }
  y -= 14;

  const sig = (label: string) => {
    page.drawText(`${label} _____________________________________    Date: __________________`,
      { x: MARGIN, y, size: 9, font: roman, color: rgb(0, 0, 0) });
    y -= 26;
  };
  sig('Owner Signature:');
  sig('Contractor Signature:');

  return doc.save();
}
