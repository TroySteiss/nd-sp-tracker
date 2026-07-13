-- "Contractor Signed Contract" slot: the one-party-signed contract returned by
-- the contractor, held between "generated" and "executed" (countersigned).
-- Projects with this file but no executed contract feed the dashboard's
-- "Awaiting signature" panel.
alter table projects add column if not exists contractor_signed_file_key  text;
alter table projects add column if not exists contractor_signed_file_name text;
