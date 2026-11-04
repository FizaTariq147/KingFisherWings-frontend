import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import { OPEN_JOB_STATUSES } from '../utils/dashboardFormat';

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Open-bucket rows for the Active shipments grid.
 * Trust BE JWT scoping — do not send created_by, department_id, or FE job_types.
 * Optional section `job_type` / `branch_id` only when the screen is filtered the same way.
 * Do not use `total` here for the “total jobs” KPI — bind that to dashboard job_count.
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  /** Max rows to keep for the grid after merge (newest first). */
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const rowLimit = options?.rowLimit ?? 40;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  const filterParams: Pick<JobListParams, 'job_type' | 'branch_id'> = {
    ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
    ...(branchId ? { branch_id: branchId } : {}),
  };

  return useQuery({
    queryKey: ['tenant', 'dashboard', 'active-jobs', jobType, branchId, rowLimit],
    queryFn: async () => {
      const pages = await Promise.all(
        OPEN_JOB_STATUSES.map((status) =>
          jobService.list({
            page: 1,
            limit: Math.min(20, rowLimit),
            status,
            order: 'desc',
            skip_client_hydrate: true,
            ...filterParams,
          }),
        ),
      );

      const byId = new Map<string, Job>();
      let openTotal = 0;
      for (const page of pages) {
        openTotal += page.meta?.total ?? 0;
        for (const job of page.jobs) {
          if (job?.id) byId.set(job.id, job);
        }
      }

      const jobs = [...byId.values()].sort((a, b) => jobSortTime(b) - jobSortTime(a));

      return {
        jobs: jobs.slice(0, rowLimit),
        /** Open-status bucket only — not job_count. */
        openTotal,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
