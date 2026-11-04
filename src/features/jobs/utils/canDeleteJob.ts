import type { AuthUser } from '@/types/auth.types';
import type { Job } from '../types/job.types';
import { canonicalizeJobType } from './canonicalizeJobType';
import { isOpsUnrestrictedUser } from './isOpsUnrestrictedUser';

type DeleteActor = Pick<
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

function jobTypeIsWritable(job: Job, user: DeleteActor | null | undefined): boolean {
  if (!user) return false;
  if (isOpsUnrestrictedUser(user)) return true;
  // null/undefined writable = unrestricted create (legacy / admin-style).
  if (user.writableJobTypes === null || user.writableJobTypes === undefined) {
    // Fall back to visible scope when writable omitted.
    if (user.visibleJobTypes === null || user.visibleJobTypes === undefined) return true;
    if (!user.visibleJobTypes.length) return false;
    const type = canonicalizeJobType(job.job_type);
    return user.visibleJobTypes.some((t) => canonicalizeJobType(t) === type);
  }
  if (!user.writableJobTypes.length) return false;
  const type = canonicalizeJobType(job.job_type);
  return user.writableJobTypes.some((t) => canonicalizeJobType(t) === type);
}

/**
 * Whether Delete should be offered in the UI.
 * - Trust BE `actions.can_delete` when present.
 * - Otherwise: writable job type, or own job, or terminal status (legacy).
 * Soft-delete API still enforces final ACL.
 */
export function canDeleteJob(
  job: Job,
  user?: DeleteActor | null,
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
