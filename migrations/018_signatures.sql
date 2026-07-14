-- Saved e-signatures for in-app countersigning (one per username; the PNG
-- lives in the files table). Used by admins to countersign contractor-signed
-- contracts without the download/sign/scan/reattach loop.
create table if not exists signatures (
  username   text primary key,
  file_key   text not null,
  title      text default '',
  updated_at timestamptz default now()
);
