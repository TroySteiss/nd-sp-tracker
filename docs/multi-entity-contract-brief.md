# BRIEF — Multi-entity contract generator (SP Tracker)

> Task brief for work not yet started. Written 2026-07-28 at the end of a long
> session so a fresh session can pick this up without re-deriving it.
> Delete this file once the feature ships and PROJECT_MAP covers it.

## The ask

Add a **multi-entity contract generator** at top-admin level. It is **not** tied to
a Special Project — no `project_id`, no bid slots, no lifecycle. It produces the
Independent Contractor Agreement used for work spanning several properties owned
by different LLCs (landscaping/snow, pest, pool, etc.).

Reuse the existing contract machinery (pdf-lib generation, bid embedding, the page
previewer with strike/cover marks, countersigning) rather than building fresh.

## Source documents

| Path | What it is |
|---|---|
| `~/Downloads/Minot Legend Lawn Landscaping and Snow Contract 09.2025-08.2026 EXECUTED.pdf` | 15pp executed example. **Authoritative for current structure and language.** Scanned — do not transcribe from it |
| `~/Downloads/Minot Crystal Clear Projects Contract 9.2024.docx` | Same template, 2024. **Use this for clean section text** — extract with `node scripts/read-docx.mjs <path>` |
| `~/Downloads/Signed waiver C.pdf`, `Signed waiver D.pdf` | Exhibits C/D signed standalone. Word-for-word identical to the in-contract versions; confirms the waivers get issued separately during the term |
| `~/OneDrive - MIMG/AGMO Contractor/Contractor Agreements/**/*.DOCX` | ~8 more executed contracts on the same template, mostly single-entity. Useful for checking which fields really vary |

## Template structure (differs from the SP agreement — it is a separate template, not a variant)

- **27 numbered sections** (SP has 25). Different wording throughout; do not try to
  parameterise the SP template into this one.
- "**Contract Sum**" throughout, not SP's "Contract Price".
- **Section 1 is a `General Terms` block** with sub-items: type of contract
  ("Bid Contract"), "Owner's Representatives" (names), Work Completion Date,
  Contract Sum. The 2024 version also breaks the sum out per property.
- **Liquidated damages**: `$X/day` after the completion date ($100/day in 2025,
  $250/day in 2024 — a variable).
- **Work hours** are stated (Mon–Fri 8:00–5:00 in 2025, 8:00–6:00 in 2024 — variable).
- **Notices** pairs each entity with its own address/phone/email, then the contractor.
- **Owner's Representatives** section lists names + emails.
- **Signature block**: every entity listed under one `Owner:` heading with a
  *single* By/Name/Title/Date, plus the contractor's. Not one block per entity.
- **Exhibits A–E** (SP has A&B, C, D):
  - **A** — Plans and Specifications: the page reads "See attached bid.", then the bid embeds
  - **B** — Contract Sum: free narrative text (total, monthly amount, term, proration notes)
  - **C** — Conditional Waiver of Lien: `TO:` block lists every entity + address
  - **D** — Final Waiver of Lien: entities inline in the prose, twice
  - **E** — Change Order form: a bordered grid/table, not prose

## Variables the generator needs

`effectiveDate` · `entities[]` (name, property name, address, phone, notice email) ·
`contractor` (name, address, phone, email) · `contractType` · `ownerReps[]` (name, email) ·
`workCompletionDate` · `contractSum` + optional per-property breakdown ·
`liquidatedPerDay` · `workHours` · `insuranceDeductible` · Exhibit B narrative ·
the attached bid.

## Where the data comes from

`properties` already carries `owner_entity`, `address`, `name` for all nine — enough
to assemble the entity list by ticking properties. Migration **026** filled the gaps
(South Pointe had a corrupted `O LLC`; Plaza and Wyatt had no entity, Plaza no address).

`contracts.project_id` is **nullable**, so a non-SP contract can be recorded there.
Probably wants `kind` ('sp' | 'multi') and a `details` jsonb for the entity list.

## Two decisions to settle first

1. **Entity name style.** The DB has `MIMG CCXXXI Commons Sub, LLC` (comma); every
   executed contract has `MIMG CCXXXI Commons Sub LLC` (no comma). These get printed
   on signed paper — pick one and normalise. Ask Troy.
2. **Stale clause in the 2024 docx.** §12.c: *"Insurers shall be licensed to do
   business in **Kentucky**"* — carried over from another market. The 2025 executed
   version says ND. Derive from the property's state; don't copy the docx blindly.

## Build plan

1. **Extract the layout engine from `src/contract.ts` into a shared module.**
   `paragraph`, `space`, `newPage`, `section` are closures inside `buildContract`
   (around lines 183–240). Also worth sharing: `tokenize`, `placeItem`, `fitBox`,
   `detectKind`, `expandAttachments`, `exhibitText`, `drawMarks`.
   **Do this as a planned refactor, not an in-place surgical edit** — I tried the
   latter and broke the file; it reverted cleanly, but don't repeat it.
   **Verify by extracting text from a generated SP contract before and after, not by
   hashing bytes** — pdf-lib output is not byte-deterministic (identical content
   differs by 2–3 bytes per run).
2. `src/contract-multi.ts` — the 27 sections + Exhibits A–E. Exhibit E needs a
   table/grid renderer that doesn't exist yet.
3. `POST /api/contracts/multi` (admin-only) + a migration for `contracts.kind` /
   `details`.
4. Admin UI: a builder that ticks properties → derives entities, takes contractor,
   sum, reps, dates, Exhibit B text, and attaches the bid. Reuse
   `openScopePreviewer` in `public/app.js` for bid page selection and marks.
5. Add `contract-multi.ts` to `build:server` in package.json — **it lists every
   `src/*.ts` entry explicitly**.

## Repo context

- Repo `TroySteiss/nd-sp-tracker`, deploys to Railway from `main`. Latest migration is **026**.
- Read `PROJECT_MAP.md` first — it covers roles, the PM view, contract revision and
  the existing contract tailoring (page selection, strike/cover marks, excluded
  terms, section omission).
- `npm run typecheck` · `npm test` (30 vitest) · `npm run build` before committing.
- The app is password-gated; Claude does not log in. Verify server-side against the
  DB, or with a throwaway instance on another port using your own `APP_PASSWORD`.
