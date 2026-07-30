import { rgb, type PDFDocument, type PDFFont, type PDFPage } from 'pdf-lib';
import {
  Layout, MARGIN, CONTENT_W, PAGE_W, PAGE_H, TOP, BOTTOM, FIRST_INDENT,
  collectBidItems, placeBidItems, exhibitText, numberPages, sectionSlug,
  resolveCrossRefs, drawFormBox,
  type BidAttachment, type SigAnchor,
} from './contract-layout.js';

/* =============================================================================
   Multi-entity Independent Contractor Agreement — PDF generator.

   This is a SEPARATE TEMPLATE from src/contract.ts, not a variant of it. It is
   the agreement used for work spanning several properties owned by different
   LLCs (landscaping/snow, pest, pool). The wording differs throughout:

     - 27 numbered sections, against the Special Project template's 25
     - "Contract Sum" everywhere, never the SP template's "Contract Price"
     - Section 1 is a General Terms block (contract type, Owner's
       Representatives, Work Completion Date, Contract Sum)
     - liquidated damages per day, stated work hours, a warranty split into
       materials (1 yr) / workmanship (2 yr), Force Majeure, Owner's
       Representatives and Ownership of Drawings sections the SP template lacks
     - Exhibits A–E (the SP template has A&B, C, D)

   Source of the language: the executed Minot contracts on this template —
   "Minot Crystal Clear Projects Contract 9.2024.docx" for clean section text and
   the executed Legend Lawn 09.2025–08.2026 agreement for current structure.

   Two deliberate departures from the 2024 document:
     1. Section 12.c in that file requires insurers to be "licensed to do
        business in Kentucky" — carried over from another market and plainly
        wrong for North Dakota. It now tracks the Property, the same way
        Governing Law already does, so it can never be stale again.
     2. Entity names print EXACTLY as stored. They are legal names on signed
        paper, and the ", LLC" comma genuinely differs between entities, so
        nothing here normalises them. Get them right in properties.owner_entity.
   ============================================================================= */

/** One owning entity and the property it owns, as it appears in the agreement. */
export interface MultiEntity {
  /** Legal name of the LLC. Printed verbatim — see the note above. */
  entity: string;
  propertyName: string;
  address: string;
  /** Notice address, if notices go somewhere other than the property itself. */
  noticeAddr?: string;
  noticePhone?: string;
  noticeEmail?: string;
  /** This property's share of the Contract Sum, e.g. "$8,649.28". Optional. */
  sum?: string;
}

export interface MultiContractVars {
  effectiveDate: string;          // MM/DD/YYYY, or free text ("signing date")
  entities: MultiEntity[];
  contractorName: string;
  contractorAddr: string;
  contractorPhone?: string;
  contractorEmail?: string;
  /** Section 1 "Type of contract", e.g. "Bid Contract". */
  contractType: string;
  ownerReps: { name: string; email: string }[];
  workCompletionDate: string;
  contractSum: string;            // e.g. "$55,950.00"
  /** Liquidated damages per day past the completion date, e.g. "$100". */
  liquidatedPerDay: string;
  workDays: string;               // "Monday, Tuesday, Wednesday, Thursday and Friday"
  workStart: string;              // "8:00 a.m."
  workEnd: string;                // "5:00 p.m."
  /** Owner's own insurance deductible, cited in Ownership of Drawings. */
  insuranceDeductible: string;    // e.g. "$100,000.00"
  /** Exhibit B's free narrative (total, monthly amount, term, proration notes). */
  exhibitBText: string;
}

/** Same per-generation tailoring the SP template supports. */
export interface MultiContractOptions {
  omitSections?: string[];
  excludedTerms?: string[];
  electedTerms?: string[];
}

const BLANK: MultiContractVars = {
  effectiveDate: '', entities: [], contractorName: '', contractorAddr: '',
  contractType: '', ownerReps: [], workCompletionDate: '', contractSum: '',
  liquidatedPerDay: '', workDays: '', workStart: '', workEnd: '',
  insuranceDeductible: '', exhibitBText: '',
};

/** The section list with slugs — the builder UI renders this for its omit checkboxes. */
export function multiSectionList(): { slug: string; title: string }[] {
  return buildSections(BLANK).map((s) => ({ slug: sectionSlug(s.title), title: s.title }));
}

/* ---------- list formatting ---------- */

/** "A", "A and B", "A, B, and C" — the Oxford comma the executed contracts use. */
function andList(items: string[]): string {
  const xs = items.map((s) => String(s || '').trim()).filter(Boolean);
  if (!xs.length) return '';
  if (xs.length === 1) return xs[0];
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`;
  return `${xs.slice(0, -1).join(', ')}, and ${xs[xs.length - 1]}`;
}

const entityNames = (v: MultiContractVars) => andList(v.entities.map((e) => e.entity));
/** "South Pointe located at 1201 31st Ave SW, Minot, ND 58701, and ..." */
const propertyList = (v: MultiContractVars) =>
  andList(v.entities.map((e) => `${e.propertyName} located at ${e.address}`));
/** "MIMG ... Sub LLC located at 1201 31st Ave SW, ..." — Exhibit D's inline form. */
const entityLocatedList = (v: MultiContractVars) =>
  andList(v.entities.map((e) => `${e.entity} located at ${e.address}`));
const addressList = (v: MultiContractVars) => andList(v.entities.map((e) => e.address));
const noticeOf = (e: MultiEntity) => (e.noticeAddr && e.noticeAddr.trim()) ? e.noticeAddr.trim() : e.address;

/**
 * Group entities by the notice destination they share.
 *
 * A portfolio run from one management office (the Minot case) collapses to a
 * single block listing all three LLCs above one address — exactly how the
 * executed 2024 contract reads. Entities noticed separately get their own blocks.
 */
function noticeGroups(v: MultiContractVars): { names: string[]; addr: string; phone?: string; email?: string }[] {
  const out: { names: string[]; addr: string; phone?: string; email?: string }[] = [];
  for (const e of v.entities) {
    const addr = noticeOf(e);
    const key = `${addr}|${e.noticePhone || ''}|${e.noticeEmail || ''}`;
    const hit = out.find((g) => `${g.addr}|${g.phone || ''}|${g.email || ''}` === key);
    if (hit) hit.names.push(e.entity);
    else out.push({ names: [e.entity], addr, phone: e.noticePhone, email: e.noticeEmail });
  }
  return out;
}

/* =============================================================================
   Section text
   ============================================================================= */

function preambleParas(v: MultiContractVars): string[] {
  return [
    `This Independent Contractor Agreement ("Contract") is entered into and effective as of ${v.effectiveDate} ("Effective Date") between ${entityNames(v)} ("Owner"), and ${v.contractorName} ("Contractor"). This Contract concerns the real property known as ${propertyList(v)} ("Property"). The term "Contractor", as used in this Contract, means, collectively, Contractor, its agents, employees, successors and assigns.`,
    'Owner desires to engage Contractor for certain services or improvements to be completed at the Property in accordance with the plans and specifications attached hereto as Exhibit A and the terms and conditions set forth in this Contract. Owner and Contractor, for good and valuable consideration, the receipt and sufficiency of which are acknowledged, and intending to be legally bound, hereby agree as follows:',
  ];
}

/** Section 1's sub-items. A leading '' puts the title on a line of its own. */
function generalTerms(v: MultiContractVars): string[] {
  const paras = ['', `Type of contract: ${v.contractType}`];
  const reps = andList(v.ownerReps.map((r) => r.name));
  if (reps) paras.push(`"Owner's Representatives" means ${reps}.`);
  paras.push(`Work Completion Date: ${v.workCompletionDate}`);
  // The per-property breakdown is optional: a lump-sum service contract has none.
  const broken = v.entities.filter((e) => e.sum && e.sum.trim());
  if (broken.length) {
    paras.push(`"Contract Sum" ${v.contractSum} as broken out by property below:`);
    for (const e of broken) paras.push(`${e.propertyName}: ${e.sum!.trim()}`);
  } else {
    paras.push(`"Contract Sum" ${v.contractSum}`);
  }
  return paras;
}

function noticesParas(v: MultiContractVars): string[] {
  const paras = ['All notices required or permitted hereunder must be in writing and shall be deemed to have been given when mailed, postage prepaid, by U.S. registered or certified mail (with return receipt requested), by email (with proof of transmission) or by recognized overnight air courier service (with proof of delivery) to the notice addresses set forth below.'];
  for (const g of noticeGroups(v)) {
    // One entity per line, the way the executed contracts stack them, rather than
    // a single wrapped run of names.
    paras.push(`Owner: ${g.names[0]}`);
    for (const n of g.names.slice(1)) paras.push(n);
    paras.push(`Office Address: ${g.addr}`);
    const contact = [g.phone, g.email].filter((s) => s && String(s).trim()).join(', ');
    if (contact) paras.push(contact);
  }
  paras.push(`Contractor: ${v.contractorName}`);
  paras.push(v.contractorAddr);
  const cc = [v.contractorPhone, v.contractorEmail].filter((s) => s && String(s).trim()).join(' / ');
  if (cc) paras.push(cc);
  return paras;
}

function ownerRepsPara(v: MultiContractVars): string {
  const names = andList(v.ownerReps.map((r) => r.name));
  const emails = andList(v.ownerReps.map((r) => r.email));
  if (!names) return 'Copies of all notices and other communications under this Contract to the Owner or Owner\'s Representatives must be sent by email to the Owner\'s Representatives.';
  return `Copies of all notices and other communications under this Contract to the Owner or Owner's Representatives must be sent by email to ${names} at ${emails}.`;
}

function buildSections(v: MultiContractVars): { title: string; paras: string[] }[] {
  return [
    { title: 'General Terms', paras: generalTerms(v) },

    { title: 'Services and Scope of Work', paras: ['Contractor shall perform all work and/or services described in the Exhibits (as defined below) and change orders of such work; furnish all labor, materials, equipment, tools, supervision, machinery, site security, and supplies necessary to perform all work described in the Exhibits (including punch-list items); pay all applicable taxes and freight; and obtain all insurance, permits, licenses, and any other items necessary for the completion of all work described in the Exhibits (collectively, the "Work"). Exhibits A, B, C, D and E are incorporated herein and made part of this Contract (collectively, the "Exhibits").'] },

    { title: 'Notification by Contractor; Change Orders', paras: ['All drawings and/or specifications attached to this Contract are the final drawings and specifications of the Work (some details are not provided at time of signing; such as materials selections and exact elevations), and form an integral part of this Contract. Neither Party may add or otherwise vary additions said drawings and specifications without the prior written consent of the other Party. Contractor shall promptly notify Owner if any problems, questions, or complications arise that would alter the scope of Work or the Contract Sum. All changes or deviations in the Work must be approved in advance in writing as a change order, a form of which is attached as Exhibit E hereto and made part hereof. The Contract Sum will be increased or decreased accordingly by the parties\' agreement, as set forth in the change order. Any claims that the Contract Sum should be increased based on changes or deviations in the Work must be presented to the Owner by the Contractor in writing. The Owner\'s written approval of an increased Contract Sum increase must be obtained by the Contractor before any change or deviation in the Work is approved. **Notwithstanding the foregoing to the contrary, there will be no change orders permitted for underestimated costs.**'] },

    { title: 'Term', paras: ['This Contract shall remain in effect until the acceptance by Owner of all Work and the expiration of all express and implied guaranties and warranties unless sooner terminated in accordance with this Contract.'] },

    { title: 'Payment for Services and Contract Sum', paras: [
      '',
      'Contract Sum. Owner will pay Contractor the amount agreed to on Exhibit B for the satisfactory performance of the Work (the "Contract Sum"). The term "Contract Sum" includes all of Contractor\'s overhead, profits, general conditions (for example, insurance and licenses) and all applicable state and local sales and use taxes incurred by Contractor in the performance of the Work and its other obligations under this Contract.',
      'Progress Invoices and Payments. All invoices under this Contract must (i) be for Work actually completed (and for no other work) and (ii) must include executed conditional lien waivers for the amount invoiced in the form attached hereto as Exhibit C from the Contractor and all suppliers, materialmen and subcontractors that performed the work or provided materials during the period of time described in the invoice. Owner may withhold its final payment for the Work until all of the following has occurred: (a) Owner has completed its final walk through and inspection of the Work, as completed; (b) any and all punch list items have been completed to Owner\'s satisfaction; (c) a temporary Certificate of Occupancy or the equivalent has been issued by the approving governmental authority; and (d) Owner has received an executed final lien waiver from each of the Contractor and all subcontractors, materialmen and suppliers that have performed Work or supplied materials in connection therewith in the form attached hereto as Exhibit D. **Owner will have no obligation to pay any invoice that is not in accordance with this Section {SEC:payment-for-services-and-contract-sum}.b.** Payments due that have been properly invoiced under this Section {SEC:payment-for-services-and-contract-sum}.b but remain outstanding for a period of thirty (30) days following the date of the invoice will bear simple interest at the rate of two percent (2%) per annum from the date payment is due.',
    ] },

    { title: 'Time of Performance and Completion; Schedule', paras: [`Contractor shall perform the Work promptly and diligently and complete the Work (with the exception of any punch-list items) by ${v.workCompletionDate}. **TIME IS OF THE ESSENCE.** In the event the Contractor fails to complete the Work by ${v.workCompletionDate}, the Contract Sum will be reduced ${v.liquidatedPerDay} for each day after ${v.workCompletionDate} that the Work is not complete (exclusive of punch-list items). The Parties agree that ${v.liquidatedPerDay}/day for such delay is a fair and reasonable amount to be retained by Owner as agreed and liquidated damages in light of the adverse impact any delay in completion of the Work will have on Owner's business and other losses and costs incurred by Owner as a result of such delay and will not constitute a penalty or a forfeiture. Contractor shall coordinate the schedule of Work with Owner so as to minimize the inconvenience to residents at the Property. Unnecessary delay in completion of the Work caused by the Contractor may result in the termination of this Contract by Owner, at Owner's sole discretion. Work shall be provided only on ${v.workDays}, between the hours of ${v.workStart} and ${v.workEnd}. Contractor shall not perform any Work on weekends or holidays unless mutually agreed upon by Owner and Contractor in advance. Prior to beginning the Work, Contractor shall provide an estimated work schedule to be approved by Owner. Contractor shall follow the approved schedule as closely as possible.`] },

    { title: 'Contractor Representations, Warranties and Compliance', paras: ['Contractor represents that it has the right, ability (including all necessary licenses) and authorization to enter into this Contract and to fully perform all of the obligations in this Contract. Contractor shall comply, and take reasonable steps to ensure all subcontractors\', materialmen\'s and suppliers\' compliance, with all applicable federal, state, and local laws and regulations, including, without limitation, all state and local licensing and registration requirements for the Work. The Work shall be performed by individuals duly licensed and authorized by law to perform said work, to the extent required by law. All materials used in performing and/or constructing the Work shall be in compliance with all applicable laws and codes, and covered by a manufacturer\'s warranty, as applicable. Contractor represents that it and its subcontractors (if any) have the required skill, experience, and qualifications to perform the Work and shall perform, and ensure all performance by subcontractors of, the Work in a professional, good and workmanlike manner in accordance with generally recognized industry standards for similar work.'] },

    { title: 'Warranty', paras: ['Contractor warrants all materials and other personal property furnished by Contractor under this Contract to be free from all defects for a period of one (1) calendar year from the date the Work is finally accepted by Owner. Contractor warrants all workmanship performed under this Contract to be free from all defects for a period of two (2) calendar years from the date the Work is finally accepted by Owner. During the applicable warranty period, Contractor shall promptly, upon Owner\'s request, furnish all labor, materials, equipment, and other items necessary to correct or replace any defective work, materials or other personal property installed or furnished under this Contract, all at no additional cost to Owner.'] },

    { title: 'Subcontractors and Employees of Contractor', paras: ['Contractor is solely responsible for the supervision and direction of work by its employees and all subcontractors, suppliers, and materialmen. Neither Owner\'s approval of any subcontractor, suppliers, or materialmen, nor the failure of performance by such parties, shall relieve, release, or affect in any manner any of Contractor\'s duties, liabilities, or obligations under this Contract. Contractor agrees that Contractor\'s employees and any subcontractors, suppliers, or materialmen shall be properly qualified and shall use reasonable care in the performance of their duties. If, however, Owner determines, for any reason, that a particular employee, subcontractor, supplier, or materialman is unsatisfactory, upon written notice from Owner to Contractor, Contractor shall remove such person and shall provide a qualified substitute. Contractor shall timely pay all amounts owed to subcontractors, employees, suppliers and materialmen in connection with this Contract. **Notwithstanding anything else to the contrary in this Contract, in the event Owner receives notice or knowledge that there are outstanding amounts owed to any subcontractor, supplier or materialman, Owner may withhold or set off any payment or amounts otherwise owed to Contractor for work performed or materials or supplies provided under this Contract until Contractor submits evidence satisfactory to Owner that all amounts due to such persons in connection with this Contract have been paid and all applicable liens or claims for liens have been waived and released.**'] },

    { title: 'Relationship of the Parties', paras: ['This Contract shall not be construed to create an employer-employee relationship between Owner and Contractor or between Owner and any of Contractor\'s employees or any subcontractors, suppliers or materialmen. It is expressly understood that Contractor shall have the status of an independent contractor. Contractor has no authority to bind Owner, and Contractor shall not make any agreements or representations on Owner\'s behalf without Owner\'s prior written consent.'] },

    { title: 'Indemnification', paras: ['Contractor shall protect, defend, indemnify, and hold harmless Owner and its respective affiliates, managers, employees, agents, partners, officers, directors, attorneys, members, successors, and assigns against and from any and all claims, damages, liabilities, losses, causes of action, and costs and expenses of any kind and nature (including all out-of-pocket litigation costs and reasonable attorneys\' fees) directly or indirectly arising out of injury (including personal injury to or death of any person) and loss or damage to any property occurring in connection with or in any way incidental to the performance of the Work under this Contract, resulting in whole or in part from the Contractor\'s breach of this Contract or acts, errors, omissions or negligence of Contractor or its employees, agents, subcontractors, suppliers or materialmen under this Contract. Contractor shall further be responsible for and bear the cost of all losses sustained and damage to property of Owner and the other indemnified parties caused by Contractor\'s acts, or those of its employees, agents, or subcontractors, or subcontractors\' employees. Further, Contractor shall protect, defend, indemnify, and hold harmless Owner and its respective affiliates, managers, employees, agents, partners, officers, directors, attorneys, members, successors, and assigns against and from any claims with respect to, including (but not limited to) liability insurance, workers\' compensation or tax withholding respecting Contractor\'s employees, subcontractors, suppliers and materialmen. Contractor\'s liability under this Contract will not be limited. The provisions of this Section {SEC:indemnification} shall survive the expiration or termination of this Contract.'] },

    { title: 'Insurance', paras: [
      '',
      'Contractor\'s Insurance. Contractor represents and warrants that it is adequately insured for injury to its employees and others incurring loss or injury as a result of the acts of the Contractor or its employees, subcontractors, suppliers or materialmen. Prior to commencing any Work, Contractor shall provide certificates of adequate and current insurance coverage for (a) commercial general liability insurance with a combined single limit of not less than $1,000,000 per occurrence and a $5,000,000 aggregate liability limit; (b) worker\'s compensation insurance with not less than $1,000,000 per accident, $1,000,000 disease, policy limit and $1,000,000 disease limit for each employee; (c) excess umbrella liability insurance in the amount of $5,000,000; and (d) automobile insurance that satisfies applicable state automobile insurance coverage requirements. Owner, Owner\'s mortgage lender(s), and Monarch Investment & Management Group, LLC shall be listed as additional insureds under all insurance policies required under this Section {SEC:insurance}.a. Contractor shall maintain the insurance policies required under this Section {SEC:insurance}.a in effect throughout the term of this Contract. Contractor acknowledges that it is solely responsible for obtaining and maintaining the insurance coverages required under this Section {SEC:insurance}.a.',
      'Subcontractors\' Insurance. Contractor shall ensure that each subcontractor performing Work is adequately insured for injury to its employees and others incurring loss or injury as a result of the acts of the subcontractor or its employees, subcontractors, suppliers or materialmen. Prior to commencing work on the Property, each subcontractor must provide Owner with certificates of adequate and current insurance coverage for (a) commercial general liability insurance with a combined single limit of not less than $1,000,000 per occurrence and a $2,000,000 aggregate liability limit and (b) automobile insurance that satisfies applicable state automobile insurance coverage requirements. Owner, Owner\'s lender(s), and Monarch Investment & Management Group, LLC shall be listed as additional insureds under all insurance policies required under this Section {SEC:insurance}.b. All subcontractors performing Work shall maintain the insurance policies required under this Section {SEC:insurance}.b in effect throughout the term of this Contract.',
      // The 2024 document named Kentucky here — a leftover from another market.
      // Tracking the Property means this clause is right in every region and can
      // never go stale again.
      'General Requirements. The policies required under Section {SEC:insurance} shall be with companies rated A- X or better by A.M. Best. Insurers shall be licensed to do business in each state in which the Property is located and domiciled in the USA. Any deductible amounts under any insurance policies required hereunder shall not exceed $5,000.',
      'Waiver of Subrogation. The parties hereby mutually waive their respective rights of recovery against each other for any loss of, or damage to, either party\'s property, to the extent that such loss or damage is insured by an insurance policy in effect at the time of such loss or damage. Each party shall obtain any special endorsements, if required by its insurer whereby the insurer waives its rights of subrogation against the other party. The provisions of this clause shall not apply in those instances in which waiver of subrogation would cause either party\'s insurance coverage to be voided or otherwise made uncollectible.',
    ] },

    { title: 'Termination', paras: ['Owner may terminate this Contract at any time without cause upon written notice to Contractor. In the event of such termination, Owner will pay Contractor for all work properly performed hereunder and acceptable to Owner up to the date of termination. Owner will have no further obligation or liability to Contractor. Contractor may terminate this Contract for cause only after providing Owner with written notice indicating the area of default under this Contract and allowing for fourteen (14) days for Owner to cure the alleged default and respond in writing.'] },

    { title: 'Force Majeure', paras: ['Notwithstanding the foregoing to the contrary, any delay or failure in the performance by Owner or Contractor shall be excused if and to the extent caused by the occurrence of a force majeure. For purposes of this Contract, force majeure means an event that is not reasonably foreseeable or otherwise caused by or under the control of the party claiming force majeure, including acts of God, governmental acts, injunctions, labor strikes, wars, and other like events that are beyond the reasonable anticipation and control of the party, despite the party\'s reasonable efforts to prevent, delay, or mitigate the effect of such events.'] },

    { title: 'Access to Work', paras: ['The Owner, the Owner\'s representatives, and public authorities shall at all times have access to the Work.'] },

    { title: 'No Implied Waiver', paras: ['The failure of either party to insist on strict performance of any covenant or obligation under this Contract, regardless of the length of time for which such failure continues, shall not be deemed a waiver of such party\'s right to demand strict compliance in the future. No consent or waiver, express or implied, to or of any breach or default in the performance of any obligation under this Contract shall constitute a consent or waiver to or of any other breach or default in the performance of the same or any other obligation.'] },

    { title: 'Ownership of Drawings and Materials and Storage', paras: [`All drawings, reports, designs, sketches, working drawings, shop drawings, documents, certificates, plans, specifications, estimates, memoranda, analyses, calculations, models and other tangible evidence of the Contractor's work product prepared in connection with the Work shall become and remain the sole property of Owner. Contractor may retain copies of its work product for its records. Any materials that are unfixed and required to perform the Work and that are delivered to the Property shall remain the property of the Contractor until they have been both attached to the Property and paid for by Owner. The Contractor shall be solely responsible for repairing, at Contractor's sole cost and expense, any damage to materials that occur prior to installation. The Contractor shall either store materials at the Property or in a bonded, insured site that is available to Owner and its lender for inspection upon reasonable notice. In the event Contractor's insurance coverage fails to cover damage or casualty to or theft of any materials required for the Work that have not yet been installed and Owner's insurance coverage does provide such coverage, Contractor shall (a) at Contractor's sole expense, replace such materials; (b) reimburse Owner its insurance deductible, which is ${v.insuranceDeductible} or (c) deduct ${v.insuranceDeductible} (the amount of Owner's insurance deductible) from the Contract Sum. In the event Contractor's insurance coverage fails to cover damage or casualty to or theft of any materials required for the Work that have not yet been installed and Owner's insurance coverage does not provide such coverage, Contractor shall, at Contractor's own expense, pay the entire replacement cost of such materials.`] },

    { title: 'Clean Up', paras: ['Contractor shall keep the Property clean of all rubbish and debris generated by the Work and remove all such rubbish and debris upon the completion of the Work.'] },

    { title: 'Notices', paras: noticesParas(v) },

    { title: 'Owner\'s Representatives', paras: [ownerRepsPara(v)] },

    { title: 'Governing Law and Disputes', paras: ['This Contract shall be interpreted under the laws of the state in which the Property is located. Any disputes arising from or related to this Contract shall be submitted to non-binding mediation prior to the commencement of any litigation. Any mediation will take place in the state in which the Property is located.'] },

    { title: 'Attorney\'s Fees', paras: ['In the event of any legal action to enforce the terms of this Contract, the prevailing party will be entitled to reasonable attorneys\' fees, costs, and expenses in addition to any other legal or equitable relief to which the prevailing party may be entitled.'] },

    { title: 'Assignment', paras: ['Contractor shall not assign this Contract or any rights hereunder without Owner\'s prior written consent.'] },

    { title: 'Merger', paras: ['This Contract, together with all exhibits, constitutes the sole and entire agreement of Owner and Contractor with respect to the subject matter contained in this Contract, and supersedes all prior or contemporaneous written and oral understandings and agreements.'] },

    { title: 'Modification', paras: ['The provisions of this Contract may not be amended, modified, or supplemented except by an agreement in writing and signed by Owner and Contractor.'] },

    { title: 'Exhibits; Conflict', paras: ['The exhibits attached to this Contract are a part of and incorporated into this Contract; **provided, however, that if any provision of this Contract conflicts with the provision of any exhibit, this Contract shall control and govern to the extent of the conflict.** Any termination or expiration of this Contract will automatically and simultaneously terminate all exhibits.'] },

    { title: 'Severability', paras: ['If any provision of this Contract is invalid or held unenforceable, the provision shall be deemed void. All remaining provisions shall remain in full or force and effect.'] },
  ];
}

/**
 * Apply omissions and the elected/excluded-terms clauses, then resolve the
 * {SEC:slug} cross-references against the final ordering. Mirrors the SP
 * template's resolveSections, over this template's section list.
 */
export function resolveMultiSections(v: MultiContractVars, opts: MultiContractOptions = {}): { title: string; paras: string[] }[] {
  const omit = new Set(opts.omitSections || []);
  const list = buildSections(v).filter((s) => !omit.has(sectionSlug(s.title)));

  const clean = (arr?: string[]) => (arr || []).map((t) => String(t).trim()).filter(Boolean);
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const lettered = (items: string[]) =>
    items.map((t, i) => `(${letters[i] || i + 1}) ${t.replace(/[.;]\s*$/, '')}`).join('; ');

  // Both clauses qualify the scope, so they sit immediately after it.
  const at = list.findIndex((s) => sectionSlug(s.title) === 'services-and-scope-of-work');
  const insertAt = at < 0 ? 0 : at + 1;
  const extra: { title: string; paras: string[] }[] = [];

  const elected = clean(opts.electedTerms);
  if (elected.length) {
    extra.push({
      title: 'Elected Options',
      paras: [`Where the Exhibits present alternatives, options or a required selection, the parties have elected the following, which shall control over any other alternative or option shown in the Exhibits: ${lettered(elected)}. No alternative, option or pricing shown in the Exhibits other than those elected above is agreed to or payable by Owner.`],
    });
  }
  const terms = clean(opts.excludedTerms);
  if (terms.length) {
    extra.push({
      title: 'Excluded Bid Terms',
      paras: [`Notwithstanding anything in the Exhibits to the contrary, the following terms, conditions and provisions appearing in the Exhibits are expressly rejected by Owner, are excluded from this Contract, and shall be of no force or effect: ${lettered(terms)}. Owner's execution of this Contract is expressly conditioned on the exclusion of the foregoing.`],
    });
  }
  if (extra.length) list.splice(insertAt, 0, ...extra);

  return resolveCrossRefs(list);
}

/* =============================================================================
   Document assembly
   ============================================================================= */

export async function buildMultiContract(
  vars: MultiContractVars,
  attachments: BidAttachment[],
  opts: MultiContractOptions = {},
): Promise<{ bytes: Uint8Array; sigAnchor: SigAnchor }> {
  if (!vars.entities.length) {
    const err: any = new Error('A multi-entity contract needs at least one property with an owner entity.');
    err.code = 'NO_ENTITIES';
    throw err;
  }
  // Every entity must be named: an unnamed Owner cannot sign, and a blank in the
  // party block is exactly the kind of defect that survives to signed paper.
  const unnamed = vars.entities.filter((e) => !String(e.entity || '').trim());
  if (unnamed.length) {
    const err: any = new Error(`These properties have no owner entity on file: ${unnamed.map((e) => e.propertyName || '(unnamed)').join(', ')}. Set each one's owner entity in Settings, then generate again.`);
    err.code = 'NO_ENTITIES';
    throw err;
  }

  const L = await Layout.create();
  const { doc, roman, bold } = L;

  // ---------- Title ----------
  L.paragraph('**INDEPENDENT CONTRACTOR AGREEMENT**', { size: 13, leading: 22, align: 'center', gap: 16 });

  // ---------- Preamble ----------
  for (const para of preambleParas(vars)) L.paragraph(para, { firstIndent: FIRST_INDENT, gap: 8 });

  // ---------- Numbered sections (27 by default; some may be omitted) ----------
  resolveMultiSections(vars, opts).forEach((s, i) => L.section(i + 1, s.title, s.paras));

  // ---------- Signature block ----------
  // Every entity is listed under ONE "Owner:" heading with a single By/Name/Title/
  // Date — the executed contracts are signed once, by the agent for all of them,
  // not once per entity.
  L.y -= 8;
  L.space(sigBlockHeight(vars));
  L.paragraph('IN WITNESS WHEREOF, the parties hereto have executed this Contract as of the Effective Date.', { gap: 10 });
  const sigPageObj = L.page;
  const byLineY = signatureBlock(L.page, L.y, roman, bold, vars);
  L.y -= sigBlockHeight(vars);

  // ---------- Exhibit A (bid embedded) ----------
  await exhibitA(doc, attachments, roman, bold, opts);

  // ---------- Exhibit B ----------
  exhibitBPage(doc, vars, roman, bold);

  // ---------- Exhibits C & D ----------
  exhibitText(doc, roman, bold, exhibitC(vars), 'EXHIBIT C', 'FORM OF CONDITIONAL WAIVER OF LIEN AND RELEASE');
  exhibitText(doc, roman, bold, exhibitD(vars), 'EXHIBIT D', 'FORM OF FINAL WAIVER OF LIEN AND RELEASE');

  // ---------- Exhibit E (change order form) ----------
  exhibitE(doc, roman, bold);

  numberPages(doc, roman);

  const pages = doc.getPages();
  const { width: spw, height: sph } = sigPageObj.getSize();
  const sigIdx = pages.indexOf(sigPageObj);
  const sigAnchor: SigAnchor = {
    page: (sigIdx < 0 ? pages.length : sigIdx + 1),
    xPct: (MARGIN + 26) / spw,
    yPct: (sph - (byLineY + 2)) / sph,
    widthPct: 0.22,
  };
  return { bytes: await doc.save(), sigAnchor };
}

/** Vertical space the signature block needs — grows with the entity list. */
const sigBlockHeight = (v: MultiContractVars) => 22 + Math.max(0, v.entities.length - 1) * 12 + 90;

/**
 * Owner (all entities) on the left, Contractor on the right, one set of
 * By/Name/Title/Date each. Returns the PDF-y of the Owner "By:" line so
 * countersigning can anchor there.
 */
function signatureBlock(page: PDFPage, top: number, roman: PDFFont, bold: PDFFont, v: MultiContractVars): number {
  const colL = MARGIN, colR = MARGIN + CONTENT_W / 2 + 10;
  const line = (x: number, yy: number, label: string, f = roman) =>
    page.drawText(label, { x, y: yy, size: 10, font: f, color: rgb(0, 0, 0) });
  let yy = top;
  line(colL, yy, `Owner: ${v.entities[0].entity}`, bold);
  line(colR, yy, `Contractor: ${v.contractorName}`, bold);
  yy -= 12;
  // Remaining entities stack under the first, indented past the "Owner: " label.
  for (const e of v.entities.slice(1)) {
    line(colL + 34, yy, e.entity, bold);
    yy -= 12;
  }
  yy -= 10;
  const byLineY = yy;
  line(colL, yy, 'By: __________________,'); line(colR, yy, 'By: __________________'); yy -= 12;
  line(colL, yy, 'as Agent for and on behalf of Owner'); yy -= 18;
  line(colL, yy, 'Name: ________________'); line(colR, yy, 'Name: ________________'); yy -= 18;
  line(colL, yy, 'Title: _________________'); line(colR, yy, 'Title: _________________'); yy -= 18;
  line(colL, yy, 'Date: _________________'); line(colR, yy, 'Date: _________________');
  return byLineY;
}

/* ---------- Exhibit A: "See attached bid." then the bid itself ---------- */
async function exhibitA(
  doc: PDFDocument, attachments: BidAttachment[],
  roman: PDFFont, bold: PDFFont, opts: MultiContractOptions,
) {
  const header = doc.addPage([PAGE_W, PAGE_H]);
  const center = (txt: string, yy: number, size: number, f: PDFFont) => {
    const w = f.widthOfTextAtSize(txt, size);
    header.drawText(txt, { x: (PAGE_W - w) / 2, y: yy, size, font: f, color: rgb(0, 0, 0) });
  };
  let yy = TOP;
  center('EXHIBIT A', yy, 13, bold); yy -= 20;
  center('PLANS AND SPECIFICATIONS', yy, 11, bold); yy -= 20;
  center('See attached bid.', yy, 11, roman); yy -= 18;

  // Echo the elections and exclusions on the page the bid is stapled behind, so a
  // reader looking at a "Choose One" price table sees it resolved in place.
  const bullets = (heading: string, items?: string[]) => {
    const list = (items || []).map((t) => String(t).trim()).filter(Boolean);
    if (!list.length) return;
    yy -= 8;
    center(heading, yy, 9, bold); yy -= 13;
    for (const t of list) {
      let line = '';
      const flush = () => { if (line) { center(line, yy, 9, roman); yy -= 11; line = ''; } };
      for (const word of `• ${t}`.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (roman.widthOfTextAtSize(next, 9) > CONTENT_W) { flush(); line = word; } else { line = next; }
      }
      flush();
    }
    yy -= 6;
  };
  bullets('ELECTED OPTIONS — THESE CONTROL OVER ANY OTHER OPTION SHOWN BELOW', opts.electedTerms);
  bullets('THE FOLLOWING TERMS IN THIS EXHIBIT ARE EXCLUDED AND OF NO EFFECT', opts.excludedTerms);

  const items = await collectBidItems(doc, attachments, 'into Exhibit A');
  placeBidItems(doc, items, header, yy - 6, bold);
}

/* ---------- Exhibit B: the Contract Sum as free narrative ---------- */
function exhibitBPage(doc: PDFDocument, v: MultiContractVars, roman: PDFFont, bold: PDFFont) {
  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = TOP;
  /** Draw one centered line and advance the baseline by `lead`. */
  const center = (txt: string, size: number, f: PDFFont, lead: number) => {
    if (y < BOTTOM) { page = doc.addPage([PAGE_W, PAGE_H]); y = TOP; }
    const w = f.widthOfTextAtSize(txt, size);
    page.drawText(txt, { x: (PAGE_W - w) / 2, y, size, font: f, color: rgb(0, 0, 0) });
    y -= lead;
  };
  center('EXHIBIT B', 13, bold, 21);
  center('CONTRACT SUM', 11, bold, 19);
  y -= 12;

  // Exhibit B is centered narrative in the executed contracts, not a table. The
  // admin supplies the wording (term, monthly amount, proration); fall back to
  // the sum and any per-property breakdown if they left it blank.
  const body = (v.exhibitBText || '').trim() || defaultExhibitB(v);
  for (const para of body.split('\n')) {
    if (!para.trim()) { y -= 10; continue; }
    let line = '';
    const flush = () => { if (line) { center(line, 11, roman, 12.5); line = ''; } };
    for (const word of para.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (roman.widthOfTextAtSize(next, 11) > CONTENT_W) { flush(); line = word; } else { line = next; }
    }
    flush();
    y -= 6;
  }
}

function defaultExhibitB(v: MultiContractVars): string {
  const lines = [`${v.contractSum}, per bid estimate provided in Exhibit A.`];
  const broken = v.entities.filter((e) => e.sum && e.sum.trim());
  if (broken.length) {
    lines.push('', 'Includes the total for each property plus mobilization.');
    for (const e of broken) lines.push(`${e.propertyName}: ${e.sum!.trim()}`);
  }
  lines.push('', 'Any change in pricing must be approved by Owner in writing prior to work being performed.');
  return lines.join('\n');
}

/* ---------- Exhibit C: conditional waiver, every entity in the TO: block ---------- */
function exhibitC(v: MultiContractVars): string {
  const groups = noticeGroups(v);
  const to = groups.map((g) => `${g.names.join('\n          ')}\n          Office Address: ${g.addr}`).join('\n\n          ');
  return `TO:       ${to}

FROM:     ${v.contractorName}
          ${v.contractorAddr}

In return for payment of ${v.contractSum} received from ${entityNames(v)} to ${v.contractorName} in exchange for labor at and/or materials or equipment furnished to ${addressList(v)}, respectively, through this date, ${v.contractorName} waives its right to assert, record and foreclose a labor, mechanic's or materialman's lien under any and all applicable state and local laws for labor performed and materials and equipment furnished at the above job site up to and including the date of ${v.workCompletionDate}. The undersigned represents warrants that he/she is authorized to execute this Conditional Waiver of Lien. This waiver is only effective and is conditional upon the undersigned actually being promptly paid the above amount.

${v.contractorName}

Date    ___________________________________
By:     ___________________________________
Name:   ___________________________________
Title:  ___________________________________`;
}

/* ---------- Exhibit D: final waiver, entities inline in the prose (twice) ---------- */
function exhibitD(v: MultiContractVars): string {
  const list = entityLocatedList(v);
  return `State of:

County of:

I, the undersigned, am a general contractor, subcontractor, materialman, or other person furnishing services, labor, or material in the construction, repair, and/or replacement of improvements to parcels of real property to ${list}.

IN CONSIDERATION of the full and final payment of any and all sums of money due and owing the undersigned, the sufficiency and receipt of which is hereby acknowledged, and/or other benefits accruing to me, I do hereby, waive, release, and quitclaim in favor of the owner or owners of said real estate and any and all lenders or their assigns with any interest in said real property, all right that I may now have, for the services, labor, and material furnished through the date hereof, to a lien upon any and all lands and improvements as to which such services, labor, or materials have been furnished; and, I do warrant that I have not and will not assign any claim for payment nor any right to perfect a lien against said property, and that I have the right to execute this waiver and release of liens. I further warrant that no chattel mortgage, conditional sale contract, retention of title agreement, or mechanic's or materialman's lien, has been given or executed by the undersigned, for or in connection with any material appliances or machinery placed upon said premises or installed by me or any other person, whether permanently affixed to the property or not, which has been released, and agree that this document may be filed of record and shall act as a Release of any such lien claim I might otherwise have concerning work performed for ${list}.

Signature: _______________

Name:      __________________

Company:   _______________

Title:     ___________________

Date:      ___________________

Subscribed and sworn to me this _______ day of __________, 20____.

________________________
Notary Public`;
}

/* ---------- Exhibit E: the change order form ----------
   A bordered grid, not prose — the only exhibit that is a fillable form. It is
   deliberately blank: it gets printed and completed by hand when a change arises. */
function exhibitE(doc: PDFDocument, roman: PDFFont, bold: PDFFont) {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  let y = TOP;
  const center = (txt: string, size: number, f: PDFFont) => {
    const w = f.widthOfTextAtSize(txt, size);
    page.drawText(txt, { x: (PAGE_W - w) / 2, y, size, font: f, color: rgb(0, 0, 0) });
    y -= size + 6;
  };
  center('EXHIBIT E', 13, bold);
  center('FORM OF CHANGE ORDER', 11, bold);
  y -= 8;

  const box = (label: string, h: number, opts: { half?: 'left' | 'right' } = {}) => {
    const w = opts.half ? (CONTENT_W - 12) / 2 : CONTENT_W;
    const x = opts.half === 'right' ? MARGIN + w + 12 : MARGIN;
    drawFormBox(page, { x, y, w, h, label, font: bold, size: 9 });
    if (!opts.half || opts.half === 'right') y -= h + 8;
  };

  box('Change Order No:', 30, { half: 'left' });
  box('Date:', 30, { half: 'right' });
  box('Contractor\'s Name and Address:', 62, { half: 'left' });
  box('Owner\'s Name and Address:', 62, { half: 'right' });

  // `box` leaves the baseline 8pt below the box it drew, which is not enough
  // clearance for a heading's ascenders — drop clear of the border first.
  y -= 10;
  center('THE INDEPENDENT CONTRACTOR AGREEMENT IS HEREBY CHANGED AS FOLLOWS', 9, bold);
  y -= 2;
  box('', 150);
  box('Additional Contract Days (if none, state "NONE"):', 34);
  box('PREVIOUS CONTRACT SUM: $', 30, { half: 'left' });
  box('REVISED CONTRACT SUM: $', 30, { half: 'right' });

  y -= 12;
  center('ALL OTHER TERMS AND CONDITIONS OF THE CONTRACTOR AGREEMENT THAT ARE NOT', 8, bold);
  center('CHANGED BY THIS CHANGE ORDER REMAIN IN FULL FORCE AND EFFECT.', 8, bold);
  y -= 6;
  center('ACCEPTANCE', 11, bold);

  // The acceptance paragraph wraps as body text rather than sitting in a box.
  const accept = 'The above prices, specifications, and conditions are satisfactory, and are hereby accepted. The Contractor is authorized to do the work as specified, and the Owner shall make payments as outlined above.';
  let line = '';
  const draw = (t: string) => { page.drawText(t, { x: MARGIN, y, size: 9, font: roman, color: rgb(0, 0, 0) }); y -= 11; };
  for (const word of accept.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (roman.widthOfTextAtSize(next, 9) > CONTENT_W) { draw(line); line = word; } else { line = next; }
  }
  if (line) draw(line);
  y -= 14;

  const sig = (label: string) => {
    if (y < BOTTOM) return;
    page.drawText(`${label} _____________________________________    Date: __________________`,
      { x: MARGIN, y, size: 9, font: roman, color: rgb(0, 0, 0) });
    y -= 26;
  };
  sig('Owner Signature:');
  sig('Contractor Signature:');
}
