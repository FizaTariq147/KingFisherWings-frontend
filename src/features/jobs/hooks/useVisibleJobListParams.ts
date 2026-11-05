import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { JobType } from '../constants/job.constants';
import type { JobListParams } from '../types/job.types';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';
import { resolveClientVisibleJobTypes } from '../utils/resolveClientVisibleJobTypes';
import { resolveStaffListJobTypes } from '../utils/resolveStaffListJobTypes';

/**
 * Default list/dashboard API scope.
 * Admin (and admin write perms): omit job_type — BE returns every non-deleted job.
 * Staff: also omit job_type / created_by / department_id on the default “all jobs” view;
 * BE resolves visible types from the DB on each request (any creator).
 * Never send job_type unless canSendJobTypeQuery would allow it — typed queries
 * that miss the allow-list return empty rows while untyped counts still show data.
 */
export function useVisibleJobListScope(): {
  kind: 'unrestricted' | 'staff';
  /** Resolved staff allow-list for client filters / UI; undefined for admin. */
  jobTypes?: JobType[];
  /**
   * Spread into GET /jobs — always empty for default all-jobs / dashboard.
   * Department UIs should client-filter, not send job_type.
   */
  listScopeParams: Pick<JobListParams, 'job_types' | 'job_type'>;
} {
  const { user } = useAuth();
  return useMemo(() => {
    if (isOpsUnrestrictedUser(user)) {
      return { kind: 'unrestricted' as const, listScopeParams: {} };
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
    });

    return {
      kind: 'staff' as const,
      jobTypes: client.lockedEmpty ? [] : jobTypes,
      // Never attach job_type(s) to the default request — BE DB resolver scopes staff.
      listScopeParams: {},
    };
  }, [
    user?.unrestrictedOps,
    user?.role,
    user?.permissions,
    user?.visibleJobTypes,
    user?.writableJobTypes,
  ]);
}
