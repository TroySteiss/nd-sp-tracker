import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib';
import AdmZip from 'adm-zip';

/* =============================================================================
   Shared PDF layout engine for the generated contracts.

   Extracted from contract.ts so the multi-entity template (contract-multi.ts)
   renders through exactly the same measuring, wrapping and bid-embedding code.
   Nothing in here knows anything about a particular agreement's wording — it is
   page geometry, rich text, bid attachments and page marks only.

   The two templates that use it:
     src/contract.ts        — the Special Project agreement ("Contract Price")
     src/contract-multi.ts  — the multi-entity agreement ("Contract Sum")
   ============================================================================= */

export const PAGE_W = 612, PAGE_H = 792;       // US Letter
export const MARGIN = 72;                       // 1"
export const CONTENT_W = PAGE_W - 2 * MARGIN;   // 468
export const BODY_SIZE = 11, LEADING = 12.5;
export const FIRST_INDENT = 28;                 // first-line paragraph indent (~0.4")
export const TOP = PAGE_H - MARGIN;             // first baseline area
export const BOTTOM = 72;                       // stop wrapping here (page number sits below)

/* ---------- rich text (supports **bold** runs) ---------- */
export interface Word { text: string; bold: boolean; }

export function tokenize(s: string): Word[] {
  const words: Word[] = [];
  const parts = s.split(/(\*\*)/);
  let bold = false;
  for (const part of parts) {
    if (part === '**') { bold = !bold; continue; }
    if (!part) continue;
    for (const w of part.split(/(\s+)/)) {
      if (!w || /^\s+$/.test(w)) continue;
      words.push({ text: w, bold });
    }
  }
  return words;
}

/** Stable id for a section, derived from its title. */
export const sectionSlug = (title: string): string =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Where the countersignature goes: the Owner "By:" line, as page + fractions. */
export interface SigAnchor { page: number; xPct: number; yPct: number; widthPct: number; }

/* `pages` limits which pages of a multi-page bid become the contract scope.
   Bids often arrive as a sales deck where only one page is the actual proposal —
   the rest is marketing and the contractor's own terms, which must not become
   Exhibit A. 1-based, e.g. "6" or "1,6-8". Empty/absent = every page. */
/* A box drawn over a bid page in the review previewer.
   page  — 1-based page number in the SOURCE document.
   x/y/w/h — fractions of the upright page, from the top-left (as SigAnchor does).
   style — 'strike' rules through and stays legible; 'cover' blanks the area. */
export interface PageMark { page: number; x: number; y: number; w: number; h: number; style?: 'strike' | 'cover'; }

export interface BidAttachment { buffer: Buffer; name: string; label?: string; pages?: string; marks?: PageMark[]; }

/** Drop marks that aren't finite numbers in 0..1 — a bad box would otherwise
 *  paint somewhere arbitrary on the contract. */
export function sanitizeMarks(raw: any): PageMark[] {
  if (!Array.isArray(raw)) return [];
  const ok = (n: any) => typeof n === 'number' && isFinite(n) && n >= -0.01 && n <= 1.01;
  return raw
    .filter((m) => m && Number.isFinite(m.page) && m.page >= 1 && ok(m.x) && ok(m.y) && ok(m.w) && ok(m.h) && m.w > 0 && m.h > 0)
    .slice(0, 200)
    .map((m) => ({
      page: Math.floor(m.page),
      x: Math.min(1, Math.max(0, m.x)), y: Math.min(1, Math.max(0, m.y)),
      w: Math.min(1, m.w), h: Math.min(1, m.h),
      style: m.style === 'cover' ? 'cover' as const : 'strike' as const,
    }));
}

/** Parse "1,6-8" into a 0-based index set. Returns null for "all pages". */
export function parsePageSpec(spec: string | undefined, pageCount: number): Set<number> | null {
  const raw = String(spec || '').trim();
  if (!raw) return null;
  const keep = new Set<number>();
  for (const part of raw.split(',')) {
    const raw2 = part.trim();
    if (!raw2) continue;
    const m = raw2.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const lo = Math.max(1, Number(m[1])), hi = Math.min(pageCount, Number(m[2]));
      for (let i = lo; i <= hi; i++) keep.add(i - 1);
    } else if (/^\d+$/.test(raw2)) {
      const n = Number(raw2);
      if (n >= 1 && n <= pageCount) keep.add(n - 1);
    }
  }
  return keep.size ? keep : null;   // nothing valid selected ⇒ fall back to all
}

/* =============================================================================
   Layout — the page cursor and text engine.

   Holds the current page and baseline (`y`) and advances them as content is
   drawn, adding pages as needed. These were closures inside buildContract; they
   are a class now only so a second template can share them.
   ============================================================================= */
export class Layout {
  readonly doc: PDFDocument;
  readonly roman: PDFFont;
  readonly bold: PDFFont;
  page: PDFPage;
  y: number;

  private constructor(doc: PDFDocument, roman: PDFFont, bold: PDFFont) {
    this.doc = doc; this.roman = roman; this.bold = bold;
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.y = TOP;
  }

  /** Create a document with the Times family embedded and a first page ready. */
  static async create(): Promise<Layout> {
    const doc = await PDFDocument.create();
    const roman = await doc.embedFont(StandardFonts.TimesRoman);
    const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
    return new Layout(doc, roman, bold);
  }

  fontFor(b: boolean): PDFFont { return b ? this.bold : this.roman; }

  newPage(): void { this.page = this.doc.addPage([PAGE_W, PAGE_H]); this.y = TOP; }

  /** Break to a new page if `h` more vertical space isn't available. */
  space(h: number): void { if (this.y - h < BOTTOM) this.newPage(); }

  /**
   * Draw a paragraph of rich text, wrapping to CONTENT_W. Supports centering,
   * a first-line indent and a whole-block indent.
   *
   * `indent` shifts every line's left edge; `firstIndent` adds to the first line
   * only and MAY BE NEGATIVE, which is how a hanging indent is built: indent the
   * block past the label, then pull the first line back out to sit the label in
   * the gutter. That is what the lettered sub-items in `section` do.
   */
  paragraph(text: string, opts: { size?: number; leading?: number; gap?: number; align?: 'left' | 'center'; firstIndent?: number; indent?: number } = {}): void {
    // A '\n' is a HARD line break inside one logical paragraph — address blocks
    // and the Section 1 money breakdown need it. Each segment wraps on its own at
    // the same indent, with no gap between them, so the whole thing still counts
    // as a single item to `section`'s lettered list.
    if (text.includes('\n')) {
      const segs = text.split('\n');
      segs.forEach((seg, i) => this.paragraph(seg, {
        ...opts,
        gap: i === segs.length - 1 ? (opts.gap ?? 5) : 0,
        firstIndent: i === 0 ? (opts.firstIndent ?? 0) : 0,
      }));
      return;
    }
    const size = opts.size ?? BODY_SIZE;
    const lead = opts.leading ?? LEADING;
    const align = opts.align ?? 'left';
    const firstIndent = opts.firstIndent ?? 0;
    const indent = opts.indent ?? 0;
    const words = tokenize(text);
    const wW = (w: Word) => this.fontFor(w.bold).widthOfTextAtSize(w.text, size);
    const spaceW = (b: boolean) => this.fontFor(b).widthOfTextAtSize(' ', size);
    if (!words.length) { this.y -= lead + (opts.gap ?? 5); return; }
    const off = (li: number) => indent + (li === 0 ? firstIndent : 0);
    const limit = (li: number) => CONTENT_W - off(li);
    const lines: Word[][] = [];
    let line: Word[] = [], lineW = 0;
    for (const w of words) {
      const add = (line.length ? spaceW(w.bold) : 0) + wW(w);
      if (lineW + add > limit(lines.length) && line.length) { lines.push(line); line = []; lineW = 0; }
      lineW += (line.length ? spaceW(w.bold) : 0) + wW(w);
      line.push(w);
    }
    if (line.length) lines.push(line);
    lines.forEach((ln, li) => {
      this.space(lead);
      const natural = ln.reduce((a, w, i) => a + wW(w) + (i ? spaceW(w.bold) : 0), 0);
      let x = align === 'center' ? MARGIN + (CONTENT_W - natural) / 2 : MARGIN + off(li);
      ln.forEach((w, i) => {
        if (i) x += spaceW(w.bold);
        this.page.drawText(w.text, { x, y: this.y, size, font: this.fontFor(w.bold), color: rgb(0, 0, 0) });
        x += wW(w);
      });
      this.y -= lead;
    });
    this.y -= (opts.gap ?? 5);
  }

  /**
   * A numbered section: "N. **Title.** body" with a first-line indent.
   * Extra paragraphs (sub-clauses, notice addresses) render below, also indented.
   * A leading '' in `paras` means the title stands alone on its own line.
   *
   * `opts.lettered` renders those extra paragraphs as an a./b./c. list with a
   * hanging indent. Use it wherever the section text cites its own sub-items
   * ("this Section 12.a") — without visible letters that reference points at
   * nothing on the page.
   *
   * `opts.blockIndent` indents every line of the extra paragraphs equally instead
   * of only the first, which is what an address block needs so its street and
   * phone lines sit under the name rather than sliding back to the margin.
   */
  section(n: number, title: string, paras: string[], opts: { lettered?: boolean; blockIndent?: boolean } = {}): void {
    const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
    const GUTTER = 18;                       // room for "a. " before the text
    const LETTER_X = FIRST_INDENT + 14;      // the letter sits under the section title
    const sub = (text: string, i: number) => {
      if (opts.lettered) {
        // Hanging indent: the block sits past the letter, the first line pulls back
        // out so "a." lands in the gutter and the text wraps flush under itself.
        this.paragraph(`${LETTERS[i] || i + 1}. ${text}`,
          { indent: LETTER_X + GUTTER, firstIndent: -GUTTER, gap: 6 });
      } else if (opts.blockIndent) {
        this.paragraph(text, { indent: FIRST_INDENT, gap: 6 });
      } else {
        this.paragraph(text, { firstIndent: FIRST_INDENT, gap: 5 });
      }
    };
    if (paras[0] === '') {
      this.paragraph(`${n}. **${title}.**`, { firstIndent: FIRST_INDENT, gap: 3 });
      for (let i = 1; i < paras.length; i++) sub(paras[i], i - 1);
    } else {
      this.paragraph(`${n}. **${title}.** ${paras[0]}`, { firstIndent: FIRST_INDENT, gap: paras.length > 1 ? 3 : 5 });
      for (let i = 1; i < paras.length; i++) sub(paras[i], i - 1);
    }
  }
}

/**
 * Resolve {SEC:slug} cross-references against the FINAL section ordering.
 *
 * Section numbers shift whenever a section is omitted, so the templates never
 * hard-code them: they write {SEC:insurance} and this stamps in the real number.
 *
 * Refuses to resolve a reference to a section that isn't in the list — that means
 * a surviving section points at an omitted one, which would ship a contract with a
 * dangling "Section 6". Better to fail loudly at generation.
 */
export function resolveCrossRefs(list: { title: string; paras: string[] }[]): { title: string; paras: string[] }[] {
  const num = new Map(list.map((s, i) => [sectionSlug(s.title), i + 1]));
  const resolve = (text: string) => text.replace(/\{SEC:([a-z0-9-]+)\}/g, (_m, slug) => {
    const n = num.get(slug);
    if (!n) {
      throw new Error(
        `Cannot omit "${slug.replace(/-/g, ' ')}" — another section of the agreement refers to it. ` +
        `Keep that section, or remove the section that references it too.`
      );
    }
    return String(n);
  });
  return list.map((s) => ({ title: s.title, paras: s.paras.map(resolve) }));
}

/**
 * A bordered form box with an optional label printed inside its top-left corner.
 * Exhibit E's change-order form is a grid of these rather than prose.
 * Returns the y of the box's bottom edge, so boxes can be stacked.
 */
export function drawFormBox(
  page: PDFPage,
  o: { x: number; y: number; w: number; h: number; label?: string; font?: PDFFont; size?: number },
): number {
  const bottom = o.y - o.h;
  page.drawRectangle({ x: o.x, y: bottom, width: o.w, height: o.h,
                       borderColor: rgb(0, 0, 0), borderWidth: 0.75 });
  if (o.label && o.font) {
    const size = o.size ?? 9;
    page.drawText(o.label, { x: o.x + 4, y: o.y - size - 3, size, font: o.font, color: rgb(0, 0, 0) });
  }
  return bottom;
}

/** Page numbers on every page, centered, 9pt. Call last, once all pages exist. */
export function numberPages(doc: PDFDocument, roman: PDFFont): void {
  doc.getPages().forEach((p, i) => {
    const label = String(i + 1);
    const w = roman.widthOfTextAtSize(label, 9);
    const pw = p.getSize().width;
    p.drawText(label, { x: (pw - w) / 2, y: 24, size: 9, font: roman, color: rgb(0, 0, 0) });
  });
}

/* ---------- bid attachments ---------- */
export function detectKind(buf: Buffer): 'pdf' | 'jpg' | 'png' | 'zip' | 'unknown' {
  if (buf.length < 4) return 'unknown';
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'pdf'; // %PDF
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x50 && buf[1] === 0x4b) return 'zip'; // PK
  return 'unknown';
}

/** Expand any ZIPs into their contained PDFs/images; bid-like files first, photos after. */
export function expandAttachments(attachments: BidAttachment[]): BidAttachment[] {
  const out: BidAttachment[] = [];
  for (const att of attachments) {
    if (detectKind(att.buffer) === 'zip') {
      const zip = new AdmZip(att.buffer);
      const entries = zip.getEntries()
        .filter((e) => !e.isDirectory && /\.(pdf|jpe?g|png)$/i.test(e.entryName))
        .sort((a, b) => a.entryName.localeCompare(b.entryName));
      // bids (pdf) first, then images
      const pdfs = entries.filter((e) => /\.pdf$/i.test(e.entryName));
      const imgs = entries.filter((e) => /\.(jpe?g|png)$/i.test(e.entryName));
      for (const e of [...pdfs, ...imgs]) out.push({ buffer: e.getData(), name: e.entryName });
    } else {
      out.push(att);
    }
  }
  return out;
}

export function fitBox(w: number, h: number, maxW: number, maxH: number) {
  const s = Math.min(maxW / w, maxH / h, 1);
  return { w: w * s, h: h * s };
}

/** Where an item actually landed, so marks can be drawn over it in the same space. */
export interface DrawnBox { left: number; bottom: number; dw: number; dh: number; }

/** One embeddable piece of a bid: an embedded PDF page or an image. */
export interface BidItem { type: 'pdf' | 'img'; ep?: any; img?: any; rot?: number; marks?: PageMark[]; label?: string; }

/**
 * Place one bid item into a box, top-aligned and centered, shrunk to fit and
 * rotated upright to undo any page /Rotate.
 */
export function placeItem(target: PDFPage, item: BidItem, x: number, top: number, maxW: number, maxH: number): DrawnBox {
  if (item.type === 'img') {
    const f = fitBox(item.img.width, item.img.height, maxW, maxH);
    const l = x + (maxW - f.w) / 2;
    target.drawImage(item.img, { x: l, y: top - f.h, width: f.w, height: f.h });
    return { left: l, bottom: top - f.h, dw: f.w, dh: f.h };
  }
  const ep = item.ep;
  const rot = (((item.rot ?? 0) % 360) + 360) % 360;
  const a = (360 - rot) % 360;                 // CCW angle to display upright
  const landscape = a === 90 || a === 270;
  const vw = landscape ? ep.height : ep.width; // upright (visual) dims
  const vh = landscape ? ep.width : ep.height;
  const s = Math.min(maxW / vw, maxH / vh, 1);
  const uW = ep.width * s, uH = ep.height * s; // unrotated drawn dims
  const dw = landscape ? uH : uW, dh = landscape ? uW : uH;
  const left = x + (maxW - dw) / 2, bottom = top - dh;
  if (a === 0) target.drawPage(ep, { x: left, y: bottom, width: uW, height: uH });
  else if (a === 90) target.drawPage(ep, { x: left + uH, y: bottom, width: uW, height: uH, rotate: degrees(90) });
  else if (a === 180) target.drawPage(ep, { x: left + uW, y: bottom + uH, width: uW, height: uH, rotate: degrees(180) });
  else target.drawPage(ep, { x: left, y: bottom + uW, width: uW, height: uH, rotate: degrees(270) });
  return { left, bottom, dw, dh };
}

/**
 * Draw the reviewer's marks over a placed bid page.
 *
 * Coordinates are fractions of the UPRIGHT page as seen in the browser, measured
 * from the top-left — the same convention as SigAnchor. `dw`/`dh` are the visual
 * drawn dimensions, so this is correct for rotated source pages too.
 *
 * 'strike' rules through the content but leaves it legible: on a contract you
 * want both sides to see what was removed. 'cover' blanks it instead. Note that
 * covering paints over the text — it does not delete it from the file, so a
 * determined reader can still extract it. Use it for tidiness, not secrecy.
 */
export function drawMarks(target: PDFPage, box: DrawnBox, marks: PageMark[], font: PDFFont): void {
  const RED = rgb(0.72, 0.12, 0.10);
  for (const m of marks) {
    const x = box.left + m.x * box.dw;
    const w = Math.max(2, m.w * box.dw);
    const h = Math.max(2, m.h * box.dh);
    const y = box.bottom + box.dh - (m.y * box.dh) - h;   // PDF origin is bottom-left
    if (m.style === 'cover') {
      target.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1),
                             borderColor: rgb(0.55, 0.55, 0.55), borderWidth: 0.75 });
      if (w > 60 && h > 12) {
        const label = 'REMOVED';
        const lw = font.widthOfTextAtSize(label, 8);
        target.drawText(label, { x: x + (w - lw) / 2, y: y + h / 2 - 3, size: 8, font,
                                 color: rgb(0.55, 0.55, 0.55) });
      }
    } else {
      target.drawRectangle({ x, y, width: w, height: h, borderColor: RED, borderWidth: 1 });
      // Rule through each text line the box covers (~11pt line pitch) so a block
      // of terms reads as struck, not merely boxed.
      const pitch = 11;
      for (let ly = y + h - pitch / 2; ly > y + 1; ly -= pitch) {
        target.drawLine({ start: { x: x + 1.5, y: ly }, end: { x: x + w - 1.5, y: ly },
                          color: RED, thickness: 1 });
      }
    }
  }
}

/**
 * Embed every attachment's selected pages/images into `doc`, in order.
 *
 * Marks travel with their SOURCE page number, so they stay attached to the right
 * page after page filtering removes or reorders pages. The first item produced by
 * each attachment carries that attachment's label as a caption.
 *
 * REFUSES to return an empty list: a contract whose scope is a placeholder must
 * never be emitted, so callers get a NO_SCOPE error instead of a blank exhibit.
 * `where` names the exhibit in that error, since the two templates differ.
 */
export async function collectBidItems(doc: PDFDocument, attachments: BidAttachment[], where = 'as the contract scope'): Promise<BidItem[]> {
  const items: BidItem[] = [];
  for (const att of expandAttachments(attachments)) {
    const kind = detectKind(att.buffer);
    const before = items.length;
    try {
      if (kind === 'pdf') {
        const src = await PDFDocument.load(att.buffer, { ignoreEncryption: true });
        const idxs = src.getPageIndices();
        // Only the selected pages become scope (see BidAttachment.pages).
        const keep = parsePageSpec(att.pages, idxs.length);
        const wanted = keep ? idxs.filter((_, i) => keep.has(i)) : idxs;
        const eps = await doc.embedPages(wanted.map((i) => src.getPage(i)));
        eps.forEach((ep, i) => items.push({
          type: 'pdf', ep, rot: src.getPage(wanted[i]).getRotation().angle,
          marks: (att.marks || []).filter((m) => m.page === wanted[i] + 1),
        }));
      } else if (kind === 'jpg') { items.push({ type: 'img', img: await doc.embedJpg(att.buffer) }); }
      else if (kind === 'png') { items.push({ type: 'img', img: await doc.embedPng(att.buffer) }); }
    } catch { /* skip unreadable attachment */ }
    if (att.label && items.length > before) items[before].label = att.label;
  }
  if (!items.length) {
    const err: any = new Error(`The bid document could not be embedded ${where} — only PDF, JPG or PNG files can be embedded. Replace the bid attachment with one of those formats and generate again.`);
    err.code = 'NO_SCOPE';
    throw err;
  }
  return items;
}

/**
 * Lay bid items out: the first onto `firstPage` starting at `firstTop`, each
 * further one onto a full page of its own. Captions and marks are drawn with it.
 */
export function placeBidItems(doc: PDFDocument, items: BidItem[], firstPage: PDFPage, firstTop: number, bold: PDFFont): void {
  const caption = (pg: PDFPage, label: string | undefined, top: number) => {
    if (!label) return top;
    const w = bold.widthOfTextAtSize(label, 9);
    pg.drawText(label, { x: (PAGE_W - w) / 2, y: top - 10, size: 9, font: bold, color: rgb(0, 0, 0) });
    return top - 16;
  };
  const top0 = caption(firstPage, items[0].label, firstTop);
  const box0 = placeItem(firstPage, items[0], MARGIN, top0, CONTENT_W, top0 - BOTTOM);
  if (items[0].marks?.length) drawMarks(firstPage, box0, items[0].marks!, bold);
  for (let i = 1; i < items.length; i++) {
    const pg = doc.addPage([PAGE_W, PAGE_H]);
    const top = caption(pg, items[i].label, PAGE_H - MARGIN);
    const box = placeItem(pg, items[i], MARGIN, top, CONTENT_W, top - BOTTOM);
    if (items[i].marks?.length) drawMarks(pg, box, items[i].marks!, bold);
  }
}

/* ---------- plain-text exhibit pages (lien waivers) ---------- */
export function exhibitText(doc: PDFDocument, roman: PDFFont, bold: PDFFont, body: string, head1: string, head2: string): void {
  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = TOP;
  const center = (txt: string, size: number, f: PDFFont) => {
    const w = f.widthOfTextAtSize(txt, size);
    page.drawText(txt, { x: (PAGE_W - w) / 2, y, size, font: f, color: rgb(0, 0, 0) });
    y -= size + 8;
  };
  center(head1, 13, bold);
  center(head2, 11, bold);
  y -= 10;
  // wrap body paragraphs
  for (const para of body.split('\n')) {
    if (para.trim() === '') { y -= 10; continue; }
    const words = para.split(/\s+/);
    let line = '';
    const draw = (t: string) => { page.drawText(t, { x: MARGIN, y, size: 11, font: roman, color: rgb(0, 0, 0) }); y -= LEADING; };
    for (const wd of words) {
      const test = line ? line + ' ' + wd : wd;
      if (roman.widthOfTextAtSize(test, 11) > CONTENT_W && line) {
        if (y < BOTTOM) { page = doc.addPage([PAGE_W, PAGE_H]); y = TOP; }
        draw(line); line = wd;
      } else line = test;
    }
    if (line) { if (y < BOTTOM) { page = doc.addPage([PAGE_W, PAGE_H]); y = TOP; } draw(line); }
    y -= 6;
  }
}

/* ---------- In-app countersign: stamp a signature PNG onto an existing PDF ----------
   (page/xPct/yPct come from a click in the UI, measured from the page's top-left;
   optionally fills the Name/Title/Date lines using the Monarch template spacing.) */
export interface StampOpts {
  page: number;              // 1-based page number
  xPct: number; yPct: number;  // click point (signature bottom-left), fraction of page size from TOP-left
  widthPct?: number;         // signature width as fraction of page width (default 0.20)
  name?: string; title?: string; dateText?: string;
  fillLines?: boolean;       // also print Name/Title/Date at template offsets below the signature
}

export async function stampSignature(pdfBytes: Buffer, sigPng: Buffer, o: StampOpts): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = doc.getPages();
  const idx = Math.min(Math.max(1, Math.round(o.page)), pages.length) - 1;
  const pg = pages[idx];
  const { width: pw, height: ph } = pg.getSize();
  const img = await doc.embedPng(sigPng);
  const sigW = pw * (o.widthPct && o.widthPct > 0.05 && o.widthPct < 0.8 ? o.widthPct : 0.2);
  const sigH = sigW * (img.height / img.width);
  const x = Math.max(0, Math.min(1, o.xPct)) * pw;
  const yTop = Math.max(0, Math.min(1, o.yPct)) * ph;
  const y = ph - yTop;                       // convert top-left fraction → PDF bottom-left coords
  pg.drawImage(img, { x, y, width: sigW, height: sigH });
  const roman = await doc.embedFont(StandardFonts.TimesRoman);
  if (o.fillLines !== false) {
    // Template spacing under the "By:" line: Name (-30), Title (-48), Date (-66).
    const put = (v: string | undefined, dy: number) => {
      if (v && v.trim()) pg.drawText(v.trim(), { x: x + 38, y: y - dy, size: 10, font: roman, color: rgb(0, 0, 0) });
    };
    put(o.name, 30);
    put(o.title, 48);
    put(o.dateText, 66);
  }
  return doc.save();
}
