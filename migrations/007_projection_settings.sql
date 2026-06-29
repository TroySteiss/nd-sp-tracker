-- Projection-toggle and per-quarter distribution settings added 2026-06-29
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS include_accretion_in_proj boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS include_returns_in_proj boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS distribution_quarters jsonb DEFAULT '{}';
