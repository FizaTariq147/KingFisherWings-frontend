import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import { canonicalizeJobType } from '@/features/jobs/utils/canonicalizeJobType';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import { OPEN_JOB_STATUSES } from '../utils/dashboardFormat';

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Active shipments grid rows.
 * - Staff: all open jobs for Ops visible ∪ writable types (any creator — admin or staff).
 * - Admin: all open jobs (no job_types filter).
 * - openTotal always equals the number of unique open jobs returned (badge = rows).
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  /** Max rows to keep for the grid after merge (newest first). */
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuth();
  const rowLimit = options?.rowLimit ?? 100;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  const staffJobTypes = useMemo((): JobType[] => {
    if (isOpsUnrestrictedUser(user)) return [];
    const types = new Set<JobType>();
    for (const raw of [
      ...(Array.isArray(user?.visibleJobTypes) ? user.visibleJobTypes : []),
      ...(Array.isArray(user?.writableJobTypes) ? user.writableJobTypes : []),
    ]) {
      types.add(canonicalizeJobType(raw));
    }
    if (!types.size) {
      (
        [
          'AIR_EXPORT',
          'AIR_IMPORT',
          'SEA_FCL_EXPORT',
          'SEA_FCL_IMPORT',
          'SEA_LCL_EXPORT',
          'SEA_LCL_IMPORT',
          'ROAD_FREIGHT',
          'CUSTOMS_CLEARANCE',
        ] as JobType[]
      ).forEach((t) => types.add(t));
    }
    return [...types];
  }, [user]);

  const filterParams: Pick<JobListParams, 'job_type' | 'branch_id' | 'job_types'> = {
    ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
    ...(branchId ? { branch_id: branchId } : {}),
    ...(!jobType && staffJobTypes.length ? { job_types: staffJobTypes } : {}),
  };

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'all-dept-any-creator',
      jobType,
      branchId,
      staffJobTypes,
      rowLimit,
    ],
    queryFn: async () => {
      const pageLimit = Math.min(100, Math.max(rowLimit, 100));

      // One department-scoped list (search-prefix recovery inside job.service for staff).
      // Do NOT sum per-status meta.totals — that inflated "All jobs" vs visible rows.
      const page = await jobService.list({
        page: 1,
        limit: pageLimit,
        order: 'desc',
        ...filterParams,
      });

      const openSet = new Set<string>(OPEN_JOB_STATUSES);
      const byId = new Map<string, Job>();
      for (const job of page.jobs ?? []) {
        if (!job?.id) continue;
        if (!openSet.has(String(job.status))) continue;
        byId.set(job.id, job);
      }

      const openJobs = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );

      return {
        jobs: openJobs.slice(0, rowLimit),
        /** Exact unique open rows — matches All jobs badge to the grid. */
        openTotal: openJobs.length,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
