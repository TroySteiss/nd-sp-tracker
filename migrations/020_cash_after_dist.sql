-- Cushion "Cash After Distribution" (Col V) + "Projected Distribution Amount" (Col U) — 2026-07-17
-- The year-end cash projection now bases on the report's authoritative Cash After Distribution
-- instead of estimating the current-quarter distribution client-side.
ALTER TABLE cash_snapshots
  ADD COLUMN IF NOT EXISTS cash_after_dist numeric,
  ADD COLUMN IF NOT EXISTS projected_dist  numeric;
