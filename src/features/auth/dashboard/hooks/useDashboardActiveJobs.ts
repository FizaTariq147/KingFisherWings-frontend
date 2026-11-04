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
 * Active shipments grid — same department jobs admin would see for this staff's
 * Ops visible ∪ writable types (any creator). Do not send created_by.
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
  const rowLimit = options?.rowLimit ?? 40;
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
    // Always pass at least common ops types so search-prefix recovery runs for staff.
    if (!types.size) {
      (
        [
          'AIR_EXPORT',
          'AIR_IMPORT',
          'SEA_FCL_EXPORT',
          'SEA_FCL_IMPORT',
          'SEA_LCL_EXPORT',
          'SEA_LCL_IMPORT',
        ] as JobType[]
      ).forEach((t) => types.add(t));
    }
    return [...types];
  }, [user]);

  const filterParams: Pick<JobListParams, 'job_type' | 'branch_id' | 'job_types'> = {
    ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
    ...(branchId ? { branch_id: branchId } : {}),
    // Staff: pass department types so list merges typed + JWT scope (any creator).
    ...(!jobType && staffJobTypes.length ? { job_types: staffJobTypes } : {}),
  };

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'dept-any-creator',
      jobType,
      branchId,
      staffJobTypes,
      rowLimit,
    ],
    queryFn: async () => {
      const pageLimit = Math.min(100, Math.max(rowLimit, 40));

      // No skip_client_hydrate — staff department lists need typed+unfiltered merge.
      // No created_by — admin-created jobs in granted types must appear.
      const [allPage, ...statusPages] = await Promise.all([
        jobService.list({
          page: 1,
          limit: pageLimit,
          order: 'desc',
          ...filterParams,
        }),
        ...OPEN_JOB_STATUSES.map((status) =>
          jobService.list({
            page: 1,
            limit: pageLimit,
            status,
            order: 'desc',
            ...filterParams,
          }),
        ),
      ]);

      const byId = new Map<string, Job>();
      for (const job of allPage.jobs ?? []) {
        if (job?.id) byId.set(job.id, job);
      }
      let openTotal = 0;
      for (const page of statusPages) {
        openTotal += page.meta?.total ?? 0;
        for (const job of page.jobs ?? []) {
          if (job?.id) byId.set(job.id, job);
        }
      }

      const openSet = new Set<string>(OPEN_JOB_STATUSES);
      const openJobs = [...byId.values()]
        .filter((j) => openSet.has(String(j.status)))
        .sort((a, b) => jobSortTime(b) - jobSortTime(a));

      if (!openTotal) {
        openTotal = openJobs.length;
      }

      return {
        jobs: openJobs.slice(0, rowLimit),
        openTotal,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
