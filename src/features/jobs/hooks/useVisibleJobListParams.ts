import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { JobListParams } from '../types/job.types';
import { effectiveListJobTypes } from '../utils/deptAccessFromStaffGrants';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';
import { normalizeVisibleJobTypeScope } from '../utils/visibleJobTypeScope';

/**
 * List/dashboard query params scoped by visible_job_types ∪ writable_job_types.
 * Admin / branch manager / unrestricted_ops → no job_types filter.
 * Create UIs should use writable_job_types only (useCreateWritableJobTypes).
 */
export function useVisibleJobListScope(): {
  kind: 'unrestricted' | 'locked' | 'scoped';
  jobTypes?: JobListParams['job_types'];
  /** Spread into GET /jobs params (omitted when unrestricted). */
  listScopeParams: Pick<JobListParams, 'job_types'>;
} {
  const { user } = useAuth();
  return useMemo(() => {
    if (isOpsUnrestrictedUser(user)) {
      return { kind: 'unrestricted' as const, listScopeParams: {} };
    }
    const effective = effectiveListJobTypes(
      user?.visibleJobTypes,
      user?.writableJobTypes,
      user?.permissions ?? [],
    );
    const scope = normalizeVisibleJobTypeScope(effective);
    if (scope.kind === 'locked') {
      return { kind: 'locked', jobTypes: [], listScopeParams: { job_types: [] } };
    }
    if (scope.kind === 'scoped') {
      return {
        kind: 'scoped',
        jobTypes: scope.types,
        listScopeParams: { job_types: scope.types },
      };
    }
    return { kind: 'unrestricted', listScopeParams: {} };
  }, [
    user?.unrestrictedOps,
    user?.role,
    user?.visibleJobTypes,
    user?.writableJobTypes,
    user?.permissions,
  ]);
}
