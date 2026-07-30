-- Track first/last sign-in so the roster can distinguish a pre-created account
-- from one that has actually been used — 2026-07-28
--
-- Admins can now add people before they ever log in (to assign a PM's sites up
-- front), so "row exists" no longer implies "has signed in". Null = never.
alter table app_users add column if not exists last_seen timestamptz;

-- Existing rows only ever appeared via a login, so backfill from created_at
-- rather than leaving them all looking like they've never signed in.
update app_users set last_seen = created_at where last_seen is null;
