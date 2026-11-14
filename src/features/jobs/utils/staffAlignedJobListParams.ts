import type { JobListParams } from '../types/job.types';

/**
 * Align FE list query with BE visibility contract (post resolveVisibleJobTypes):
 * - Staff ACL = job types, never org department_id (most jobs have department_id null)
 * - No created_by / salesperson_id unless the UI explicitly filtered
 * - Admin MIS may keep department_id when the user selected it
 *
 * Same branch_id + no job_type/status/search/dates ⇒ meta.total === job_count.
 */
export function staffAlignedJobListParams(
  params: JobListParams,
  opts?: { isStaff?: boolean; allowAdminDepartment?: boolean },
): JobListParams {
  const isStaff = Boolean(opts?.isStaff);
  const next: JobListParams = { ...params };

  if (!String(next.created_by ?? '').trim()) delete next.created_by;
  if (!String(next.salesperson_id ?? '').trim()) delete next.salesperson_id;
  if (!String(next.ops_user_id ?? '').trim()) delete next.ops_user_id;

  // Staff: always omit org department_id. Admin MIS: only when explicitly selected.
  if (isStaff || !opts?.allowAdminDepartment || !String(next.department_id ?? '').trim()) {
    delete next.department_id;
  }

  return next;
}
