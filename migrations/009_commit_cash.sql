-- Per-project toggle: force a discussed/planned project into outstanding
-- commitments (projected cash), even without full bids or an executed contract.

alter table projects
  add column if not exists commit_cash boolean default false;
