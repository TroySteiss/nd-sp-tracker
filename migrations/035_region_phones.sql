-- Multi-entity contract notices (2026-10-16): each region carries its area
-- manager's and regional manager's phone numbers and emails (Settings > Regions).
-- The multi-entity builder defaults every property's notice phone to
-- "AM <phone> / RM <phone>" and its notice email to
-- "AM <email> / RM <email> / <generating user's email>" for the property's region.
alter table regions add column if not exists am_phone text;
alter table regions add column if not exists rm_phone text;
alter table regions add column if not exists am_email text;
alter table regions add column if not exists rm_email text;

-- Each user's own email (Settings > Users & roles): appended to the notice-email
-- default. A setting, never derived — real addresses vary between First.Last@
-- and first-initial+lastname@, so guessing prints a dead address on a contract.
alter table app_users add column if not exists email text;

-- One-time seed (2026-10-16, provided by Troy; business contacts). Only fills
-- blanks, so anything later typed in Settings sticks.
update app_users u set email = v.email
from (values
  ('rileycombs',      'rcombs@MonarchInvestment.com'),
  ('troysteiss',      'Tsteiss@Monarchinvestment.com'),
  ('hollyhaman',      'hhaman@monarchinvestment.com'),
  ('brittaneeperdue', 'brittanee.perdue@monarchinvestment.com'),
  ('gailrenwick',     'gail.renwick@monarchinvestment.com')
) v(key, email)
where u.key = v.key and coalesce(u.email, '') = '';

-- Seed each region's RM contact from whoever manages most of its properties,
-- when that manager is one of the named regional managers. AM contacts are left
-- for Settings > Regions (could be either asset manager - not guessed here).
with mgr as (
  select p.region, lower(regexp_replace(coalesce(p.manager, ''), '[^a-zA-Z]', '', 'g')) as key, count(*) as n
  from properties p
  where coalesce(p.manager, '') <> ''
  group by 1, 2
), top as (
  select distinct on (region) region, key from mgr order by region, n desc
)
update regions r set rm_phone = v.phone, rm_email = v.email
from top t
join (values
  ('hollyhaman',      '701-720-2630', 'hhaman@monarchinvestment.com'),
  ('brittaneeperdue', '701-500-0294', 'brittanee.perdue@monarchinvestment.com'),
  ('gailrenwick',     '701-269-0589', 'gail.renwick@monarchinvestment.com')
) v(key, phone, email) on v.key = t.key
where r.name = t.region and coalesce(r.rm_phone, '') = '';
