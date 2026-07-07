-- Lien waivers signed within the executed contract: the LW step is now derived
-- purely from the lien-waiver attachment, so projects that answered "Yes —
-- signed with contract" (step true, no separate file) point their LW slot at
-- the executed contract document.

update projects
   set lien_waiver_file_key  = executed_contract_file_key,
       lien_waiver_file_name = executed_contract_file_name
 where lien_waiver_file_key is null
   and executed_contract_file_key is not null
   and (steps->>'lienWaiver') = 'true';
