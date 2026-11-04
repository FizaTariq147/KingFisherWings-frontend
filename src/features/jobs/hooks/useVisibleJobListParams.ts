import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  JOB_TYPES,
  JOB_TYPE_WIZARD_OPTIONS,
  type JobType,
} from '../constants/job.constants';
import type { JobListParams } from '../types/job.types';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import { filterJobTypesByStaffAccess } from '../utils/filterJobTypesByStaffAccess';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';

/**
 * List/dashboard query params scoped by permissions + visible ∪ writable job types.
 * Admin / branch manager / unrestricted_ops → no job_types filter (all creators, all types).
 * Staff → never unrestricted: only job types allowed by matrix/menu (+ /me allow-lists).
 * Creator is irrelevant: admin-created jobs in a staff-allowed department appear for both.
 * Create UIs should use writable_job_types only (useCreateWritableJobTypes).
 */
export function useVisibleJobListScope(): {
  kind: 'unrestricted' | 'locked' | 'scoped';
  jobTypes?: JobListParams['job_types'];
  /** Spread into GET /jobs params (omitted when unrestricted). */
  listScopeParams: Pick<JobListParams, 'job_types'>;
} {
  const { user, hasEnabledModule } = useAuth();
  return useMemo(() => {
    if (isOpsUnrestrictedUser(user)) {
      return { kind: 'unrestricted' as const, listScopeParams: {} };
    }

    const allowed = filterJobTypesByStaffAccess({
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
      unrestrictedOps: false,
      isTenantAdmin: false,
      isModuleEnabled: hasEnabledModule,
      candidates: JOB_TYPE_WIZARD_OPTIONS,
      mode: 'list',
    });

    // Write implies see: include writable types even when list filter omitted them.
    const types = new Set<JobType>(allowed);
    if (user?.writableJobTypes?.length) {
      for (const raw of user.writableJobTypes) {
        const t = canonicalizeJobType(raw);
        if ((JOB_TYPES as readonly string[]).includes(t)) types.add(t);
      }
    }

    const jobTypes = [...types];
    if (!jobTypes.length) {
      return { kind: 'locked', jobTypes: [], listScopeParams: { job_types: [] } };
    }
    return {
      kind: 'scoped',
      jobTypes,
      listScopeParams: { job_types: jobTypes },
    };
  }, [
    user?.unrestrictedOps,
    user?.role,
    user?.visibleJobTypes,
    user?.writableJobTypes,
    user?.permissions,
    hasEnabledModule,
  ]);
}
