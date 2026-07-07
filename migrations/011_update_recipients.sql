-- Per-property To / CC recipients for the SP update-check email drafts.

alter table properties
  add column if not exists update_to text default '',
  add column if not exists update_cc text default '';
