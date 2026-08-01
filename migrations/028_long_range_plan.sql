-- 028: long-range plan (loan-term horizon)
--
-- plan_years  jsonb on projects: planned $ per calendar year, keyed "2026",
--             "2027", ... plus the special key "post" = the Post-Refi bucket
--             (work deferred until cash replenishes after refinance).
--             NULL / absent = the project is not on the long-range plan.
-- plan_kind   'completion' | 'recurring' — the TRMO Fannie tracker's
--             "To Completion or Recurring?" column. Only meaningful when
--             plan_years is set.
-- lender_flag free-text lender designation ("Fannie"); non-empty = the item is
--             lender-required (came out of a lender inspection). Blank = not.
alter table projects add column if not exists plan_years jsonb;
alter table projects add column if not exists plan_kind text;
alter table projects add column if not exists lender_flag text;

-- Optional per-property override for the plan's final year. Default horizon is
-- the loan-due year from the latest cushion import (5 years when neither the
-- override nor a parseable loan_due exists).
alter table properties add column if not exists plan_end_year int;
