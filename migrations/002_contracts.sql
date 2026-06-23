-- Contract generation: remembered legal data per property + generated contract file on the project.

alter table properties
  add column if not exists owner_entity      text default '',
  add column if not exists address           text default '',
  add column if not exists owner_notice_addr text default '';

alter table projects
  add column if not exists contract_file_key  text,
  add column if not exists contract_file_name text;
