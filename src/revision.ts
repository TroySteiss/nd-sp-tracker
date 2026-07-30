/* Contract revision requests — shared by the full view and the PM view so both
 * roll a project back identically.
 *
 * A bad contract goes back PAST approval: the office re-picks and re-approves a
 * bid, then regenerates. So this clears every step from `approved` onward (plus
 * the attachment-derived lienWaiver), un-approves all bids, and clears the live
 * contract columns. `planned` and `gotBids` survive — the bids themselves are
 * still on file and still valid as documents.
 *
 * Nothing is deleted. The cleared documents move to projects.superseded_contracts
 * so the record of what was wrong, and who called it, survives.
 */
import type pg from 'pg';
import { STEP_KEYS, APPROVED_IDX } from '../shared/domain.js';

export interface RevisionResult {
  archived: { slot: string; fileKey: string; fileName: string }[];
  clearedSteps: string[];
}

/** Steps a revision clears: approval onward, plus the derived lien-waiver tick. */
export const REVISION_CLEARS = [...STEP_KEYS.slice(APPROVED_IDX), 'lienWaiver']
  .filter((k, i, a) => a.indexOf(k) === i);

const DOC_COLUMNS: { slot: string; keyCol: string; nameCol: string }[] = [
  { slot: 'generated',        keyCol: 'contract_file_key',           nameCol: 'contract_file_name' },
  { slot: 'contractorSigned', keyCol: 'contractor_signed_file_key',  nameCol: 'contractor_signed_file_name' },
  { slot: 'countersigned',    keyCol: 'executed_contract_file_key',  nameCol: 'executed_contract_file_name' },
  { slot: 'lienWaiver',       keyCol: 'lien_waiver_file_key',        nameCol: 'lien_waiver_file_name' },
];

/**
 * Roll `row` (a full projects row) back to pre-approval inside transaction `cx`.
 * Returns what was archived and which steps were cleared, for the audit line.
 */
export async function requestContractRevision(
  cx: pg.PoolClient | pg.Client,
  row: any,
  by: string,
  reason: string,
): Promise<RevisionResult> {
  const archived = DOC_COLUMNS
    .filter((d) => row[d.keyCol])
    .map((d) => ({ slot: d.slot, fileKey: row[d.keyCol], fileName: row[d.nameCol] || '' }));

  const steps: Record<string, boolean> = { ...(row.steps || {}) };
  const clearedSteps = REVISION_CLEARS.filter((k) => steps[k]);
  REVISION_CLEARS.forEach((k) => { steps[k] = false; });

  const entry = { at: new Date().toISOString(), by, reason, files: archived };
  const clears = DOC_COLUMNS.map((d) => `${d.keyCol}=null, ${d.nameCol}=null`).join(', ');

  await cx.query(
    `update projects set ${clears}, steps=$2::jsonb,
            superseded_contracts = coalesce(superseded_contracts,'[]'::jsonb) || $3::jsonb,
            revision_requested_at = now(), revision_requested_by = $4, revision_reason = $5,
            pm_review_requested_at = null, pm_review_requested_by = null,
            updated_at = now()
      where id = $1`,
    [row.id, JSON.stringify(steps), JSON.stringify([entry]), by, reason]
  );

  // Approval is revoked with the contract — the office picks a winner again.
  await cx.query('update bids set approved=false where project_id=$1', [row.id]);

  return { archived, clearedSteps };
}

/** Clear the flag once the office has acted (re-approved / regenerated). */
export async function clearRevisionFlag(cx: pg.PoolClient | pg.Client, id: string): Promise<void> {
  await cx.query(
    'update projects set revision_requested_at=null, revision_requested_by=null, revision_reason=null, updated_at=now() where id=$1',
    [id]
  );
}
