import type { AuthUser } from '@/types/auth.types';
import type { Job } from '../types/job.types';
import { isOpsUnrestrictedUser } from './isOpsUnrestrictedUser';

type HandoffJob = Pick<Job, 'actions' | 'view_mode'> | null | undefined;
type HandoffActor = Pick<AuthUser, 'role' | 'unrestrictedOps' | 'permissions'> | null | undefined;

/**
 * Handoff-dept staff see a limited ops surface after Pass-to-Transport / dept pass:
 * containers + assign trucker + port-token + docs (not full costing / show_all).
 *
 * Tenant Admin / Branch Manager / unrestricted ops (sees-all) always get the full
 * job UI — never forced into handoff-limited mode.
 */
export function isHandoffLimitedJob(job: HandoffJob, user?: HandoffActor): boolean {
  if (!job) return false;
  if (user && isOpsUnrestrictedUser(user)) return false;

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
