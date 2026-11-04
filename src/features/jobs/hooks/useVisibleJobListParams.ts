import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { JobListParams } from '../types/job.types';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';

/**
 * Default list/dashboard API scope.
 * Admin (and admin write perms): omit job_type — BE returns every non-deleted job.
 * Staff: also omit job_type / created_by / department_id on the default “all jobs” view;
 * BE scopes by JWT visible_job_types / role defaults (any creator).
 * Section screens may still pass job_type=AIR_EXPORT (etc.) as an optional filter.
 */
export function useVisibleJobListScope(): {
  kind: 'unrestricted' | 'staff';
  jobTypes?: JobListParams['job_types'];
  /** Spread into GET /jobs — empty for default all-jobs / dashboard. */
  listScopeParams: Pick<JobListParams, 'job_types'>;
} {
  const { user } = useAuth();
  return useMemo(() => {
    if (isOpsUnrestrictedUser(user)) {
      return { kind: 'unrestricted' as const, listScopeParams: {} };
    }
    return { kind: 'staff' as const, listScopeParams: {} };
  }, [user?.unrestrictedOps, user?.role, user?.permissions]);
}
