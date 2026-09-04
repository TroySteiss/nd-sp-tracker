// Dump a generated change order as text (+ optionally the PDF) so a wording or
// layout change can be reviewed as a diff, the same way contract-snapshot.mjs
// and multi-snapshot.mjs work. Usage:
//   npx tsx scripts/change-order-snapshot.mjs <out.txt> [out.pdf]
import { writeFileSync } from 'node:fs';
import { buildChangeOrder } from '../src/change-order.js';
import { pdfText } from './pdf-text.mjs';

const outTxt = process.argv[2] || 'change-order-snapshot.txt';
const outPdf = process.argv[3];

const cases = [
  {
    label: 'SP contract — first change order, added days',
    vars: {
      changeOrderNo: '1',
      dateText: '08/25/2026',
      agreementRef: 'Independent Contractor Agreement dated 05/12/2026 — Dakota Roofing LLC (SPND_DakotaRoofing_05122026_Unexecuted.pdf)',
      contractorBlock: 'Dakota Roofing LLC\n2200 Industrial Dr\nBismarck, ND 58501',
      ownerBlock: 'MIMG CCXXXI South Pointe Sub LLC\n1301 31st Ave SW #108\nMinot, ND 58701',
      description: 'Replace decking on buildings 3 and 4 found rotted after tear-off (48 sheets 7/16" OSB), per the unit pricing in the original bid. All work per the original scope and specifications otherwise.',
      additionalDays: '10',
      previousSum: '$184,500.00',
      revisedSum: '$189,780.00',
    },
  },
  {
    label: 'Multi-entity contract — second change order, no added days, long owner list',
    vars: {
      changeOrderNo: '2',
      dateText: '08/25/2026',
      agreementRef: 'Independent Contractor Agreement dated 09/01/2025 — Legend Lawn Service LLC',
      contractorBlock: 'Legend Lawn Service LLC\nPO Box 1443\nMinot, ND 58702',
      ownerBlock: 'MIMG CCXXXI South Pointe Sub LLC\n1301 31st Ave SW #108, Minot, ND 58701\n\nMIMG CCXXXI Commons Sub LLC\n1301 31st Ave SW #108, Minot, ND 58701\n\nMIMG CCXXXI Chateau Sub LLC\n1301 31st Ave SW #108, Minot, ND 58701',
      description: 'Add weekly parking-lot sweeping at The Commons and Chateau, April through October, at $180.00 per visit per property.',
      additionalDays: 'NONE',
      previousSum: '$330,000.00',
      revisedSum: '$342,600.00',
    },
  },
];

let out = '';
let pdfBytes = null;
for (const c of cases) {
  const bytes = await buildChangeOrder(c.vars);
  if (!pdfBytes) pdfBytes = bytes;
  out += `\n===================== ${c.label} =====================\n`;
  out += await pdfText(Buffer.from(bytes));
}

// The one-page rule: an over-long description must refuse, not truncate.
let refused = false;
try {
  await buildChangeOrder({ ...cases[0].vars, description: 'word '.repeat(2000) });
} catch (e) { refused = e && e.code === 'TOO_LONG'; }
out += `\n===================== over-long description =====================\n`;
out += refused ? 'REFUSED (TOO_LONG) — correct\n' : 'NOT REFUSED — BUG\n';

writeFileSync(outTxt, out);
if (outPdf && pdfBytes) writeFileSync(outPdf, Buffer.from(pdfBytes));
console.log(`wrote ${outTxt}${outPdf ? ' and ' + outPdf : ''}`);
