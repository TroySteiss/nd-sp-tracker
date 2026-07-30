-- Property-manager view: user roster + PM review requests — 2026-07-28
--
-- Roles are assigned by an admin in Settings. `key` is the normalized username
-- (lowercase, letters only) so it matches the same loose comparison auth.ts uses
-- for ADMIN_USERS — "Troy.Steiss", "troy steiss" and "TroySteiss" are one user.
--
-- NOTE: login is a single shared password with a free-form username, so a role
-- here scopes what the UI offers and what the /api/pm/* routes accept. It is a
-- guardrail against accidents, NOT an authentication boundary.
create table if not exists app_users (
  key         text primary key,                    -- normalized username
  display     text not null default '',            -- as last typed at login
  role        text not null default 'pm',          -- 'pm' | 'user' | 'admin'
  sites       jsonb not null default '[]'::jsonb,  -- property codes a PM covers
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- A PM collects bids then hands the project off for review. This records the
-- handoff; admins act on it in the full view. PMs never advance lifecycle steps.
alter table projects add column if not exists pm_review_requested_at timestamptz;
alter table projects add column if not exists pm_review_requested_by text;
