-- Property-view "Current cash" tile display mode — 2026-07-27
-- DISPLAY ONLY. 'current' (default) shows cash today = snapshot + adjustments;
-- 'afterDist' shows the cushion's "Cash After Distribution" (Col V) instead.
-- No projection, reconciliation or budget math reads this column — the year-end
-- projection already bases on Col V regardless (see 020_cash_after_dist.sql).
alter table app_meta add column if not exists cash_tile_mode text default 'current';
