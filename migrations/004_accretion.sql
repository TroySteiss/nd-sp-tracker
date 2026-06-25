-- Annual accretion + interest projection inputs.
-- Cushion-sourced figures live on the snapshot; user-editable settings live on the property.

alter table cash_snapshots add column if not exists capital        numeric;  -- $000s from cushion
alter table cash_snapshots add column if not exists return_earned  numeric;  -- "Earnings before SP & AM Adj" %
alter table cash_snapshots add column if not exists return_sent    numeric;  -- latest completed quarter distribution %

alter table properties add column if not exists accretion_pct        numeric;            -- editable override of return_earned (null = use cushion)
alter table properties add column if not exists avg_monthly_interest numeric default 0;  -- editable avg monthly interest-income sweep
