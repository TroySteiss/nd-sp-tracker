-- Multiple files per bid slot (ordered: first = scope/contract totals, rest = supporting docs) added 2026-06-30
ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]';
