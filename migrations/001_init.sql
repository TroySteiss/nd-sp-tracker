-- ND Special-Projects / Capex Tracker — initial schema (spec §10.2)
-- Per-record rows so concurrent edits don't clobber each other.

create table if not exists properties (
  code        text primary key,
  name        text not null,
  region      text not null,
  manager     text not null,
  color       text not null,
  sp_budget   numeric default 0,
  units       integer default 0
);

create table if not exists projects (
  id                text primary key,
  property_code     text not null references properties(code),
  category          text not null default 'GENERAL',
  name              text not null,
  description       text default '',
  plan              text default '',
  action_item       text default '',
  contractor        text default '',
  anticipated_cost  numeric,
  actual_cost       numeric,
  date_added        date,
  planned_start     date,
  planned_end       date,
  steps             jsonb not null default '{}',
  notes             text default '',
  on_hold           boolean default false,
  pinned            boolean default false,
  in_house          boolean default false,
  ih_unit           text default 'budget',
  total_to_complete numeric,
  amount_completed  numeric,
  no_contract       boolean default false,
  no_contract_set   boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists idx_projects_property on projects(property_code);

create table if not exists bids (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  slot        smallint not null,
  contractor  text default '',
  amount      numeric,
  approved    boolean default false,
  file_key    text,
  file_name   text,
  file_size   integer
);
create index if not exists idx_bids_project on bids(project_id);

create table if not exists progress_notes (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  date        date not null,
  note        text not null
);
create index if not exists idx_progress_notes_project on progress_notes(project_id);

create table if not exists cash_snapshots (
  property_code text primary key references properties(code),
  as_of_date    date,
  cash          numeric,
  adj_cash      numeric,
  sp_budget     numeric,
  sp_spent      numeric,
  sp_remaining  numeric,
  noi           numeric,
  ds            numeric,
  dcr           numeric,
  market_value  numeric,
  loan_amount   numeric,
  ltv           numeric,
  loan_due      text,
  loan_rate     numeric,
  io_end        text
);

create table if not exists cash_adjustments (
  id            text primary key,
  property_code text not null references properties(code),
  date          date not null,
  amount        numeric not null,
  note          text default ''
);
create index if not exists idx_cash_adj_property on cash_adjustments(property_code);

create table if not exists gl_lines (
  id                text primary key,
  property_code     text not null references properties(code),
  account           text,
  category          text,
  date              date,
  vendor            text,
  control           text,
  amount            numeric not null,
  remarks           text,
  linked_project_id text references projects(id) on delete set null,
  partial           boolean default false
);
create index if not exists idx_gl_property on gl_lines(property_code);
create index if not exists idx_gl_linked on gl_lines(linked_project_id);

create table if not exists app_meta (
  id          smallint primary key default 1,
  gl_period   text,
  cash_as_of  date,
  version     integer default 1
);

-- session store for express-session / connect-pg-simple
create table if not exists "session" (
  sid    varchar not null collate "default" primary key,
  sess   json not null,
  expire timestamp(6) not null
);
create index if not exists idx_session_expire on "session"(expire);
