// Snapshot the generated contracts as extracted TEXT, for refactor verification.
//
//   npm run build:server
//   node scripts/contract-snapshot.mjs /tmp/before.txt
//   ...refactor...
//   npm run build:server && node scripts/contract-snapshot.mjs /tmp/after.txt
//   diff /tmp/before.txt /tmp/after.txt
//
// Compare TEXT, never bytes: pdf-lib's output is not byte-deterministic (the same
// content differs by a couple of bytes per run), so a checksum can't distinguish a
// clean refactor from a regression.
import { writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { buildContract, contractSectionList } from '../dist/src/contract.js';
import { pdfText } from './pdf-text.mjs';

const out = process.argv[2];
if (!out) { console.error('usage: node scripts/contract-snapshot.mjs <outfile>'); process.exit(1); }

/* A synthetic two-page bid, so page selection and marks get exercised too —
   no dependency on a file in anyone's Downloads folder. */
async function fakeBid() {
  const d = await PDFDocument.create();
  const f = await d.embedFont(StandardFonts.Helvetica);
  for (const label of ['BID PAGE ONE - SCOPE AND PRICING', 'BID PAGE TWO - CONTRACTOR TERMS']) {
    const p = d.addPage([612, 792]);
    p.drawText(label, { x: 60, y: 700, size: 14, font: f, color: rgb(0, 0, 0) });
    p.drawText('Deposit of 50% due on signing.', { x: 60, y: 660, size: 11, font: f, color: rgb(0, 0, 0) });
  }
  return Buffer.from(await d.save());
}

const vars = {
  effectiveDate: '06/23/2026', termEndDate: '08/22/2026',
  ownerEntity: 'MIMG CCXXXI Commons Sub, LLC',
  contractorName: 'Bechtold Paving LLC',
  propertyName: 'The Commons & Landing',
  propertyAddr: '1909 31st Ave SW, Minot, ND 58701',
  ownerNoticeAddr: '1909 31st Ave SW, Minot, ND 58701',
  contractorAddr: '123 Main St, Minot, ND 58701',
  contractTotal: '$30,700.00',
};

const bid = await fakeBid();
const report = ['=== contractSectionList() ==='];
for (const s of contractSectionList()) report.push(`${s.slug}\t${s.title}`);

const cases = [
  ['plain', {}, {}],
  ['tailored', { excludedTerms: ['50% deposit on signing'], electedTerms: ['36-month term'], omitSections: ['clean-up'] },
   { pages: '1', marks: [{ page: 1, x: 0.1, y: 0.2, w: 0.5, h: 0.06, style: 'strike' }] }],
  ['covered', {}, { marks: [{ page: 2, x: 0.05, y: 0.1, w: 0.9, h: 0.1, style: 'cover' }] }],
];
for (const [name, opts, att] of cases) {
  const built = await buildContract(vars, [{ buffer: bid, name: 'bid.pdf', ...att }], opts);
  const pages = await pdfText(built.bytes);
  report.push('', `=== case ${name} ===`, `pages: ${pages.length}`, `sigAnchor: ${JSON.stringify(built.sigAnchor)}`);
  pages.forEach((t, i) => report.push(`--- p${i + 1} ---`, t));
}

// The two refusals that keep a bad contract from shipping must survive any refactor.
report.push('', '=== refusals ===');
// Payment cross-references only itself, so omitting it takes its own references
// with it and is legal. Contractor Representations is cited BY Payment — dropping
// that one must throw rather than ship a dangling "Section 6".
try {
  await buildContract(vars, [{ buffer: bid, name: 'bid.pdf' }], { omitSections: ['contractor-representations-warranties-and-compliance'] });
  report.push('omit-referenced-section: NO THROW (regression!)');
} catch (e) { report.push(`omit-referenced-section: ${e.message}`); }
try {
  await buildContract(vars, [{ buffer: Buffer.from('not a pdf'), name: 'x.txt' }], {});
  report.push('no-scope: NO THROW (regression!)');
} catch (e) { report.push(`no-scope: ${e.code} ${e.message}`); }

writeFileSync(out, report.join('\n') + '\n');
console.log('wrote', out);
