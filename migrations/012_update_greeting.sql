-- Optional greeting-name override for the SP update-check email drafts.
-- When blank, the greeting is derived from the To address (local part before
-- the dot: kianna.parisien@... -> "Kianna"), falling back to the manager name.

alter table properties
  add column if not exists update_greeting text default '';
