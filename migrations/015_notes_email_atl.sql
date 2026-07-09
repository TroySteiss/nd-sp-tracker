-- Project notes get an author, a precise timestamp, and attachments;
-- update-email settings gain an include-in-batch flag and a discussed/notes toggle.

alter table progress_notes add column if not exists username text default '';
alter table progress_notes add column if not exists ts timestamptz;
alter table progress_notes add column if not exists files jsonb default '[]';

alter table properties add column if not exists update_enabled boolean default true;
alter table properties add column if not exists update_include_discussed boolean default false;
