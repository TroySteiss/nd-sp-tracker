import { readFileSync, writeFileSync } from 'node:fs';

const path = 'seed/initial-data.json';
const data = JSON.parse(readFileSync(path, 'utf8'));

const OWNER = {
  SPND: 'MIMG CCXXXI South Pointe Sub, LLC',
  BCND: 'MIMG CCLIV Bison Crossing Sub, LLC',
  PHND: 'MIMG CCLX Plantation Sub, LLC',
  CLND: 'MIMG CCXXXI Commons Sub, LLC',
  ECND: 'MIMG CCLIV Elk Crossing Sub, LLC',
  TCND: 'MIMG CCXXXI Chateau Sub, LLC',
  FHND: 'MIMG CCLX Fair Hills Sub, LLC',
};
for (const p of data.properties) {
  p.ownerEntity = p.ownerEntity || OWNER[p.code] || '';
  p.contractCode = p.contractCode || p.code;
  p.address = p.address || '';
  p.ownerNoticeAddr = p.ownerNoticeAddr || '';
}

data.contracts = [
  ['C001','SPND','SPND_Unit316_KevinsPlumbing_06082026_Unexecuted.pdf',"Kevin's Plumbing and Heating, Inc.",5925.00,'2026-06-08','2026-07-08','HVAC replacement — Unit 316 (Q2747)'],
  ['C002','BCND','BCND_LandscapeElements_06092026_Unexecuted.pdf','Landscape Elements ND LLC',4980.00,'2026-06-09','2026-07-09','Office landscaping — Estimate 4312'],
  ['C003','PHND','PHND_SummitFire_06092026_Unexecuted.pdf','Summit Fire Protection Co',5580.00,'2026-06-09','2026-07-09','Annual fire inspections (6 buildings)'],
  ['C004','CLND','CLND_LegendLawn_06092026_Unexecuted.pdf','Legend Lawn Maintenance LLC',5655.00,'2026-06-09','2026-07-09','Hydroseed repair — Landing Bldg 1910B'],
  ['C005','ECND','ECND_AEYRoofing_06112026_Unexecuted.pdf','AEY Roofing Contractors',8985.00,'2026-06-11','2026-07-13','Roof repairs all buildings + lift'],
  ['C006','BCND','BCND_KeyTrak_07012026_Unexecuted.pdf','KeyTrak Inc',29493.54,'2026-07-01','2027-06-30','KeyTrak EDGE 600 key control system'],
  ['C007','SPND','SPND_Unit201_KevinsPlumbing_06122026_Unexecuted.pdf',"Kevin's Plumbing and Heating, Inc.",5925.00,'2026-06-12','2027-06-30','HVAC replacement — Unit 201 (Q2760)'],
  ['C008','BCND','BCND_DeckedOut_06152026_Unexecuted.pdf','Decked Out LLC',4000.00,'2026-06-15','2027-07-15','Deck post replacement + reattachment (4304 16th Ave W)'],
  ['C009','SPND','SPND_KevinsPlumbing_06152026_Unexecuted.pdf',"Kevin's Plumbing and Heating, Inc.",11850.00,'2026-06-15','2027-07-15','HVAC replacement — Units 201 & 306 (2 bids combined)'],
  ['C010','CLND','CLND_LegendLawn_06182026_Unexecuted.pdf','Legend Lawn Maintenance LLC',29100.00,'2026-06-18','2027-08-19','French drain install — Commons (#1051 $13,500) + Landing (#1050 $15,600)'],
  ['C011','TCND','TCND_ToddFerm_06182026_Unexecuted.pdf','Todd Ferm Construction LLC',27830.00,'2026-06-18','2027-08-19','Concrete — curb, gutter, sidewalk, entry replacement (Estimate #1020)'],
  ['C012','CLND','CLND_BechtoldPaving_06222026_Unexecuted.pdf','Bechtold Paving Inc',14300.00,'2026-06-22','2026-08-22','Storm drain corrections — manhole/gate valve/asphalt patching'],
  ['C013','SPND','SPND_ToddFerm_06222026_Unexecuted.pdf','Todd Ferm Construction LLC',30700.00,'2026-06-22','2026-08-22','Concrete — 6 patios, 2 approaches, sidewalk R&R (Estimate #1019)'],
  ['C014','ECND','ECND_LandscapeElements_06232026_Unexecuted.pdf','Landscape Elements ND LLC',5200.00,'2026-06-23','2026-08-23','Parking lot line striping — Estimate 4318'],
  ['C015','FHND','FHND_TheLineGuys_06232026_Unexecuted.pdf','The Line Guys LLP',7618.00,'2026-06-23','2026-08-23','Parking lot striping — 157 spaces, 12 ADA, curb/fire lane (Estimate #109)'],
  ['C016','PHND','PHND_TopTierServices_06232026_Unexecuted.pdf','Top Tier Services LLC',8770.00,'2026-06-23','2026-08-23','Parking lot sweep & restriping'],
].map(([id, property, outputFilename, contractor, total, effectiveDate, termEnd, scope]) => ({
  id, projectId: null, property, outputFilename,
  ownerEntity: OWNER[property] || '', contractor, total, effectiveDate, termEnd, scope, fileKey: null,
}));

writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log(`Patched seed: ${data.properties.length} properties with owner entities, ${data.contracts.length} contracts.`);
