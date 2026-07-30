-- Correct/complete the Minot owner entities — 2026-07-28
--
-- Taken from the executed Legend Lawn contract (09.2025–08.2026), which names all
-- five Minot entities and their notice addresses. Without these, a contract
-- naming the Minot properties cannot be generated: South Pointe carried a
-- corrupted "O LLC", and Plaza and Wyatt had no entity at all.
--
-- Only fills gaps and fixes the known-bad value; never overwrites an entity that
-- is already populated, so a hand-corrected row on any deployment survives.
update properties set owner_entity = 'MIMG CCXXXI South Pointe Sub LLC'
  where code = 'SPND' and coalesce(nullif(owner_entity, ''), 'O LLC') = 'O LLC';

update properties set owner_entity = 'MIMG CCXXXI Plaza Sub LLC'
  where code = 'TPND' and coalesce(owner_entity, '') = '';
update properties set address = '3015 16th Street SW, Minot, ND 58701'
  where code = 'TPND' and coalesce(address, '') = '';

update properties set owner_entity = 'MIMG CCXLVIII The Wyatt Master LLC'
  where code = 'WYND' and coalesce(owner_entity, '') = '';
