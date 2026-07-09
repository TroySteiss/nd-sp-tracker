# PROJECT MAP — SP Tracker (multi-region)

> Structural map of this repo so a new session can orient without re-exploring.
> **Keep this file updated when you change the architecture** (new tables, endpoints, views, build steps).
> Last updated: 2026-07-09 (multi-region rework; ATL projects, notes w/ attachments, generate-contract section, email setup).

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
   │     ├── src/contract.ts    Independent Contractor Agreement PDF (pdf-lib)
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
| cash_snapshots | latest cushion per property | **no FK** — holds rows for not-yet-added properties (014); has `units` |
| cash_adjustments | mid-month deltas | FK to properties; survives imports |
| gl_lines | SP general ledger | **no FK** (014) — keeps lines for unknown codes; `linked_project_id` ties to projects |
| contracts | generated-contract records | Contracts view |
| contractors | vendor directory | unique name |
| files | uploaded/generated files as bytea | survive Railway redeploys (no volume) |
| imports | import history (014) | kind gl/cushion, raw workbook file_key, label, counts, username |
| change_log | who/what/when audit (014) | username, action, summary, details jsonb |
| app_meta | single row | gl_period, cash_as_of, `app_title` (014) |
| session / _migrations | infra | — |

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
  `PATCH /meta` (app title), `PATCH /properties/:code/recipients|settings`.
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
| changelog | viewChangelog | Admin group; filters by user/property, load-more pagination |
| settings | viewSettings | Admin group; app title, regions manager, properties table + editor modal |

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
  build:server lists every src/*.ts entry explicitly — add new files there!).
- Deploy: Railway, `railway.json`; DB env `DATABASE_URL`, auth env `APP_PASSWORD`, `SESSION_SECRET`.
- Local DB: postgres:postgres@localhost:5432/sp_tracker (Postgres 17 via winget).

## Gotchas

- Dates arriving as MM/DD/YYYY must go through `dnull()` before hitting date columns.
- GL parser heuristics: 4-digit token in col 0 = account row; 4–6 letter token = property row
  (stopword list filters "Total" etc.); unknown codes are KEPT by design.
- `xlsx` parse uses `raw:false` — everything is formatted text; amounts are cleaned with regex.
- Files (bids, contracts, import workbooks) live in Postgres `files` (bytea), not on disk.
- `seed/initial-data.json` is the reset/first-boot state; `loadStateInto` truncates everything.
- Elk Crossing contract code is ECND-specific history — contract filenames use `properties.contract_code`.
