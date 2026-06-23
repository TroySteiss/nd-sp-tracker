# ND Special-Projects / Capex Tracker (hosted, multi-user)

A shared web tool for tracking special-projects / capital-expenditure work across the
9-property North Dakota multifamily portfolio (Minot — Holly Haman; Williston — Brittanee Purdue).

It tracks the 12-step project lifecycle (plan → bids → approve → contract → sign → file →
work → pay → close → lien), per-property cash position and loan terms, and reconciles project
records against the Yardi general ledger. It ingests two spreadsheet feeds — the **SP general
ledger** and the **cash-cushion report** — and surfaces budgets, projected cash, and
reconciliation flags. Mid-month cash adjustments layer on top of the monthly snapshot.

This is the hosted, multi-user version: data lives in **PostgreSQL**, every edit is a
per-record write (so two people editing different things never clobber each other), and access
is gated by a shared team password (swappable for Microsoft 365 / Entra SSO later — see
[DEPLOY.md](DEPLOY.md)).

## Stack

- **Backend:** Node + TypeScript + Express (`src/`)
- **Database:** PostgreSQL (`migrations/`, accessed via `pg`)
- **Frontend:** the original vanilla HTML/CSS/JS UI, adapted to call the REST API (`public/`)
- **Domain logic:** one shared, unit-tested module (`shared/domain.ts`) — the lifecycle/cascade
  rules, phase tree, cash & audit math, the $5K threshold, per-property colors, and the 33
  categories. **This is the contract** (see "Domain logic" below).
- **Spreadsheet parsing:** server-side via SheetJS (`src/importers.ts`)

## Local development

Prereqs: **Node 20+** and **PostgreSQL** running locally. (Both were installed via `winget`
during setup: `OpenJS.NodeJS.LTS` and `PostgreSQL.PostgreSQL.17`.)

```bash
# 1. Install deps (also builds the client domain bundle via postinstall)
npm install

# 2. Configure environment
cp .env.example .env          # adjust DATABASE_URL / APP_PASSWORD if needed

# 3. Create the database (once)
#    psql -U postgres -c "CREATE DATABASE sp_tracker"

# 4. Create tables and load the starter data
npm run migrate
npm run seed                  # loads seed/initial-data.json (94 projects, GL, cash snapshots)

# 5. Run
npm run dev                   # http://localhost:3000  (default password: northdakota)
```

Run the domain unit tests:

```bash
npm test
```

## Project layout

```
shared/domain.ts        # THE CONTRACT — lifecycle, phase, cash/audit math, constants, colors
shared/domain.test.ts   # unit tests locking the contract (23 tests)
src/
  server.ts             # Express entry: auth gate + /api + static UI
  db.ts                 # pg pool, row<->object mappers, GET /api/state assembly
  routes.ts             # REST API (per-record writes, imports, exports, reset/restore)
  auth.ts               # shared-password session gate (Postgres-backed sessions)
  importers.ts          # server-side GL + cash-cushion .xlsx parsers
  migrate.ts            # runs migrations/*.sql
  seed.ts               # loads seed/initial-data.json into Postgres (reused by reset/restore)
migrations/001_init.sql # schema (per-record tables + session store)
seed/initial-data.json  # current real dataset, exported from the original single-file app
public/                 # index.html (login + shell), app.js (UI), styles.css, domain.js
scripts/                # how public/app.js was derived from the original ND_SP_Tracker_10.html
```

## Domain logic — the contract

Every classification and money rule lives in [`shared/domain.ts`](shared/domain.ts), ported
verbatim from the original `ND_SP_Tracker_10.html`. The 23 unit tests in `domain.test.ts` lock
the behavior (advance/cascade lock-in, the phase decision tree, no-contract N/A handling, the
in-house budget/quantity split, `cashModel`, `auditModel`, `glMatchScore`, tile tones, the $5K
threshold). **If you change these rules, update both the module and the tests** — they are what
keep the numbers matching the team's reconciliation against Yardi.

The server uses this module for write-time rules (cost→`planned`, the sub-$5K no-contract
default), the importers, and the constants. The browser UI currently keeps its own copy of the
display math (inherited from the original single-file app); `public/domain.js` is a browser
build of the shared module, ready for a future refactor that routes the UI through it too.

## The two spreadsheet uploads

Both are parsed **server-side** with a preview-before-apply step (Upload & Data view):

- **General ledger** (`GeneralLedger_northda_cash.xlsx`): replaces the GL. Reads the first
  sheet; 4-digit rows are account/category headers, 4-letter rows are property lines
  (`tpndc → TPND`); `amount = debit − credit`.
- **Cash cushion** (`… Cash Cushion Report.xlsx`): upserts each property's cash snapshot, SP
  budget, units, and loan terms. **Mid-month cash adjustments are preserved** across re-imports.

## Backup / restore / reset (Upload & Data view)

- **Export backup (.json)** — full dataset, same shape as the original app's export.
- **Import backup** — replaces ALL data with an uploaded backup.
- **Export projects (.csv)** — flat project list.
- **Reset to starter data** — reloads `seed/initial-data.json` (affects everyone).
