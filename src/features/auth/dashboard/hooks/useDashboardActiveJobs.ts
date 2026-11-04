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
 * Active shipments grid rows for the current user.
 *
 * - No created_by / salesperson_id / department_id / user id — any creator
 *   (admin or staff) with an allowed job_type appears.
 * - BE JWT scopes job types; FE only optionally passes section job_type / branch_id.
 * - Prefer an unfiltered list (same ACL as job_count) then keep open-bucket rows;
 *   also merge per-status pages so newer open jobs are not lost behind completed ones.
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
    queryKey: ['tenant', 'dashboard', 'active-jobs', 'any-creator', jobType, branchId, rowLimit],
    queryFn: async () => {
      const pageLimit = Math.min(100, Math.max(rowLimit, 40));

      const [allPage, ...statusPages] = await Promise.all([
        jobService.list({
          page: 1,
          limit: pageLimit,
          order: 'desc',
          skip_client_hydrate: true,
          ...filterParams,
        }),
        ...OPEN_JOB_STATUSES.map((status) =>
          jobService.list({
            page: 1,
            limit: pageLimit,
            status,
            order: 'desc',
            skip_client_hydrate: true,
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

      // If status meta was empty (soft ACL), fall back to client open filter of merged list.
      if (!openTotal) {
        openTotal = openJobs.length;
      }

      return {
        jobs: openJobs.slice(0, rowLimit),
        /** Open-status bucket estimate — not job_count. */
        openTotal,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
