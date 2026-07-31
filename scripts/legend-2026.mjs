// Build the Legend Lawn 2026-27 annual maintenance contract from Bid #1150.
//
//   npm run build:server && node scripts/legend-2026.mjs <bid.pdf> <out.pdf>
//
// A worked example of the service profile: no liquidated damages, no stated work
// hours, no construction apparatus, billed monthly, Exhibits A & B on one page.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildMultiContract } from '../dist/src/contract-multi.js';

const [, , bidPath, outPath] = process.argv;
if (!bidPath || !outPath) { console.error('usage: node scripts/legend-2026.mjs <bid.pdf> <out.pdf>'); process.exit(1); }

/* Bid #1150, 07/10/2026 — $29,450.00 per month across the five Minot sites. */
const MONTHLY = 29450;
const TERM_MONTHS = 12;
const usd = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const E = (entity, propertyName, address, noticePhone, monthly) =>
  ({ entity, propertyName, address, noticePhone, noticeEmail: 'hhaman@monarchinvestment.com', ongoing: usd(monthly) });

const vars = {
  effectiveDate: '09/01/2026',
  workCompletionDate: '08/31/2027',
  entities: [
    E('MIMG CCXXXI Commons Sub LLC', 'The Commons and Landing at Southgate', '1909 31st Ave SW, Minot, ND 58701', '701-892-8276', 6850),
    E('MIMG CCXXXI South Pointe Sub LLC', 'South Pointe', '1301 31st Ave SW #108, Minot, ND 58701', '701-394-5494', 7000),
    E('MIMG CCXXXI Chateau Sub LLC', 'The Chateau', '1725 2nd Ave SW, Minot, ND 58701', '701-380-8326', 3500),
    E('MIMG CCXXXI Plaza Sub LLC', 'The Plaza', '3015 16th Street SW, Minot, ND 58701', '701-515-9159', 4700),
    E('MIMG CCXLVIII The Wyatt Master LLC', 'The Wyatt at Northern Lights', '1410 30th Ave NW, Minot, ND 58703', '701-852-9500', 7400),
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
  contractSum: usd(MONTHLY * TERM_MONTHS),
  billing: 'monthly',
  exhibitBText: `${usd(MONTHLY * TERM_MONTHS)}, per bid in Exhibit A.\n\n`
    + `This price includes a total of ${usd(MONTHLY)} per month for ${TERM_MONTHS} months, from September 2026 to August 2027.`,
};

const built = await buildMultiContract(vars, [{ buffer: readFileSync(bidPath), name: 'Monarch 2026-27 Annual Maintenance Estimate.pdf' }]);
writeFileSync(outPath, Buffer.from(built.bytes));
console.log(`wrote ${outPath} — Contract Sum ${vars.contractSum} (${usd(MONTHLY)}/mo x ${TERM_MONTHS})`);
