-- Exact signature-block location captured when a contract is generated
-- {page, xPct, yPct, widthPct} — so in-app countersigning always lands on the
-- Owner "By:" line (the signature page), never on a lien-waiver exhibit whose
-- page position shifts with the embedded bid's length.
alter table projects add column if not exists sig_anchor jsonb;
