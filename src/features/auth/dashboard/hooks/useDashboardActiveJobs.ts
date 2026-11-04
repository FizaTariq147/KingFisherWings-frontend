import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import { OPEN_JOB_STATUSES } from '../utils/dashboardFormat';
import type { DashboardJobCountScope } from './useDashboardJobCounts';

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Active (non-closed) jobs for dashboard KPI + Active shipments grid.
 * Same scope as sections: admin = all types; staff = visible_job_types.
 * Total = sum of list meta.totals per open status (exact), not a single page length.
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  scope?: DashboardJobCountScope;
  /** Max rows to keep for the grid after merge (newest first). */
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const scope = options?.scope ?? { kind: 'unrestricted' as const };
  const rowLimit = options?.rowLimit ?? 40;
  const scopeParams: Pick<JobListParams, 'job_types'> =
    scope.kind === 'locked'
      ? { job_types: [] }
      : scope.kind === 'scoped'
        ? { job_types: scope.jobTypes as JobType[] | undefined }
        : {};

  return useQuery({
    queryKey: ['tenant', 'dashboard', 'active-jobs', scope, rowLimit],
    queryFn: async () => {
      if (scope.kind === 'locked') {
        return { jobs: [] as Job[], total: 0 };
      }
      if (Array.isArray(scopeParams.job_types) && scopeParams.job_types.length === 0) {
        return { jobs: [] as Job[], total: 0 };
      }

      const pages = await Promise.all(
        OPEN_JOB_STATUSES.map((status) =>
          jobService.list({
            page: 1,
            limit: Math.min(20, rowLimit),
            status,
            order: 'desc',
            skip_client_hydrate: true,
            ...scopeParams,
          }),
        ),
      );

      const byId = new Map<string, Job>();
      let total = 0;
      for (const page of pages) {
        total += page.meta?.total ?? 0;
        for (const job of page.jobs) {
          if (job?.id) byId.set(job.id, job);
        }
      }

      const jobs = [...byId.values()].sort((a, b) => jobSortTime(b) - jobSortTime(a));

      return {
        jobs: jobs.slice(0, rowLimit),
        total,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
