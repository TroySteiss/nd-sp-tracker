-- Contract revision requests — 2026-07-28
--
-- A bad contract (wrong scope, wrong price, wrong party) has to go back past
-- approval: the office re-picks/re-approves the bid and regenerates. Flagging a
-- revision clears `approved` and the whole contract chain, so the project
-- re-enters the pipeline at pre-approval rather than sitting in execution with a
-- document nobody trusts.
--
-- The superseded documents are NOT deleted — they move into
-- superseded_contracts so the history of what was wrong survives, and the
-- live contract_* / executed_* / contractor_signed_* columns are cleared.
alter table projects add column if not exists revision_requested_at   timestamptz;
alter table projects add column if not exists revision_requested_by   text;
alter table projects add column if not exists revision_reason         text;

-- Ordered archive of contract documents cleared by a revision request.
-- [{ at, by, reason, files:[{slot,fileKey,fileName}] }]
alter table projects add column if not exists superseded_contracts jsonb not null default '[]'::jsonb;
