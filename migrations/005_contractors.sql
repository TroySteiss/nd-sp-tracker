-- Contractor directory: imported from Excel, used to validate contractor name fields.

create table if not exists contractors (
  id          text primary key,
  name        text not null unique,
  address     text default '',
  phone       text default '',
  email       text default '',
  category    text default '',
  notes       text default '',
  created_at  timestamptz default now()
);

-- Executed contract file and lien waiver file on a project.
alter table projects
  add column if not exists executed_contract_file_key  text,
  add column if not exists executed_contract_file_name text,
  add column if not exists lien_waiver_file_key        text,
  add column if not exists lien_waiver_file_name       text;
