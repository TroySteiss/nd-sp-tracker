# Using this project as a template for your own portfolio

This app was built for a North Dakota multifamily portfolio, but everything that ties it to a
specific set of properties lives in a handful of files. Follow this checklist to retarget it to
**your** properties. You'll end up with the same tool — lifecycle tracking, GL + cash-cushion
uploads, projected cash, reconciliation, and contract generation — pointed at your data.

> **Tip:** if this repo is marked as a GitHub *template*, click **"Use this template"** to get a
> fresh copy with no commit history. Otherwise fork or clone it, then re-point `git remote`.

## 1. Define your portfolio — `shared/domain.ts`
This is the single source of truth for which properties exist.
- **`PROPERTIES`** — replace with your property codes, names, regions, and managers.
- **`PCOLOR`** — give each property code a hex color (used on cards, tables, nav dots, the funnel).
- Optional: **`CATEGORIES`** (your capex categories), **`LIFECYCLE`** (only if your steps differ —
  most teams keep the 12 steps), **`OVER_THRESHOLD`** (the $5K rule for no-contract / flags).

The 23 unit tests in `shared/domain.test.ts` lock the money/lifecycle math — run `npm test` after
any change here.

## 2. Start with an empty dataset
The repo ships a blank starting file at **`seed/template-blank.json`**. Make it the active seed:

```bash
cp seed/template-blank.json seed/initial-data.json
```

Now the first boot seeds your `PROPERTIES` (from step 1) with **no** projects, GL, cash, or
contracts — a clean slate. You'll load real data from inside the app (step 6).

> Per-property **owner entities / legal addresses** for contracts are remembered automatically the
> first time you generate a contract for a property. You can also pre-set them by adding
> `ownerEntity` / `address` to each property in `seed/initial-data.json`.

## 3. Branding
- `public/index.html` — the login card title and the `SP` glyph.
- `public/app.js` — the left-rail brand block ("North Dakota" / "Special Projects · Capex").

## 4. Run it locally
Prereqs: Node 20+ and PostgreSQL.

```bash
npm install
cp .env.example .env          # set APP_PASSWORD; DATABASE_URL points at your local Postgres
createdb your_db_name         # or: psql -U postgres -c "CREATE DATABASE sp_tracker"
npm run migrate
npm run seed                  # loads seed/initial-data.json
npm run dev                   # http://localhost:3000
```

## 5. Deploy (Railway)
See **`DEPLOY.md`**. In short: push to your own GitHub repo → Railway "Deploy from GitHub repo" →
add the PostgreSQL plugin → set `DATABASE_URL`, `SESSION_SECRET`, `APP_PASSWORD`, `NODE_ENV=production`.
Migrations and first-boot seeding run automatically.

## 6. Load your real data (inside the app)
- **Upload & Data → General ledger**: upload your Yardi SP GL export (replaces the GL).
- **Upload & Data → Cash cushion**: upload your cushion report (sets each property's cash, SP
  budget, units, loan terms). Mid-month cash adjustments are preserved across re-imports.
- Add projects, attach bids, and use **Generate Contract** from a project's Bids panel.
- Export a JSON backup anytime from **Upload & Data**.

## What you do NOT need to change
The REST API, the Postgres schema/migrations, the contract PDF generator, file storage, auth, and
the import parsers are all portfolio-agnostic. If your GL / cushion spreadsheets follow the same
Yardi-style layout, the importers work as-is; if their columns differ, the parsing rules are in
`src/importers.ts`.
