import type { AuthUser } from '@/types/auth.types';
import type { Job } from '../types/job.types';
import { isOpsUnrestrictedUser } from './isOpsUnrestrictedUser';
import { isTransportHandoffOnly } from './isTransportHandoffOnly';

type HandoffJob = Pick<Job, 'actions' | 'view_mode' | 'ops_user_id'> | null | undefined;
type HandoffActor = Pick<
  AuthUser,
  'id' | 'role' | 'unrestrictedOps' | 'permissions' | 'visibleJobTypes' | 'writableJobTypes'
> | null | undefined;

/**
 * Handoff-dept / transport-handoff staff see a limited ops surface:
 * containers + assign trucker + port-token + docs (+ change-status for transport handoff).
 *
 * Tenant Admin / Branch Manager / unrestricted ops (sees-all) always get the full
 * job UI — never forced into handoff-limited mode.
 *
 * Transport handoff-only assignees (jobs.transport.handoff, ops_user_id = me)
 * are always handoff_limited on jobs they can open.
 */
export function isHandoffLimitedJob(job: HandoffJob, user?: HandoffActor): boolean {
  if (!job) return false;
  if (user && isOpsUnrestrictedUser(user)) return false;

  if (user && isTransportHandoffOnly(user)) {
    const uid = String(user.id ?? '').trim();
    const assignee = String(job.ops_user_id ?? '').trim();
    // BE only lets them open assignee jobs; force limited surface when assigned to self
    // or when BE already marked the envelope handoff_limited.
    if (!uid || !assignee || assignee === uid) return true;
  }

  const mode = String(job.actions?.view_mode ?? job.view_mode ?? '')
    .trim()
    .toLowerCase();
  if (mode === 'full') return false;
  if (mode === 'handoff_limited' || mode === 'handoff-limited') return true;

  // Infer when BE sets limited action flags but omits view_mode.
  const actions = job.actions;
  if (!actions) return false;
  if (actions.can_view_costing === false) {
    const handoffSurface =
      actions.can_view_containers === true ||
      actions.can_assign_trucker === true ||
      actions.can_port_token === true ||
      actions.can_upload_docs === true;
    if (handoffSurface) return true;
  }
  return false;
}

/** CLOSED hard lock — mutations blocked except closed-overrides + reopen-request path. */
export function isJobHardClosed(job: Pick<Job, 'status'> | null | undefined): boolean {
  return String(job?.status ?? '').toUpperCase() === 'CLOSED';
}
