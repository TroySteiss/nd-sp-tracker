-- Per-project quantity (033): "on the DRND patio, please include 5 patios
-- ($9,285 total)" — a count plus a unit label on the project ("5 patios").
-- Shown as a chip on rows/cards, appended to contract scope text and to a
-- combined contract's printed segment name. The editor keeps quantity ×
-- per-unit price = anticipated cost in step while typing; only quantity and
-- the unit are STORED (a stored per-unit price could disagree with the total).
alter table projects add column if not exists quantity numeric;
alter table projects add column if not exists quantity_unit text;
