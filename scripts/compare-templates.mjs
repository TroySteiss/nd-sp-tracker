// Clause-by-clause comparison of the two contract templates.
//
//   npm run build:server && node scripts/compare-templates.mjs [--diff]
//
// The two forms are meant to be mostly in line: most sections pair up, and across
// the clauses they share the only systematic difference should be the defined term
// ("Contract" in the multi-entity form, "Agreement" in the SP one). Anything else
// is either a real difference carried by the executed document, or drift to fix.
//
// Pass --diff to print the word-level differences for the closely-matching
// sections, which is where unintended drift hides.
import { resolveSections } from '../dist/src/contract.js';
import { resolveMultiSections } from '../dist/src/contract-multi.js';

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = (s) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

/* Placeholder values, so this compares WORDING and not filled-in data. */
const spVars = {
  effectiveDate: '<DATE>', termEndDate: '<END>', ownerEntity: '<OWNER>', contractorName: '<CTR>',
  propertyName: '<PROP>', propertyAddr: '<ADDR>', ownerNoticeAddr: '<NADDR>', contractorAddr: '<CADDR>',
  contractTotal: '<TOTAL>',
};
const mVars = {
  effectiveDate: '<DATE>', entities: [{ entity: '<OWNER>', propertyName: '<PROP>', address: '<ADDR>' }],
  contractorName: '<CTR>', contractorAddr: '<CADDR>', contractType: '<TYPE>',
  ownerReps: [{ name: '<REP>', email: '<EMAIL>' }], workCompletionDate: '<WCD>', contractSum: '<SUM>',
  liquidatedPerDay: '<LD>', workDays: '<DAYS>', workStart: '<START>', workEnd: '<END>',
  insuranceDeductible: '<DED>', ongoingPeriod: 'monthly', exhibitBText: '',
};

/** The same clause carries a different title in each form. */
const ALIAS = {
  'notification-by-contractor-change-orders': 'notification-by-contractor',
  'payment-for-services-and-contract-sum': 'payment-for-services-and-contract-price',
  'time-of-performance-and-completion-schedule': 'time-of-performance-and-completion',
  'warranty': 'guarantee',
  'no-implied-waiver': 'waiver',
  'exhibits-conflict': 'conflict',
};

const sp = {}, mu = {};
for (const s of resolveSections(spVars)) sp[slug(s.title)] = norm(s.paras.join(' '));
for (const s of resolveMultiSections(mVars)) mu[slug(s.title)] = norm(s.paras.join(' '));

/* Word-level similarity. A tiny LCS-based ratio — no autojunk heuristics to skew
   long clauses the way difflib's default does. */
function ratio(a, b) {
  const n = a.length, m = b.length;
  if (!n && !m) return 1;
  let prev = new Array(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    const cur = new Array(m + 1).fill(0);
    for (let j = 1; j <= m; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return (2 * prev[m]) / (n + m);
}

const pairs = [];
for (const k of Object.keys(mu)) {
  const s = (k in sp) ? k : ALIAS[k];
  if (s && s in sp) pairs.push([k, s]);
}

const rows = pairs.map(([mk, sk]) => {
  const a = sp[sk].split(' '), b = mu[mk].split(' ');
  return { mk, sk, words: b.length, r: ratio(a, b), a, b };
}).sort((x, y) => x.r - y.r);

console.log(`paired ${pairs.length} of ${Object.keys(mu).length} multi sections against ${Object.keys(sp).length} SP sections\n`);
console.log(' words  ratio  multi section  (<- SP title when renamed)');
for (const r of rows) {
  console.log(`${String(r.words).padStart(6)} ${r.r.toFixed(2).padStart(6)}  ${r.mk}${r.mk === r.sk ? '' : `  <- ${r.sk}`}`);
}
const only = (o, other, alias) => Object.keys(o).filter((k) => !(k in other) && !alias.includes(k));
console.log('\nmulti-only:', only(mu, sp, Object.keys(sp)).filter((k) => !(ALIAS[k] in sp)).join(', ') || '(none)');
console.log('SP-only   :', Object.keys(sp).filter((k) => !(k in mu) && !Object.values(ALIAS).includes(k)).join(', ') || '(none)');

if (process.argv.includes('--diff')) {
  console.log('\n=== word diffs, closest-matching sections first ===');
  for (const r of [...rows].reverse()) {
    if (r.r < 0.85) continue;                  // below this the clause is genuinely different
    const diffs = [];
    // Walk the LCS to report replacements without pulling in a diff library.
    let i = 0, j = 0;
    while (i < r.a.length || j < r.b.length) {
      if (i < r.a.length && j < r.b.length && r.a[i] === r.b[j]) { i++; j++; continue; }
      const si = i, sj = j;
      while (i < r.a.length && !(j < r.b.length && r.a[i] === r.b[j])) {
        if (r.b.slice(j).includes(r.a[i])) break;
        i++;
      }
      while (j < r.b.length && !(i < r.a.length && r.a[i] === r.b[j])) {
        if (r.a.slice(i).includes(r.b[j])) break;
        j++;
      }
      if (i === si && j === sj) { i++; j++; continue; }
      diffs.push(`    SP[${r.a.slice(si, i).join(' ') || '-'}]  ->  MULTI[${r.b.slice(sj, j).join(' ') || '-'}]`);
    }
    console.log(`\n### ${r.mk}${r.mk === r.sk ? '' : `  (SP: ${r.sk})`}  ratio ${r.r.toFixed(2)}`);
    console.log(diffs.length ? diffs.join('\n') : '    identical');
  }
}
