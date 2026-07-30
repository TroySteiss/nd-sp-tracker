# PROJECT MAP — SP Tracker (multi-region)

> Structural map of this repo so a new session can orient without re-exploring.
> **Keep this file updated when you change the architecture** (new tables, endpoints, views, build steps).
> Last updated: 2026-07-28 (property-manager view at /pm; two admin tiers; contract
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
   │     ├── src/contract.ts    Independent Contractor Agreement PDF (pdf-lib) — REFUSES to
   │     │                      generate if the bid can't embed (no placeholder scope, ever)
   │     ├── src/convert.ts     Office→PDF via headless LibreOffice (bid uploads auto-convert;
   │     │                      original kept; nixpacks.toml installs LO on Railway;
   │     │                      /healthz reports docConvert; SOFFICE_PATH env override)
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
  | `admin` | `ADMIN_USERS` env (default Troy Steiss, Riley Combs) | everything: Settings, user roster, Change log, bid approval, contract generation, backup/restore/reset, countersign, clear a revision flag |
  | `manager` | `MANAGER_USERS` env (default Holly Haman, Brittanee Purdue/Perdue) | **currently identical to `user`** — see below |
  | `user` | default for anyone not listed | full tracker; no admin tabs, no Change log, cannot approve |
  | `pm` | admin assigns in Settings (`app_users.role`) | the stripped `/pm` view only, scoped to their sites |

  **`manager` is a named tier that grants nothing extra yet.** It exists so the second-level admins
  are on record and allowlisted, ready for permissions to be attached later; today it behaves
  exactly like `user`. Every gate in routes.ts checks `isAdminUser`, so widening the tier means
  changing those gates — not auth.ts. Don't assume from the name that a manager can approve or read
  the change log; they can't.

  Both admin tiers are **env allowlists, not DB rows**, so they survive a restore and can't be
  edited from inside the app; `app_users` only ever stores `user`/`pm`. Tiers nest —
  `isManagerUser()` is true for admins. Names match on letters only (`normUser`), so
  "Holly Haman" / "holly.haman" / "HollyHaman" are one person; both Purdue and Perdue spellings
  are listed deliberately, because a mismatch would silently demote someone to `user`.
  The only middleware is `requireAdmin`. The client mirrors it as `IS_ADMIN`, but **the server
  enforces regardless** — login is a single shared password with a free-form username, so a role
  scopes the UI and the routes; it is **not** authentication and must never be treated as proof of
  identity.
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
| properties | property registry | pk `code`; region/manager/color/portfolio/contract_code/owner_entity/addresses/projection settings; update-email fields incl. `update_enabled` (in bulk download) + `update_include_discussed` (015) |
| regions | region registry | pk `name`, `sort` — drives nav & dashboard grouping (014) |
| projects | SP projects | jsonb `steps`; server re-applies cost rules on write |
| bids / progress_notes | per-project children | rewritten wholesale on each project save; notes carry `username`, `ts`, `files` jsonb (015) — server stamps missing author/ts from the session |
| cash_snapshots | latest cushion per property | **no FK** — holds rows for not-yet-added properties (014); has `units`; `cash_after_dist` (cushion Col V) + `projected_dist` (Col U) base the year-end cash projection (020); `budget_ret_q1..q4` (Cols AE–AH) drive forward per-quarter accretion (021) |
| cash_adjustments | mid-month deltas | FK to properties; survives imports |
| gl_lines | SP general ledger | **no FK** (014) — keeps lines for unknown codes; `linked_project_id` ties to projects |
| contracts | generated-contract records | Contracts view |
| contractors | vendor directory | unique name |
| files | uploaded/generated files as bytea | survive Railway redeploys (no volume) |
| imports | import history (014) | kind gl/cushion, raw workbook file_key, label, counts, username |
| change_log | who/what/when audit (014) | username, action, summary, details jsonb |
| app_meta | single row | gl_period, cash_as_of, `app_title` (014), `cash_tile_mode` (022 — display only) |
| app_users | user roster (023) | pk `key` = normalized username; `role` ('pm'/'user'), `sites` jsonb for a PM's covered properties. Rows appear on first login (`auth.touchUser`) |
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
- Settings/admin: `POST/PATCH/DELETE /properties[/:code]`, `POST/PATCH/DELETE /regions[/:name]`,
  `PATCH /meta` (app title and/or cash tile mode — both optional, so one panel can't clobber the
  other), `PATCH /properties/:code/recipients|settings`.
  - Creating a property picks up any pre-imported GL lines + cushion snapshot (sp_budget/units copied).
  - Deleting a property is blocked while projects/contracts/adjustments reference it; GL/snapshot rows are kept.
- Change log: `GET /changelog?limit&before&user&property`.
- Contractors: `GET/POST/DELETE /contractors`, `POST /contractors/import`.
- Backup: `GET /export/backup.json`, `GET /export/projects.csv`, `POST /restore`, `POST /reset`.
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
| data | viewData | GL/cushion upload + preview modals, **import history**, backup/restore |
| directory | viewDirectory | contractors |
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
  build:server lists every src/*.ts entry explicitly — add new files there! pm.ts and revision.ts are in the list).
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
(`openScopePreviewer` in app.js) — page thumbnails with include/exclude checkboxes, drag to draw
strike/cover boxes, click a box to remove it. Marks persist on the bid file (`bids.files[].marks`),
which round-trips because `writeProject` stores `files` as wholesale JSON.

## Gotchas

- Dates arriving as MM/DD/YYYY must go through `dnull()` before hitting date columns.
- GL parser heuristics: 4-digit token in col 0 = account row; 4–6 letter token = property row
  (stopword list filters "Total" etc.); unknown codes are KEPT by design.
- `xlsx` parse uses `raw:false` — everything is formatted text; amounts are cleaned with regex.
- Files (bids, contracts, import workbooks) live in Postgres `files` (bytea), not on disk.
- `seed/initial-data.json` is the reset/first-boot state; `loadStateInto` truncates everything.
- Elk Crossing contract code is ECND-specific history — contract filenames use `properties.contract_code`.
