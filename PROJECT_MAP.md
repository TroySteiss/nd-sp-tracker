# PROJECT MAP — SP Tracker (multi-region)

> Structural map of this repo so a new session can orient without re-exploring.
> **Keep this file updated when you change the architecture** (new tables, endpoints, views, build steps).
> Last updated: 2026-07-31 (long-range plan — loan-term horizon per property,
> per-year $ on projects + Post-Refi bucket, Plan tab, TRMO-layout Excel export).
> Previously: 2026-07-30 (multi-entity contract generator — separate 27-section
> template, Exhibits A–E, shared PDF layout engine extracted from contract.ts).
> Previously: 2026-07-28 (property-manager view at /pm; two admin tiers; contract
> revision rollback; contract tailoring — bid page selection, strike/cover marks,
> excluded terms, section omission).
> Previously: 2026-07-17 (multi-region; ATL; notes+attachments; split projects; admin lock;
> Office→PDF; removable attachments; contractor-signed slot; approval lock; in-app countersigning;
> year-end cash projection bases on cushion Col V "Cash After Distribution", with forward
> per-quarter accretion from the budgeted return columns).

## What this is

Hosted multi-user Special-Projects / Capex tracker for Monarch properties (originally ND-only, now
multi-region). Node + TypeScript + Express + PostgreSQL server; vanilla-JS single-page UI. Deployed
on Railway (`railway.json`), DB is the Railway Postgres plugin. Local dev uses Postgres 17
(`sp_tracker` DB) and `npm run dev` on port 3000.

```
Browser (public/app.js, single file ~2900 lines, no framework)
   │  fetch /api/*  (session cookie)
   ▼
Express (src/server.ts) ── static: public/
   ├── src/auth.ts        login/logout/status; express-session in Postgres ("session" table)
   ├── src/routes.ts      ALL /api endpoints + change-log helper (async errors wrapped → JSON 500)
   │     ├── src/importers.ts   xlsx parsing (GL + cushion), DB-driven known codes
   │     ├── src/contract.ts    SP Independent Contractor Agreement PDF ("Contract Price",
   │     │                      25 sections) — REFUSES to generate if the bid can't embed
   │     │                      (no placeholder scope, ever)
   │     ├── src/contract-multi.ts   multi-entity Agreement ("Contract Sum", 27 sections,
   │     │                      Exhibits A–E) — a SEPARATE template, not a variant
   │     ├── src/contract-layout.ts  shared PDF engine both templates render through:
   │     │                      Layout (page cursor + rich text), bid embedding, page
   │     │                      marks, exhibit text, form boxes, stampSignature
   │     ├── src/convert.ts     Office→PDF via headless LibreOffice (bid uploads auto-convert;
   │     │                      original kept; nixpacks.toml installs LO on Railway;
   │     │                      /healthz reports docConvert; SOFFICE_PATH env override)
   │     ├── src/plan-export.ts long-range plan workbook (SheetJS): Summary +
   │     │                      per-property sheets (formulas × share) + Raw Data

   │     └── src/seed.ts        loadStateInto() = full-state replace (seed/reset/restore)
   ├── src/db.ts          pool, tx(), assembleState() → the /api/state blob, rowToProject
   ├── src/migrate.ts     runs migrations/*.sql in filename order on boot (tracked in _migrations)
   └── src/seed-if-empty.ts  first-boot seed from seed/initial-data.json
shared/domain.ts          domain contract (lifecycle, phases, cash/audit models, $ rules)
                          bundled for the browser as public/domain.js (npm run build:client)
                          NOTE: PROPERTIES/PCOLOR in here are SEED DEFAULTS ONLY —
                          the properties table is the runtime source of truth.
```

## Source of truth rules

- **Properties, regions, colors, portfolios, managers, app title live in the DB** and are edited in
  the Settings view. Nothing region/property-specific is hardcoded in client or server logic.
- `shared/domain.ts` holds business rules (10-step lifecycle, cascade semantics, $5K no-contract
  threshold, cash/audit models, category list). Changing these changes reconciliation vs Yardi —
  they are unit-tested in `shared/domain.test.ts` (vitest, `npm test`).
- Client gets everything from `GET /api/state` (assembleState): meta (incl. `appTitle`), properties
  (incl. `color`, `portfolio`, update-email settings), `regions` (ordered), cash, cashAdjustments,
  gl, projects, contracts, contractors.
- **Multi-property split**: `projects.split` jsonb `{mode:'units'|'custom', list:[{property,pct}]}`
  (016). Helpers `allocsOf/isSplit/shareFor/involvesProp/projOutflowFor` in domain.ts (mirrored in
  app.js). `projForProp` includes split projects; cashModel/glMatchScore/email amounts are
  share-weighted; the property view shows the slice with a ⇄ chip; editor has a "Cost split" panel
  (by-unit-count default — pcts recomputed from current units at save; custom % must sum to 100).
  Server normalizes via `normalizeSplit` (lead property = list[0] = projects.property_code).
- **Roles** (`src/auth.ts`) — four tiers, resolved fresh on every request by `roleOf()`:

  | Role | Set by | Can do |
  |---|---|---|
  | `admin` | `ADMIN_USERS` env (default Troy Steiss, Riley Combs) | everything: Settings, user roster, Change log, **Upload & Data**, **Contractors** (incl. the multi-entity contract builder), bid approval, contract generation, backup/restore/reset, countersign, clear a revision flag |
  | `manager` | `MANAGER_USERS` env (default Holly Haman, Brittanee Perdue) | **currently identical to `user`** — see below |
  | `user` | default for anyone not listed | full tracker; no admin tabs, no Change log, cannot approve |
  | `pm` | admin assigns in Settings (`app_users.role`) | the stripped `/pm` view only, scoped to their sites |

  Accounts can be **created before their first login** (Settings ▸ Users & roles), which is how a PM
  gets their covered sites assigned up front instead of meeting an empty site picker. `touchUser`
  only ever updates `display`/`last_seen` on conflict — never `role` or `sites` — so a
  pre-assignment survives the first sign-in. The name entered must match what they will type:
  `normUser` keeps letters only, so a different spelling is a different account.

  **`manager` is a named tier that grants nothing extra yet.** It exists so the second-level admins
  are on record and allowlisted, ready for permissions to be attached later; today it behaves
  exactly like `user`. Every gate in routes.ts checks `isAdminUser`, so widening the tier means
  changing those gates — not auth.ts. Don't assume from the name that a manager can approve or read
  the change log; they can't.

  Both admin tiers are **env allowlists, not DB rows**, so they survive a restore and can't be
  edited from inside the app; `app_users` only ever stores `user`/`pm`. Tiers nest —
  `isManagerUser()` is true for admins. Names match on letters only (`normUser`), so
  "Holly Haman" / "holly.haman" / "HollyHaman" are one person. A misspelt name is a *different*
  account, silently demoted to `user` — the login screen now warns on an unknown name for exactly
  this reason. The correct spelling is **Perdue** (the MMR Dashboard carried "Purdue" until
  its migration 005 corrected it).
  The only middleware is `requireAdmin`. The client mirrors it as `IS_ADMIN`, but **the server
  enforces regardless** — login is a single shared password with a free-form username, so a role
  scopes the UI and the routes; it is **not** authentication and must never be treated as proof of
  identity.

  **Admin-only tabs are `settings`, `changelog`, `data` (Upload & Data) and `directory`
  (Contractors).** The nav omits them and `mainCol()` bounces a non-admin who somehow lands on one
  back to the dashboard; the endpoints behind them are `requireAdmin` independently — imports
  (`/imports`, `/import/gl*`, `/import/cushion*`), backup/restore/reset, and the vendor directory
  (`GET /contractors`, `DELETE /contractors/:id`, `POST /contractors/import`).
  **`POST /contractors` is deliberately still open to everyone.** It is not directory management: it
  backs the "⚠ Not in contractor directory → Add to directory" prompt in the project editor, so a
  regular user can record a bid from a vendor nobody has entered yet. Gating it breaks bid entry —
  the job the user/manager tiers exist for.
- Per-property email settings + projection settings PATCHes stay open to all users.
- **Approval lock**: only top-level admins may set/unset the `approved` step or approve a bid
  (`isAdminUser`) — enforced in `POST/PATCH /projects` (403, compares old vs new `steps.approved` +
  set of approved bids) and on contract generation (auto-cascades approval). Mirrored in the editor
  UI (bid Approve, lifecycle switch, Advance, cascade all gated on `IS_ADMIN`).
- **In-app countersigning**: `signatures` table (018, one PNG per user in files). `stampSignature`
  in contract.ts draws a signature PNG onto a stored PDF at click-placed coords. `POST
  /projects/:id/countersign` (admin-only; `preview:true` returns a data-URL without saving) stamps
  the contractor-signed PDF → attaches as executed + ticks `signed`. Client modal renders the PDF
  with pdf.js (lazy CDN, **render with `intent:'print'`** so it completes in background tabs),
  click to place, draw/reuse signature. `GET/PUT /signature` store the reusable signature. `✉
  Email` on the executed row builds a multipart .eml (buildEml supports attachments) with the PDF,
  pre-addressed to the contractor from the directory.
- **Property cash tile mode** (`app_meta.cash_tile_mode`, 022; Settings ▸ Property cash tile,
  admin-only): switches the property view's cash tile between `current` (cash today = snapshot +
  adjustments, the default) and `afterDist` (cushion Col V). **Display only** — it is read at exactly
  one place in app.js (the `cashTile` const in viewProperty) and by nothing else. `projBase`,
  `projEndCash`, cash/door, the GL tie-out and the update emails are untouched either way; the
  year-end projection already bases on Col V independently of this setting. `afterDist` falls back to
  current cash (with a "no Col V" sublabel) for properties whose latest cushion lacks Col V. The
  dashboard Portfolio-summary rows still always show current cash — deliberately out of scope.
- **"Above the Line"** in a project NAME (`isAboveLine` in domain.ts / `isATL` in app.js) =
  operationally funded: excluded from cash/budget projections (cashModel), GL tie-out (auditModel),
  dashboards, nav counts, quarterly-summary future list, and update emails. Visible only via the
  property view's collapsed "Above the Line" group and a Projects-view toggle (off by default).

## Database tables (migrations/)

| Table | Purpose | Notes |
|---|---|---|
| properties | property registry | pk `code`; region/manager/color/portfolio/contract_code/owner_entity/addresses/projection settings; update-email fields incl. `update_enabled` (in bulk download) + `update_include_discussed` (015); `notice_phone`/`notice_email` (027 — the multi-entity Notices block); `plan_end_year` (028 — plan horizon override) |
| regions | region registry | pk `name`, `sort` — drives nav & dashboard grouping (014) |
| projects | SP projects | jsonb `steps`; server re-applies cost rules on write; `plan_years` jsonb + `plan_kind` + `lender_flag` (028 — see Long-range plan below) |
| bids / progress_notes | per-project children | rewritten wholesale on each project save; notes carry `username`, `ts`, `files` jsonb (015) — server stamps missing author/ts from the session |
| cash_snapshots | latest cushion per property | **no FK** — holds rows for not-yet-added properties (014); has `units`; `cash_after_dist` (cushion Col V) + `projected_dist` (Col U) base the year-end cash projection (020); `budget_ret_q1..q4` (Cols AE–AH) drive forward per-quarter accretion (021) |
| cash_adjustments | mid-month deltas | FK to properties; survives imports |
| gl_lines | SP general ledger | **no FK** (014) — keeps lines for unknown codes; `linked_project_id` ties to projects |
| contracts | generated-contract records | Contracts view. `kind` 'sp'\|'multi' + `details` jsonb (027). `project_id` is nullable and is **always null for 'multi'** — those aren't Special Projects. A multi row's `property_code` is only the lead property; `details.entities` is the authoritative list |
| contractors | vendor directory | unique name |
| files | uploaded/generated files as bytea | survive Railway redeploys (no volume) |
| imports | import history (014) | kind gl/cushion, raw workbook file_key, label, counts, username |
| change_log | who/what/when audit (014) | username, action, summary, details jsonb |
| app_meta | single row | gl_period, cash_as_of, `app_title` (014), `cash_tile_mode` (022 — display only) |
| app_users | user roster (023, `last_seen` 025) | pk `key` = normalized username; `role` ('pm'/'user'), `sites` jsonb for a PM's covered properties. Rows appear on first login (`auth.touchUser`) **or** are created up front by an admin; `last_seen` null ⇒ pre-created, never signed in |
| session / _migrations | infra | — |

Also on `projects`: `pm_review_requested_at/by` (023 — PM hand-off) and
`revision_requested_at/by`, `revision_reason`, `superseded_contracts` jsonb (024 — see below).

## API surface (src/routes.ts)

- `GET /state` — the whole app state (client re-fetches after every write via `afterWrite`).
- Projects: `POST/PATCH/DELETE /projects[/:id]` (PATCH logs a field-level diff), bid file upload,
  `POST /projects/:id/note-file` (note attachments — stored in files, referenced from the note's
  `files` jsonb), `POST /projects/:id/contract` (generate PDF), contract-file / executed-contract /
  lien-waiver uploads.
- Cash: `PATCH /cash/:code`, `POST/DELETE /cash-adjustments`.
- GL: `PATCH /gl/:id/link`.
- Imports: `POST /import/gl` + `/confirm`, `POST /import/cushion` + `/confirm`, `GET /imports`.
  - Parse keeps **all** property codes (unknown ones included); preview returns `unknownCodes`.
  - GL confirm replaces **only the properties present in the file** and carries GL→project links
    forward by (property, control, date, amount). Raw workbook stored in files + imports row.
- Users: `GET /users`, `POST /users` (create before first login), `PATCH /users/:key`,
  `DELETE /users/:key` — all admin-only. Env-tier names can't be created, edited or removed here.
- Settings/admin: `POST/PATCH/DELETE /properties[/:code]`, `POST/PATCH/DELETE /regions[/:name]`,
  `PATCH /meta` (app title and/or cash tile mode — both optional, so one panel can't clobber the
  other), `PATCH /properties/:code/recipients|settings`.
  - Creating a property picks up any pre-imported GL lines + cushion snapshot (sp_budget/units copied).
  - Deleting a property is blocked while projects/contracts/adjustments reference it; GL/snapshot rows are kept.
- Multi-entity contracts (all **admin-only**): `GET /contracts/multi/sections` (the 27 sections,
  for the omit checkboxes), `POST /contracts/multi/bid` (upload the Exhibit A bid; same
  Office→PDF conversion as project bids), `POST /contracts/multi` (generate).
- Change log: `GET /changelog?limit&before&user&property`.
- Contractors: `GET/POST/DELETE /contractors`, `POST /contractors/import`.
- Backup: `GET /export/backup.json`, `GET /export/projects.csv`, `POST /restore`, `POST /reset`.
- Plan: `GET /export/plan.xlsx[?property=CODE]` — long-range plan workbook (any signed-in user;
  it shows nothing the Plan tab doesn't). CSV export gained lenderFlag/planKind/planTotal columns.
- Auth (open): `POST /api/login` {username, password}, `POST /api/logout`, `GET /api/auth/status`
  (returns `{authed, username, appTitle}` — title is shown pre-auth on the login card).

**Change log**: `logChange(req, {...})` in routes.ts — fire-and-forget insert attributed to
`req.session.username`. Every mutating endpoint calls it. Sessions without a username are rejected
by `requireAuth` (forces re-login after the username feature deploy).

**Async-error safety**: the api Router monkey-patches get/post/patch/put/delete to wrap async
handlers; errors flow to a JSON 500 middleware in server.ts instead of crashing the process
(Express 4 default behavior killed the server otherwise — this actually happened; don't remove it).

## UI (public/app.js) — views registry in mainCol()

| Tab | Function | Notes |
|---|---|---|
| dashboard | viewDashboard | region toggle + property bubbles, KPIs, funnel, pipeline |
| projects / inhouse / contracts | viewProjects/viewInHouse/viewContracts | board/table, in-house tiles |
| property | viewProperty | per-property: financial summary, projects by phase, GL reconciliation, update email |
| cash | viewCash | snapshot/loan table (grouped by region), adjustments, quarterly summary panel |
| plan | viewPlan | long-range plan: portfolio summary grid → per-property plan grid (editable year cells), unscheduled backlog, Excel export |
| data | viewData | Admin group; GL/cushion upload + preview modals, **import history**, backup/restore |
| directory | viewDirectory | Admin group; vendor directory + the **＋ New multi-entity contract** builder |
| settings | viewSettings | Admin group; app title, **property cash tile mode**, **users & roles roster**, regions manager, properties table + editor modal |
| changelog | viewChangelog | Admin group (top tier only); filters by user/property, load-more pagination |

- `pcolor(code)` reads `property.color` from state (stable hash fallback for unknown codes).
- `regionNames()` reads `S.regions` (ordered). `appTitle()` reads `S.meta.appTitle`.
- Quarterly summary groups by `property.portfolio` (`portfolios()`); blank portfolio ⇒ own card.
- Login: username (localStorage-prefilled) + shared team password; rail footer shows user + sign out.
- Project modal (openProject): core fields → in-house panel → Bids → **Generate contract** panel
  (readiness checklist: bid doc / total / contractor required, approval + owner entity recommended;
  the download & upload-existing live in the Contract section) → Contract → lifecycle steps →
  free-text Notes → **Notes & activity** (timestamped + attributed notes with attachments; saved
  with the project via progress_notes).
- Update emails: per-property settings via the draft dialog's ⚙ or the dashboard **⚙ Email setup**
  grid (include-in-bulk checkbox, To/CC/greeting, discussed/notes toggle — off by default).
  `buildUpdateEmail` honors `updateIncludeDiscussed`; the bulk ⬇ zip skips `updateEnabled=false`.

## Build / run / deploy

- `npm run dev` — tsx watch (preview launch config `.claude/launch.json` uses absolute node path).
- `npm run migrate` / `seed` — CLI; but server also migrates + seeds-if-empty on every boot.
- `npm test` (vitest, shared/domain.test.ts) · `npm run typecheck` · `npm run build` (esbuild;
  build:server lists every src/*.ts entry explicitly — add new files there! pm.ts, revision.ts,
  contract-layout.ts and contract-multi.ts are in the list. Forgetting one fails at *runtime* with
  ERR_MODULE_NOT_FOUND, not at build time).
- Deploy: Railway, `railway.json` + `nixpacks.toml` (installs LibreOffice + Liberation fonts for
  Office→PDF conversion — makes the image big and the first such build slow); DB env `DATABASE_URL`,
  auth env `APP_PASSWORD`, `SESSION_SECRET`, optional `ADMIN_USERS`, `SOFFICE_PATH`.
- Local DB: postgres:postgres@localhost:5432/sp_tracker (Postgres 17 via winget). Local LibreOffice
  installed at C:\Program Files\LibreOffice (winget) for dev conversion parity.

## Property-manager view — `/pm` (2026-07-28)

A **separate page**, not a mode inside app.js: `public/pm.html` + `pm.js` + `pm.css`, served by an
explicit route in server.ts *before* the SPA catch-all. Uses the tracker's own components
(`.app`/`.rail`/`.topbar`/`.panel`/`.chip`/`.steps`/`.bidslot`/`.seg-ctl`) and the same `theme`
localStorage key, so it reads as the same product and shares dark mode.

- **`src/pm.ts` — its own router**, mounted at `/api/pm` ahead of the main api router. PM state is
  assembled from scratch with a hand-picked column list rather than filtering `/api/state`: one
  missed key there would leak a dollar figure. No cash, GL, budget or variance is ever selected.
- A PM may: create a project (name/category/description/anticipated cost), add notes + attachments,
  upload/remove bid files, set start & end dates, request review once 3 bids are attached, flag a
  contract for revision, and choose their covered sites. **Lifecycle steps are read-only** — the
  only steps that move are the ones a document derives (see the contract chain below).
- Writes hit the **same columns the office reads** (`projects.anticipated_cost`, `bids.amount`,
  `bids.contractor`, `planned_start/end`) — no parallel PM storage, so estimates and bid amounts
  appear in the full view with no sync step.
- Three drop-in slots sit on each collapsed project row: **bid slots before approval, the contract
  signature chain after** (Generated → Contractor signed → Countersigned). Uploading to the chain
  applies the same step cascades as the full view's routes.
- Bid uploads run the **same Office→PDF conversion** as the main app (`isOfficeDoc`/`officeToPdf`);
  without it a PM could attach a .docx that `contract.ts` then refuses to embed.
- `pm.js` mirrors `phase()`/`pcolor()` from domain.ts/app.js **by hand**. `public/domain.js` is an
  ESM bundle that cannot load as a classic script and index.html doesn't use it either. Note
  domain.ts's `pcolor` is seed defaults only — the DB-aware version in app.js/pm.js is the real one.
  Keep the copies in step.
- A "note" is **not a separate store**: it's a project with no cost (`phase()` → `'note'`), which is
  the NOTES group in the property view. Adding a cost later promotes it to a planned project.

## Long-range plan — loan-term horizon (028, 2026-07-31)

Modeled on the TRMO Fannie Inspection Tracker: every plan line IS a project (no
parallel list), with three new columns on `projects`:

- **`plan_years` jsonb** — planned $ per calendar year (`{"2026":75000,...}`)
  plus the special key **`"post"` = Post-Refi bucket** (work deferred until cash
  replenishes after refinance). NULL = not on the plan. `normalizePlanYears`
  (domain.ts, applied on every write) keeps only 4-digit-year/"post" keys with
  positive amounts, rounded to cents — an emptied plan stores NULL, not `{}`.
- **`plan_kind`** — `'completion' | 'recurring'` (the tracker's "To Completion
  or Recurring?"). Recurring items still store explicit per-year amounts (the
  editor has a "fill every year" helper) because real recurring costs taper.
- **`lender_flag`** — free-text designation ("Fannie"); non-empty = the item is
  lender-required. Generalized so non-Fannie debt works.

**Horizon** = current year → `planHorizonEnd`: property `plan_end_year` override
→ any 4-digit year in the latest cushion's `loan_due` → now+4. Clamped to
[now, now+14]. A 2-year remaining loan term gives a 2-column plan — that is the
"tied out to loan term" requirement. `planYearCols` also resurrects stray data
years so a past-year amount never silently disappears from the grid.

**The plan is a pure overlay.** cashModel / auditModel / projOutflow never read
`plan_years` (unit-tested), so scheduling $500K across five years changes no
cash projection, GL tie-out, or update email. Splits share plan dollars exactly
like costs (`planForProp` = amount × `shareFor`), and ATL projects are excluded
from the plan views entirely.

**UI:** *Money ▸ Long-Range Plan* (all users; not `/pm`). Portfolio summary
grid (row per property, click into it) → per-property plan grid with editable
year cells (inline PATCH per cell; split projects are read-only there — edit
full amounts in the project editor, which gained a "Long-range plan" panel) and
an **Unscheduled / future items** section (the tracker's "Future SP Items"):
open, ATL-free projects with no plan years; "Schedule ↴" seeds this year with
the anticipated cost.

**Excel export** (`src/plan-export.ts`, SheetJS): `GET /export/plan.xlsx` (all
properties) or `?property=CODE`. Sheets: Summary (multi-property only) →
per-property (TRMO column layout) → **Raw Data**. Show-your-work structure:
Raw Data holds FULL project amounts as values; property-sheet year cells are
formulas `'Raw Data'!cell × share-cell`, all totals are SUMs, and Summary
references each property sheet's TOTAL row. Every formula cell also carries a
cached value so the file previews before Excel recalculates. Don't "simplify"
the formulas into hardcoded values — the reviewability is the point.

## Contract revision — send a bad contract back (024)

`src/revision.ts`, shared by both views so they roll back identically. Clears every step from
`approved` onward plus the derived `lienWaiver`, un-approves all bids, and nulls the four contract
document columns. `planned`/`gotBids` survive — the bids are still valid documents. Nothing is
deleted: the cleared documents move to `projects.superseded_contracts` with who/when/why.
`POST /projects/:id/request-revision` (open to any signed-in user — spotting a bad contract
shouldn't need an admin, and it only moves work backwards) and `POST /projects/:id/clear-revision`
(admin, once re-approved/regenerated).

## Contract tailoring at generation (2026-07-28)

`buildContract(vars, attachments, opts)` where `opts` is `ContractOptions`:

- **Bid page selection** — `BidAttachment.pages` ("6", "1,6-8", 1-based; empty = all). Bids often
  arrive as a sales deck where one page is the actual proposal and the rest is marketing plus the
  contractor's own terms. `GET /projects/:id/bid-pages` reports page counts for the picker.
- **Page marks** — `BidAttachment.marks`: boxes drawn over a bid page, `{page,x,y,w,h,style}` where
  x/y/w/h are fractions of the upright page from the **top-left** (same convention as `SigAnchor`)
  and style is `strike` (ruled through, stays legible — the norm on a contract) or `cover` (blanked,
  labelled REMOVED). Marks carry their **source** page number so they stay attached after page
  filtering. `sanitizeMarks()` rejects anything non-finite or out of 0..1. **`cover` is not
  redaction** — it paints over the text, which is still extractable from the file.
- **`excludedTerms`** — an embedded PDF can't be edited, so terms Owner won't accept are expressly
  rejected in a generated clause and reprinted on the Exhibit A cover page.
- **`omitSections`** — slugs from `contractSectionList()`. The rest renumber. Cross-references are
  **symbolic** (`{SEC:slug}` in the section text) and resolve against the final ordering; omitting a
  section another one cites **throws** rather than shipping a dangling "Section 6".

UI: *Generate contract → Tailor this contract → 🔍 Review bid pages* opens a pdf.js previewer
(`openScopePreviewer` in app.js) — pages with include/exclude checkboxes, drag to draw
strike/cover boxes, click a box to remove it. Marks persist on the bid file (`bids.files[].marks`),
which round-trips because `writeProject` stores `files` as wholesale JSON.

The previewer sheet uses `.sheet-wide` (1440px, vs the editor's 1060px) and has a **1/2/3-across
size control**. Pages render at their *displayed* width × devicePixelRatio, capped at 1600px, and
**re-render when the size changes** rather than upscaling a small bitmap — a bid is dense small
print, and a strike box can't be placed over a line you can't read. One-across is ~1200px, above a
US Letter page's natural 816px at 96dpi. Marks are stored as fractions of the page, so resizing
never moves them.

## Multi-entity contract generator (027, 2026-07-30)

One Independent Contractor Agreement covering work across several properties owned by different
LLCs — landscaping/snow, pest, pool. **Not** a Special Project: no `project_id`, no bid slots, no
lifecycle, no signature chain. Entered from *Contractors ▸ ＋ New multi-entity contract* (that tab
is top-tier admin only — see below).

- **It defaults to a recurring SERVICE agreement.** This form began as Monarch's build contract, so
  it carries punch lists, a Certificate of Occupancy payment condition, a drawings-and-specifications
  clause and an Ownership of Drawings section — none of which belong in a landscaping, pest or pool
  contract. All of it is behind `construction: true` and off by default, as are liquidated damages
  (`liquidatedPerDay`) and stated work hours (`workDays`/`workStart`/`workEnd`) — each blank field
  simply leaves its passage out of Section 6 rather than printing an empty amount. The builder keeps
  them under *Tailor this contract*. `multi-snapshot.mjs` asserts every one of those phrases is
  absent in service mode and present in construction mode.
- **`billing`** is `monthly` | `annual` | `one-time`. It writes the payment sentence in §5.a, labels
  the recurring per-property line item, and feeds the Exhibit A & B narrative. `one-time` hides the
  up-front/ongoing split, which has no meaning when the whole sum is billed once.
- **Exhibits A and B print as one page** — `EXHIBIT A & B / CONTRACT SUM & SCOPE` — with the pricing
  and narrative on top and the bid embedded directly below, the same shape the SP contract uses. A
  long Exhibit B narrative eats the space the bid gets, so keep it short.
- **`src/contract-multi.ts` is a separate template, not a parameterisation of `contract.ts`.** The
  wording differs throughout: 27 sections vs 25, "Contract Sum" not "Contract Price", a §1 General
  Terms block, liquidated damages per day, stated work hours, a warranty split into materials
  (1 yr) / workmanship (2 yr), plus Force Majeure, Owner's Representatives and Ownership of
  Drawings sections the SP template has no equivalent of. Don't try to merge them.
- **The language comes from the executed Legend Lawn 09.2025–08.2026 contract**, read page by page
  off the scan (it has no text layer — no OCR binary on this box, so it was transcribed visually).
  That document is the current form and **wins over the 2024 Crystal Clear .docx** the template was
  first built from; the header comment in `contract-multi.ts` lists every way the 2024 file is
  stale. If you are ever tempted to "fix" the wording, check the scan first — for example the
  name/address pairs really are bare comma lists (`South Pointe, 1301 31st Ave SW #108, …`), not
  "X located at Y", and Exhibit C's cut-off date really is the **Effective** date.
- **Sections whose text cites their own sub-items are `lettered: true`** (§1 General Terms, §5
  Payment, §12 Insurance). `Layout.section` then renders a./b./c. with a hanging indent. This is not
  cosmetic: the text says "this Section 5.b" and "this Section 12.a", so without visible letters
  those references point at nothing on the page. §19 Notices uses `blockIndent: true` instead, so an
  address block's street and phone lines sit under the entity name rather than sliding back to the
  margin.
- **`scripts/multi-snapshot.mjs` reproduces the executed contract** from its own inputs as its last
  case. That is the check that matters after any wording change: dump it and read it against the
  scan. It also writes `<out>-legend.pdf` when given a PDF path.
- **`scripts/compare-templates.mjs` diffs the two templates clause by clause** (`--diff` for the
  word-level differences). The two forms are meant to be mostly in line: 23 of 27 multi sections
  pair with an SP section, and across the clauses they share the only systematic difference is the
  defined term — this form says **"Contract"** where the SP form says **"Agreement"**. Everything
  else in the ≥0.85 band is a real difference carried by the executed document. Run it after
  touching either template; unexplained new drift is a bug.
- The multi form has **no Waiver of Jury Trial and no separate Disputes section**, both of which the
  SP form does have. That is the executed document, not an omission here — but it is a real
  difference in Owner's protections, so it is worth a conscious decision rather than a surprise.
- **The builder keeps its draft** (`MULTI_DRAFT` in app.js). It is a long form and nothing is stored
  until Generate, so closing the sheet — backdrop click included — no longer discards it; reopening
  resumes. Only *Start over* or a successful generate clears it. When adding a field, seed its
  widget from the draft: note that `el()` sets `value` with `setAttribute`, which **does not work
  for `<textarea>`** — assign `.value` after construction.
- **Exhibits A–E** (SP has A&B, C, D): A "See attached bid." + the embedded bid · B the Contract Sum
  as centered free narrative (falls back to the sum + per-property shares if the admin leaves it
  blank) · C conditional waiver, every entity in the `TO:` block · D final waiver, entities inline
  in the prose twice · E a blank change-order form — a grid of `drawFormBox` boxes, the only
  exhibit that isn't prose.
- **Per-property amounts are either one lump sum or an up-front + ongoing pair.** A property with
  an `upfront` and/or `ongoing` amount prints as **two separate line items** — `South Pointe (up
  front): $2,400.00` / `South Pointe (monthly): $1,200.00` — in §1 and again in Exhibit B, so a
  mobilisation or setup charge can never read as part of the recurring fee. `upfront`/`ongoing` win
  over `sum` when either is set; a blank side prints nothing. The recurring label comes from
  `ongoingPeriod` ("monthly"/"quarterly"/…). `lineItems()` is the single place this is built, used
  by both §1 and Exhibit B. **Nothing is totalled onto the document** — the Contract Sum is printed
  exactly as the admin typed it, and a derived second figure on signed paper invites the two to
  disagree. The builder shows column subtotals as a check for the person filling it in only.
- **Entity names print VERBATIM.** Nothing normalises them, because the `", LLC"` comma genuinely
  differs between entities: all five Minot CCXXXI entities are comma-free in every executed
  contract, while the Kansas City ones on the same template use the comma
  (`MIMG CLXXVIII Arbors of Grandview, LLC`). That makes `properties.owner_entity` the thing that
  has to be right — 027 fixed the three Minot rows that carried the seed's comma and deliberately
  left Williston/Watford City (BCND/ECND/FHND/PHND) alone pending an executed document to check.
  The builder never posts a name: it sends property **codes** and the server reads the entities.
- **§12.c names the state, derived.** The executed contract says "licensed to do business in **ND**";
  the 2024 file still said **Kentucky**, a leftover from another market. `insurerStates()` reads the
  state off the ticked properties' addresses, so it prints "ND" here and stays right in another
  region. Falls back to "each state in which the Property is located" if no address parses.
- **Notices gives every entity its own block** — name, its own address, its own phone and email —
  with `Owner:` labelling only the first, exactly as executed. There is no grouping of entities that
  share a destination and no "Office Address:" prefix; an earlier version did both and was wrong.
  A blank per-property phone/email falls back to the property's stored value — the endpoint uses
  `||`, not `??`, precisely because the builder posts `''` for an untouched field.
- **Ticking a property autofills its notice address, phone and email** into editable fields (from
  `owner_notice_addr`/`address`, `notice_phone`, `notice_email`), rather than hinting at them as
  placeholders. Fill happens only when the field has never been touched, so re-ticking a property
  won't overwrite typing. A *Copy first row's notice details to all* button covers the
  one-office-per-portfolio case; there is no separate global override field any more.
- **Refusals** (all HTTP 400, never a half-built document): no property ticked, a ticked property
  with no `owner_entity`, a bid that can't embed (`NO_SCOPE`), a blank field that appears in the
  operative text, and omitting a section another one cites. Note that in *this* template every
  `{SEC:}` cross-reference is a self-reference (5.b, 11, 12.a–c), so today no single omission can
  strand one — `scripts/multi-snapshot.mjs` asserts that, so adding a genuine cross-section
  reference later shows up as a change rather than a silent new failure mode.
- The Contracts view keys multi rows on `'multi:'+id`, not `projectId` — they all have a null
  `projectId` and would otherwise collapse into one row.

**Verifying a change to either contract generator:** `node scripts/contract-snapshot.mjs <out>`
(SP) and `node scripts/multi-snapshot.mjs <out.txt> [out.pdf]` (multi) dump the generated documents
as extracted **text** via `scripts/pdf-text.mjs`. Diff those, **never the file bytes** — pdf-lib's
output is not byte-deterministic, so identical content differs by a couple of bytes per run and a
checksum tells you nothing. The layout-engine extraction was verified exactly this way: byte-for-
glyph identical SP output before and after.

## Gotchas

- Dates arriving as MM/DD/YYYY must go through `dnull()` before hitting date columns.
- GL parser heuristics: 4-digit token in col 0 = account row; 4–6 letter token = property row
  (stopword list filters "Total" etc.); unknown codes are KEPT by design.
- `xlsx` parse uses `raw:false` — everything is formatted text; amounts are cleaned with regex.
- Files (bids, contracts, import workbooks) live in Postgres `files` (bytea), not on disk.
- `seed/initial-data.json` is the reset/first-boot state; `loadStateInto` truncates everything.
- Elk Crossing contract code is ECND-specific history — contract filenames use `properties.contract_code`.
- `properties.owner_entity` is printed verbatim onto signed contracts. Treat it as a legal name of
  record, not a display string: don't "tidy" the `, LLC` punctuation, and check an executed document
  before changing one. See the multi-entity section above.
