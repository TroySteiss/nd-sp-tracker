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
  workCompletionDate: '11/30/2024',
  contractSum: '$55,950.00',
  // The default shape: a recurring service agreement. No liquidated damages, no
  // stated work hours, no construction apparatus.
  billing: 'monthly',
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
  const exB = pages.find((p) => p.startsWith('EXHIBIT A & B')) || '(EXHIBIT A & B page not found)';
  report.push('', '=== up front vs ongoing ===',
    '--- section 1 breakdown ---', sec1.slice(sec1.indexOf('"Contract Sum"')),
    '--- exhibit A & B ---', exB.slice(0, 900));
  // A blank side must not emit an empty item.
  report.push(`chateau up-front item present (should be false): ${/The Chateau \(up front\)/.test(all)}`);
  // And the quarterly label must follow ongoingPeriod.
  const q = await buildMultiContract({ ...split, billing: 'annual' }, [{ buffer: bid, name: 'bid.pdf' }]);
  const qAll = (await pdfText(q.bytes)).join('\n');
  report.push(`annual label used: ${/South Pointe \(annual\)/.test(qAll)}`);
}

/* The service default must leave the construction apparatus out entirely, and
   turning it back on must bring all of it back. These phrases are the tell. */
{
  const CONSTRUCTION_ONLY = ['punch-list', 'punch list', 'Certificate of Occupancy',
    'final drawings and specifications', 'Ownership of Drawings',
    'TIME IS OF THE ESSENCE', 'liquidated damages', 'between the hours of'];
  const svc = (await pdfText((await buildMultiContract(vars, [{ buffer: bid, name: 'bid.pdf' }])).bytes)).join('\n');
  const con = (await pdfText((await buildMultiContract({
    ...vars, construction: true, liquidatedPerDay: '$250',
    workDays: 'Mondays through Fridays', workStart: '8:00 AM', workEnd: '5:00 PM',
    insuranceDeductible: '$100,000.00',
  }, [{ buffer: bid, name: 'bid.pdf' }])).bytes)).join('\n');
  report.push('', '=== service default vs construction ===');
  for (const phrase of CONSTRUCTION_ONLY) {
    report.push(`  ${phrase.padEnd(34)} service:${svc.includes(phrase) ? 'PRESENT (should be absent!)' : 'absent'}  construction:${con.includes(phrase) ? 'present' : 'ABSENT (should be present!)'}`);
  }
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

/* ---------------------------------------------------------------------------
   The executed contract, reproduced.

   These are the exact inputs of the executed Legend Lawn Landscaping and Snow
   Contract 09.2025-08.2026, whose scan is where this template's language comes
   from. Dumping it as text is the check that matters: read it against the signed
   document and any drift shows up. If you change wording in contract-multi.ts,
   this is the section to re-read.
   --------------------------------------------------------------------------- */
{
  const E = (entity, propertyName, address, noticePhone) =>
    ({ entity, propertyName, address, noticePhone, noticeEmail: 'hhaman@monarchinvestment.com' });
  const legend = {
    effectiveDate: '09/01/2025',
    entities: [
      E('MIMG CCXXXI Commons Sub LLC', 'The Commons and Landing at Southgate', '1909 31st Ave SW, Minot, ND, 58701', '701-892-8276'),
      E('MIMG CCXXXI South Pointe Sub LLC', 'South Pointe', '1301 31st Ave SW #108, Minot, ND 58701', '701-394-5494'),
      E('MIMG CCXXXI Chateau Sub LLC', 'The Chateau', '1725 2nd Ave SW, Minot, ND 58701', '701-380-8326'),
      E('MIMG CCXXXI Plaza Sub LLC', 'The Plaza', '3015 16th Street SW, Minot, ND 58701', '701-515-9159'),
      E('MIMG CCXLVIII The Wyatt Master LLC', 'The Wyatt at Northern Lights', '1410 30th Ave NW, Minot, ND 58703', '701-852-9500'),
    ],
    contractorName: 'Legend Lawn Maintenance LLC',
    contractorAddr: '701 Surrey Ave, Surrey, ND 58785',
    contractorPhone: '701-509-7670',
    contractorEmail: 'kris.spaulding@yahoo.com',
    contractType: 'Bid Contract',
    ownerReps: [
      { name: 'Riley Combs', email: 'rcombs@monarchinvestment.com' },
      { name: 'Troy Steiss', email: 'tsteiss@monarchinvestment.com' },
      { name: 'Kara Garrison', email: 'kgarrison@monarchinvestment.com' },
    ],
    workCompletionDate: '08/31/2026',
    contractSum: '$330,000.00',
    liquidatedPerDay: '$100',
    construction: true,
    workDays: 'Mondays through Fridays',
    workStart: '8:00 AM',
    workEnd: '5:00 PM',
    insuranceDeductible: '$100,000.00',
    billing: 'monthly',
    exhibitBText: '$330,000.00, per bid in Exhibit A.\n\nThis price includes a total of $27,500 per month for 12 months, from September 2025 to August 2026.\n\nPlease note, the work at The Wyatt at Northern Lights is subject to a purchase closing date on or before September 1, 2025. If closing occurs after September 1, 2025, then work will begin starting on the closing date & the amount due for the first month will be prorated based on the number of days serviced for that month.',
  };
  const b = await buildMultiContract(legend, [{ buffer: bid, name: 'bid.pdf' }]);
  const pages = await pdfText(b.bytes);
  report.push('', '=== executed Legend Lawn contract, reproduced ===',
    `pages: ${pages.length}`, `sigAnchor: ${JSON.stringify(b.sigAnchor)}`);
  pages.forEach((t, i) => report.push('', `--- p${i + 1} ---`, t));
  if (pdfOut) writeFileSync(pdfOut.replace(/\.pdf$/, '') + '-legend.pdf', Buffer.from(b.bytes));
}

writeFileSync(out, report.join('\n') + '\n');
if (pdfOut) writeFileSync(pdfOut, Buffer.from(built.bytes));
console.log('wrote', out, pdfOut ? `and ${pdfOut} (+ -legend.pdf)` : '');
