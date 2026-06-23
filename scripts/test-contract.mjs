import { readFileSync, writeFileSync } from 'node:fs';
import { buildContract } from '../dist/src/contract.js';

const bid = readFileSync('C:/Users/TroySteiss/Downloads/The commons & landing quote 5-7-2026-Bechtold Paving.pdf');

const vars = {
  effectiveDate: '06/23/2026',
  termEndDate: '08/22/2026',
  ownerEntity: 'MIMG CLND Commons Sub, LLC',
  contractorName: 'Bechtold Paving LLC',
  propertyName: 'The Commons & Landing',
  propertyAddr: '100 Southgate Dr, Minot, ND 58701',
  ownerNoticeAddr: '100 Southgate Dr, Minot, ND 58701',
  contractorAddr: '123 Main St, Minot, ND 58701',
  contractTotal: '$30,700.00',
};

const pdf = await buildContract(vars, [{ buffer: bid, name: 'bechtold.pdf' }]);
writeFileSync('C:/Users/TroySteiss/Downloads/_TEST_contract_output.pdf', Buffer.from(pdf));
console.log('wrote _TEST_contract_output.pdf, bytes:', pdf.length);
