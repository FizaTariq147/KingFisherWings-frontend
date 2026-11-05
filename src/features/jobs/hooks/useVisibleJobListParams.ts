import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { JobType } from '../constants/job.constants';
import type { JobListParams } from '../types/job.types';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';
import { resolveClientVisibleJobTypes } from '../utils/resolveClientVisibleJobTypes';
import { resolveStaffListJobTypes } from '../utils/resolveStaffListJobTypes';

export type VisibleJobListScope = {
  kind: 'unrestricted' | 'staff';
  /**
   * For `jobService.listVisibleJobs`:
   * - `null` → admin / unrestricted (plain GET /jobs, no typed fan-out)
   * - `[]` → locked empty allow-list
   * - `JobType[]` → staff granted departments only (never the full role pack)
   */
  scopeTypes: JobType[] | null;
  /** Resolved staff allow-list for client filters / UI; undefined for admin. */
  jobTypes?: JobType[];
  /**
   * Spread into GET /jobs — always empty for default all-jobs / dashboard.
   * Department UIs should client-filter, not send job_type.
   */
  listScopeParams: Pick<JobListParams, 'job_types' | 'job_type'>;
};

/**
 * Default list/dashboard API scope.
 * Admin (and admin write perms): omit job_type — BE returns every non-deleted job.
 * Staff: also omit job_type / created_by / department_id on the default “all jobs” view;
 * resolve from /me + direct operations_{type}.* (operations_scope skips role-pack inflate).
 * Never send job_type unless canSendJobTypeQuery would allow it — typed queries
 * that miss the allow-list return empty rows while untyped counts still show data.
 */
export function useVisibleJobListScope(
  opts?: {
    /** Limit resolve to a department segment (Sea Export, Air Import, …). */
    candidates?: readonly JobType[];
  },
): VisibleJobListScope {
  const { user } = useAuth();
  const candidates = opts?.candidates;

  return useMemo(() => {
    if (isOpsUnrestrictedUser(user)) {
      return {
        kind: 'unrestricted' as const,
        scopeTypes: null,
        listScopeParams: {},
      };
    }

    const client = resolveClientVisibleJobTypes({
      isUnrestricted: false,
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
    });

    const jobTypes = resolveStaffListJobTypes({
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
      ...(candidates?.length ? { candidates } : {}),
    });

    const scoped = client.lockedEmpty ? [] : jobTypes;

    return {
      kind: 'staff' as const,
      jobTypes: scoped,
      scopeTypes: scoped,
      // Never attach job_type(s) to the default request — BE DB resolver scopes staff.
      listScopeParams: {},
    };
  }, [
    user?.unrestrictedOps,
    user?.role,
    user?.permissions,
    user?.visibleJobTypes,
    user?.writableJobTypes,
    candidates,
  ]);
}
