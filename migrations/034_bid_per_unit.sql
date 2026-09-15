-- Per-unit bids (034): vendors often quote PER UNIT ("$1,857 per patio") while
-- the project tracks a quantity (5 patios) and a TOTAL ($9,285). per_unit on
-- the bid says its amount multiplies by the project's quantity everywhere a
-- bid amount flows into a total: approving the bid, the generate dialog's
-- Contract total prefill, and the combined-contract picker. Default false =
-- lump-sum, the old behavior.
alter table bids add column if not exists per_unit boolean not null default false;
