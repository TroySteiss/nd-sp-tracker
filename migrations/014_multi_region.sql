-- Multi-region rework: regions become data, imports keep everything,
-- change log + usernames, editable app title, per-property portfolio.

-- Regions are rows, not hardcoded strings. Nav/dashboard group by these, ordered by sort.
create table if not exists regions (
  name text primary key,
  sort integer not null default 0
);
insert into regions(name, sort) values ('Minot', 1), ('Williston', 2)
on conflict (name) do nothing;

-- Quarterly-summary grouping (was hardcoded PORTFOLIOS in app.js).
alter table properties add column if not exists portfolio text default '';
update properties set portfolio = 'Minot 4 Portfolio'            where code in ('CLND','SPND','TCND','TPND') and coalesce(portfolio,'') = '';
update properties set portfolio = 'Williston 2 Portfolio'        where code in ('BCND','ECND')               and coalesce(portfolio,'') = '';
update properties set portfolio = 'Basin Portfolio'              where code in ('FHND','PHND')               and coalesce(portfolio,'') = '';
update properties set portfolio = 'The Wyatt at Northern Lights' where code = 'WYND'                          and coalesce(portfolio,'') = '';

-- GL lines and cash snapshots may now hold data for properties that are not
-- configured yet (kept from imports so files never need re-uploading).
alter table gl_lines       drop constraint if exists gl_lines_property_code_fkey;
alter table cash_snapshots drop constraint if exists cash_snapshots_property_code_fkey;
-- Units from the cushion are kept on the snapshot too, so a property added
-- later can pick them up (properties.units is only writable for known codes).
alter table cash_snapshots add column if not exists units integer;

-- Import history: every confirmed GL/cushion upload keeps its raw workbook
-- (files table) so it can be re-downloaded and never needs re-uploading.
create table if not exists imports (
  id          text primary key,
  kind        text not null,             -- 'gl' | 'cushion'
  file_key    text,
  file_name   text,
  label       text,                      -- GL period / cushion as-of
  count       integer default 0,
  by_property jsonb default '{}',
  username    text default '',
  created_at  timestamptz default now()
);
create index if not exists idx_imports_created on imports(created_at desc);

-- Change log: who did what, when.
create table if not exists change_log (
  id            text primary key,
  ts            timestamptz default now(),
  username      text default '',
  action        text not null,           -- e.g. 'project.update', 'import.gl'
  entity_type   text default '',
  entity_id     text default '',
  property_code text default '',
  summary       text not null,
  details       jsonb
);
create index if not exists idx_change_log_ts on change_log(ts desc);

-- App title is editable in Settings (multi-region: no longer "North Dakota").
alter table app_meta add column if not exists app_title text default 'Monarch SP Tracker';
