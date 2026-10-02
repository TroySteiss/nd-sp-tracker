-- Lien waiver retired from the lifecycle (035): "Lien Waiver Received" is no
-- longer a step, so it must not count toward stage/progress or linger in the
-- steps jsonb. The lien-waiver DOCUMENT slot (lien_waiver_file_key/_name) is
-- unchanged — it stays a contract attachment, just not a pipeline step.
update projects
   set steps = steps - 'lienWaiver',
       updated_at = now()
 where steps ? 'lienWaiver';
