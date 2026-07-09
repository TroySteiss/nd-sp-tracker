-- Multi-property projects: one project can be split across several properties.
-- `split` holds {mode:'units'|'custom', list:[{property, pct}, ...]} — pcts sum
-- to 100; the first list entry is the lead property (= projects.property_code).
-- Null = single-property project (existing behavior).
alter table projects add column if not exists split jsonb;
