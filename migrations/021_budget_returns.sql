-- Quarterly budgeted return % (cushion Cols AE–AH) — 2026-07-17
-- Remaining accretion accretes each future quarter's budgeted return net of the distribution rate.
ALTER TABLE cash_snapshots
  ADD COLUMN IF NOT EXISTS budget_ret_q1 numeric,
  ADD COLUMN IF NOT EXISTS budget_ret_q2 numeric,
  ADD COLUMN IF NOT EXISTS budget_ret_q3 numeric,
  ADD COLUMN IF NOT EXISTS budget_ret_q4 numeric;
