-- Phased programs (032): one capex program executed as several phases — e.g.
-- one building per quarter for four years, each phase with its OWN contract,
-- contractor and dates. A phase is a full ordinary project row; siblings share
-- phase_group (a uid). phase_of is the program's display name, denormalized
-- onto every row so each phase is self-describing in exports/backups; it is
-- renamed group-wide via PATCH /api/programs/:group. phase_seq orders the
-- phases (1-based). All three NULL = a normal, unphased project.
alter table projects add column if not exists phase_group text;
alter table projects add column if not exists phase_seq int;
alter table projects add column if not exists phase_of text;
create index if not exists idx_projects_phase_group on projects(phase_group);
