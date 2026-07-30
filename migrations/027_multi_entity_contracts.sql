-- Multi-entity contract generator — 2026-07-30
--
-- The multi-entity Independent Contractor Agreement covers work spanning several
-- properties owned by different LLCs (landscaping/snow, pest, pool). It is NOT a
-- Special Project: no project_id, no bid slots, no lifecycle. contracts.project_id
-- was already nullable, so these records live in the same table, told apart by
-- `kind`.

alter table contracts add column if not exists kind text not null default 'sp';
-- Everything already in the table was generated from a Special Project.
update contracts set kind = 'sp' where kind is null or kind = '';

-- The entity list, owner's reps, work hours, liquidated damages and Exhibit B text
-- for a 'multi' contract. There is no other home for them: property_code holds one
-- code and a multi contract spans several.
alter table contracts add column if not exists details jsonb not null default '{}'::jsonb;

-- A multi contract's Notices section pairs each entity with its own phone + email.
-- Stored per property so the builder pre-fills them next time, the same way
-- owner_entity / owner_notice_addr already do.
alter table properties add column if not exists notice_phone text default '';
alter table properties add column if not exists notice_email text default '';

-- Entity names print VERBATIM on signed paper — the generator deliberately does no
-- normalising, because the ", LLC" comma genuinely differs between entities. That
-- makes the stored value the thing that has to be right.
--
-- The five Minot CCXXXI entities are spelled WITHOUT the comma in every executed
-- contract on this template (the Crystal Clear 9.2024 agreement and the executed
-- Legend Lawn 09.2025-08.2026 agreement). The seed carried the comma form. Fix the
-- ones we have executed evidence for, and only those:
update properties set owner_entity = 'MIMG CCXXXI Commons Sub LLC'
  where code = 'CLND' and owner_entity = 'MIMG CCXXXI Commons Sub, LLC';
update properties set owner_entity = 'MIMG CCXXXI South Pointe Sub LLC'
  where code = 'SPND' and owner_entity = 'MIMG CCXXXI South Pointe Sub, LLC';
update properties set owner_entity = 'MIMG CCXXXI Chateau Sub LLC'
  where code = 'TCND' and owner_entity = 'MIMG CCXXXI Chateau Sub, LLC';
-- TPND and WYND were already set to the comma-free form by migration 026.
--
-- DELIBERATELY NOT TOUCHED: the Williston / Watford City entities (BCND, ECND,
-- FHND, PHND) still carry the comma from the seed. No executed contract for those
-- has been checked, and the Kansas City entities on this same template DO use the
-- comma ("MIMG CLXXVIII Arbors of Grandview, LLC"), so the comma is not simply
-- wrong everywhere. Confirm against an executed document before changing them.
