import type { AuthUser } from '@/types/auth.types';
import type { Job } from '../types/job.types';
import { canonicalizeJobType } from './canonicalizeJobType';
import { isOpsUnrestrictedUser } from './isOpsUnrestrictedUser';
import { jobEditable } from './jobRoute';

type AccessActor = Pick<
  AuthUser,
  'id' | 'role' | 'unrestrictedOps' | 'writableJobTypes' | 'visibleJobTypes'
>;

function jobOwnedByUser(job: Job, userId: string | undefined): boolean {
  if (!userId) return false;
  return (
    job.ops_user_id === userId ||
    job.salesperson_id === userId ||
    (job as { created_by?: string }).created_by === userId
  );
}

/**
 * Staff visible set for list / detail / milestones.
 * Admin (tenant admin + branch manager + unrestrictedOps) always true.
 * null/undefined visible = unrestricted (legacy / admin-style).
 * empty visible = locked (sees nothing).
 */
export function jobTypeIsVisible(
  job: Pick<Job, 'job_type'>,
  user: AccessActor | null | undefined,
): boolean {
  if (!user) return false;
  if (isOpsUnrestrictedUser(user)) return true;
  if (user.visibleJobTypes === null || user.visibleJobTypes === undefined) {
    return true;
  }
  if (!user.visibleJobTypes.length) return false;
  const type = canonicalizeJobType(job.job_type);
  return user.visibleJobTypes.some((t) => canonicalizeJobType(t) === type);
}

/**
 * Staff writable set for edit / cancel / delete.
 * Admin always true. null/undefined writable falls back to visible scope.
 */
export function jobTypeIsWritable(
  job: Pick<Job, 'job_type'>,
  user: AccessActor | null | undefined,
): boolean {
  if (!user) return false;
  if (isOpsUnrestrictedUser(user)) return true;
  if (user.writableJobTypes === null || user.writableJobTypes === undefined) {
    return jobTypeIsVisible(job, user);
  }
  if (!user.writableJobTypes.length) return false;
  const type = canonicalizeJobType(job.job_type);
  return user.writableJobTypes.some((t) => canonicalizeJobType(t) === type);
}

/** Detail / milestones: admin always; staff when job type is visible. */
export function canSeeJob(
  job: Pick<Job, 'job_type'>,
  user?: AccessActor | null,
): boolean {
  return jobTypeIsVisible(job, user);
}

/**
 * Edit (and close when gated by edit): trust BE `actions.can_edit` when present;
 * else writable job type + open status.
 */
export function canEditJob(
  job: Job,
  user?: AccessActor | null,
): boolean {
  if (job.actions?.can_edit === false) return false;
  if (job.actions?.can_edit === true) return jobEditable(job.status);
  if (!jobEditable(job.status)) return false;
  return jobTypeIsWritable(job, user);
}

/**
 * Cancel: trust BE `actions.can_cancel` when present; else same as edit.
 */
export function canCancelJob(
  job: Job,
  user?: AccessActor | null,
): boolean {
  if (job.actions?.can_cancel === false) return false;
  if (job.actions?.can_cancel === true) return true;
  return canEditJob(job, user);
}

/**
 * Whether Delete should be offered in the UI.
 * - Trust BE `actions.can_delete` when present.
 * - Otherwise: writable job type, or own job, or terminal status (legacy).
 * Soft-delete API still enforces final ACL.
 */
export function canDeleteJob(
  job: Job,
  user?: AccessActor | null,
): boolean {
  if (job.actions?.can_delete === true) return true;
  if (job.actions?.can_delete === false) return false;

  const terminal = job.status === 'COMPLETED' || job.status === 'CANCELLED';
  if (terminal) return true;

  // Staff who can create this mode (or own the job) can delete without cancel-first.
  if (jobTypeIsWritable(job, user)) return true;
  if (jobOwnedByUser(job, user?.id)) return true;

  return false;
}
