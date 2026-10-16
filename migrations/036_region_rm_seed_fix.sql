-- 035's RM seed matched regions to RMs via properties.manager and missed three
-- regions in production: Williston spells its manager "Brittanee Purdue" (typo
-- for Perdue), and Bismarck / Jamestown have no manager set at all. Seed those
-- RM contacts directly by region name (Bismarck and Jamestown are Gail
-- Renwick's book, per the proposals addressed to her at those properties).
-- Only fills blanks, so anything typed in Settings > Regions sticks.
update regions set rm_phone = '701-500-0294', rm_email = 'brittanee.perdue@monarchinvestment.com'
  where name = 'Williston' and coalesce(rm_phone, '') = '';
update regions set rm_phone = '701-269-0589', rm_email = 'gail.renwick@monarchinvestment.com'
  where name in ('Bismarck', 'Jamestown') and coalesce(rm_phone, '') = '';

-- Fix the manager-name typo so future matching (and the UI) shows the real
-- spelling: Brittanee Perdue.
update properties set manager = 'Brittanee Perdue' where manager = 'Brittanee Purdue';
