import type { JobListParams } from '../types/job.types';

/**
 * Align FE list query with BE visibility contract:
 * - Staff must NOT send org `department_id` as an ACL filter — BE uses actor
 *   `User.department_id` automatically so passed (handoff) jobs appear in list.
 * - Optional `org_department_scope=mine` is an explicit “my org dept” preset only.
 * - No created_by / salesperson_id unless the UI explicitly filtered.
 * - Admin MIS may keep department_id when the user selected it.
 * - Transport handoff-only (`jobs.transport.handoff`): force ops_user_id=me;
 *   never send job_type (BE assignee-only where — no job_type / dept OR).
 *
 * Visibility OR (normal staff): job_type grants OR org dept match OR ops_user_id=me.
 * Same branch_id + no job_type/status/search/dates ⇒ meta.total === job_count.
 */
export function staffAlignedJobListParams(
  params: JobListParams,
  opts?: {
    isStaff?: boolean;
    allowAdminDepartment?: boolean;
    /** Transport handoff-only assignee queue. */
    assigneeOnly?: boolean;
    /** Required when assigneeOnly — Job.ops_user_id filter. */
    assigneeUserId?: string;
  },
): JobListParams {
  const isStaff = Boolean(opts?.isStaff);
  const next: JobListParams = { ...params };

  if (!String(next.created_by ?? '').trim()) delete next.created_by;
  if (!String(next.salesperson_id ?? '').trim()) delete next.salesperson_id;
  if (!String(next.ops_user_id ?? '').trim()) delete next.ops_user_id;

  // Staff: always omit org department_id (server uses actor dept for handoff queue).
  // Admin MIS: only when explicitly selected.
  if (isStaff || !opts?.allowAdminDepartment || !String(next.department_id ?? '').trim()) {
    delete next.department_id;
  }

  const orgScope = String(next.org_department_scope ?? '').trim();
  if (!orgScope) delete next.org_department_scope;

  if (opts?.assigneeOnly) {
    delete next.job_type;
    delete next.job_types;
    delete next.department_id;
    delete next.org_department_scope;
    const uid = String(opts.assigneeUserId ?? '').trim();
    if (uid) next.ops_user_id = uid;
  }

  return next;
}
