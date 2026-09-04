-- Non-SP budget notes — 2026-08-26
--
-- A per-property planning ledger for ABOVE-THE-LINE (operationally funded)
-- recurring costs with month-level timing: annual fire inspections, landscaping
-- and snow-removal contracts, elevator service. Each item is an amount that
-- lands in ONE month of the year, every year from first_year through last_year
-- (either end NULL = open-ended). Purely informational, by the same principle
-- as ATL projects: nothing in cashModel / auditModel / the plan reads this
-- table — it exists so budget season is a read-off, not a reconstruction.
create table if not exists budget_items (
  id            text primary key,
  property_code text not null references properties(code) on delete cascade,
  name          text not null,
  vendor        text default '',
  amount        numeric,
  month         integer not null check (month between 1 and 12),
  first_year    integer,          -- null = already ongoing
  last_year     integer,          -- null = ongoing indefinitely
  notes         text default '',
  file_key      text,             -- optional attachment (e.g. the signed contract)
  file_name     text,
  created_by    text default '',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_budget_items_property on budget_items(property_code);
