// Render the multi-entity contract and dump its extracted text, so the template
// can be proof-read without opening a PDF viewer.
//
//   npm run build:server && node scripts/multi-snapshot.mjs out.txt [out.pdf]
//
// Reproduces the inputs of the executed Minot Crystal Clear contract (9.2024) so
// the generated wording can be compared against the real document side by side.
import { writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { buildMultiContract, multiSectionList } from '../dist/src/contract-multi.js';
import { pdfText } from './pdf-text.mjs';

const out = process.argv[2];
const pdfOut = process.argv[3];
if (!out) { console.error('usage: node scripts/multi-snapshot.mjs <outfile.txt> [outfile.pdf]'); process.exit(1); }

async function fakeBid() {
  const d = await PDFDocument.create();
  const f = await d.embedFont(StandardFonts.Helvetica);
  const p = d.addPage([612, 792]);
  p.drawText('CRYSTAL-CLEAR SERVICES - WINDOW CLEANING BID', { x: 50, y: 700, size: 13, font: f, color: rgb(0, 0, 0) });
  p.drawText('South Pointe .......... $8,649.28', { x: 50, y: 660, size: 11, font: f, color: rgb(0, 0, 0) });
  p.drawText('The Plaza ............. $38,273.04', { x: 50, y: 640, size: 11, font: f, color: rgb(0, 0, 0) });
  p.drawText('The Chateau ........... $9,027.68', { x: 50, y: 620, size: 11, font: f, color: rgb(0, 0, 0) });
  return Buffer.from(await d.save());
}

const OFFICE = '1909 31st Ave SW, Minot, ND 58701';
const vars = {
  effectiveDate: '09/01/2024',
  entities: [
    { entity: 'MIMG CCXXXI South Pointe Sub LLC', propertyName: 'South Pointe', address: '1201 31st Ave SW, Minot, ND 58701',
      noticeAddr: OFFICE, noticePhone: '701-394-5494', noticeEmail: 'spndmanager@monarchinvestment.com', sum: '$8,649.28' },
    { entity: 'MIMG CCXXXI Plaza Sub LLC', propertyName: 'The Plaza', address: '3015 16th Street SW, Minot, ND 58701',
      noticeAddr: OFFICE, noticePhone: '701-394-5494', noticeEmail: 'spndmanager@monarchinvestment.com', sum: '$38,273.04' },
    { entity: 'MIMG CCXXXI Chateau Sub LLC', propertyName: 'The Chateau', address: '1705 2nd Ave SW, Minot, ND 58701',
      noticeAddr: OFFICE, noticePhone: '701-394-5494', noticeEmail: 'spndmanager@monarchinvestment.com', sum: '$9,027.68' },
  ],
  contractorName: 'Crystal-Clear Services',
  contractorAddr: 'P.O. Box 9171, Rochester, MN 55903',
  contractorPhone: '507-208-2502',
  contractorEmail: 'matt.dohrmann@yahoo.com',
  contractType: 'Bid Contract',
  ownerReps: [
    { name: 'Riley Combs', email: 'rcombs@monarchinvestment.com' },
    { name: 'Troy Steiss', email: 'tsteiss@monarchinvestment.com' },
    { name: 'Holly Haman', email: 'hhaman@monarchinvestment.com' },
    { name: 'Kara Garrison', email: 'kgarrison@monarchinvestment.com' },
  ],
  workCompletionDate: 'November 30, 2024',
  contractSum: '$55,950.00',
  liquidatedPerDay: '$250',
  workDays: 'Monday, Tuesday, Wednesday, Thursday and Friday',
  workStart: '8:00 a.m.',
  workEnd: '6:00 p.m.',
  insuranceDeductible: '$100,000.00',
  ongoingPeriod: 'monthly',
  exhibitBText: '',
};

const bid = await fakeBid();
const report = ['=== multiSectionList() ==='];
multiSectionList().forEach((s, i) => report.push(`${i + 1}\t${s.slug}\t${s.title}`));

const built = await buildMultiContract(vars, [{ buffer: bid, name: 'bid.pdf' }]);
const pages = await pdfText(built.bytes);
report.push('', `=== rendered ===`, `pages: ${pages.length}`, `sigAnchor: ${JSON.stringify(built.sigAnchor)}`);
pages.forEach((t, i) => report.push('', `--- p${i + 1} ---`, t));

// Single entity must also work — the template is used for two-property jobs too.
const solo = await buildMultiContract({ ...vars, entities: [vars.entities[0]] }, [{ buffer: bid, name: 'bid.pdf' }]);
report.push('', '=== single entity ===', `pages: ${(await pdfText(solo.bytes)).length}`);

/* Up-front vs ongoing: each property must print as TWO separate line items, in
   Section 1 and again in Exhibit B, so a one-time mobilisation charge can never
   be read as part of the recurring fee. The third property carries only an
   ongoing amount, to prove a blank side prints nothing rather than "$". */
{
  const split = {
    ...vars,
    contractSum: '$84,000.00',
    entities: [
      { ...vars.entities[0], sum: '', upfront: '$2,400.00', ongoing: '$1,200.00' },
      { ...vars.entities[1], sum: '', upfront: '$3,600.00', ongoing: '$1,800.00' },
      { ...vars.entities[2], sum: '', upfront: '', ongoing: '$900.00' },
    ],
  };
  const built = await buildMultiContract(split, [{ buffer: bid, name: 'bid.pdf' }]);
  const pages = await pdfText(built.bytes);
  const all = pages.join('\n');
  const sec1 = all.slice(all.indexOf('1. General Terms'), all.indexOf('2. Services'));
  const exB = pages.find((p) => p.startsWith('EXHIBIT B')) || '';
  report.push('', '=== up front vs ongoing ===',
    '--- section 1 breakdown ---', sec1.slice(sec1.indexOf('"Contract Sum"')),
    '--- exhibit B ---', exB);
  // A blank side must not emit an empty item.
  report.push(`chateau up-front item present (should be false): ${/The Chateau \(up front\)/.test(all)}`);
  // And the quarterly label must follow ongoingPeriod.
  const q = await buildMultiContract({ ...split, ongoingPeriod: 'quarterly' }, [{ buffer: bid, name: 'bid.pdf' }]);
  const qAll = (await pdfText(q.bytes)).join('\n');
  report.push(`quarterly label used: ${/South Pointe \(quarterly\)/.test(qAll)}`);
}

report.push('', '=== refusals ===');
for (const [label, ents] of [['no entities', []], ['unnamed entity', [{ entity: '  ', propertyName: 'The Plaza', address: 'x' }]]]) {
  try {
    await buildMultiContract({ ...vars, entities: ents }, [{ buffer: bid, name: 'bid.pdf' }]);
    report.push(`${label}: NO THROW (regression!)`);
  } catch (e) { report.push(`${label}: ${e.code} ${e.message}`); }
}
// Every {SEC:} reference in this template points at its OWN section (5.b, 11, 12.a-c),
// so omitting a section always takes its references with it and no omission can
// leave a dangling number. Assert that, so adding a genuine cross-section
// reference later shows up here as a change rather than a silent new failure mode.
{
  const omitted = [];
  for (const { slug } of multiSectionList()) {
    try { await buildMultiContract(vars, [{ buffer: bid, name: 'bid.pdf' }], { omitSections: [slug] }); }
    catch (e) { omitted.push(`${slug}: ${e.message}`); }
  }
  report.push(omitted.length
    ? `omitting a single section throws for:\n  ${omitted.join('\n  ')}`
    : 'every section can be omitted individually (all cross-refs are self-refs)');
}
try {
  await buildMultiContract(vars, [{ buffer: Buffer.from('nope'), name: 'x.txt' }]);
  report.push('no-scope: NO THROW (regression!)');
} catch (e) { report.push(`no-scope: ${e.code} ${e.message}`); }

writeFileSync(out, report.join('\n') + '\n');
if (pdfOut) writeFileSync(pdfOut, Buffer.from(built.bytes));
console.log('wrote', out, pdfOut ? `and ${pdfOut}` : '');
