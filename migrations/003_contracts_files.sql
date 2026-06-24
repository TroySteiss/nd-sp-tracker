-- DB-backed file storage (so bid docs + contracts persist across redeploys with no volume)
-- and a first-class contracts table. Schema only — owner entities and the initial contract
-- records are loaded via the seed (after properties exist), not here, so a fresh database
-- migrates cleanly before any rows are seeded.

create table if not exists files (
  key        text primary key,
  name       text,
  mime       text default 'application/octet-stream',
  size       integer,
  bytes      bytea not null,
  created_at timestamptz default now()
);

create table if not exists contracts (
  id              text primary key,
  project_id      text references projects(id) on delete set null,
  property_code   text references properties(code),
  output_filename text,
  owner_entity    text default '',
  contractor      text default '',
  total           numeric,
  effective_date  date,
  term_end        date,
  scope           text default '',
  file_key        text,
  created_at      timestamptz default now()
);
create index if not exists idx_contracts_property on contracts(property_code);
create index if not exists idx_contracts_project on contracts(project_id);

-- filename code per property (defaults to the property code)
alter table properties add column if not exists contract_code text;
update properties set contract_code = code where contract_code is null;
