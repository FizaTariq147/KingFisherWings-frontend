import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { JOB_TYPES, type JobType } from '@/features/jobs/constants/job.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job } from '@/features/jobs/types/job.types';
import { effectiveJobListType } from '@/features/jobs/utils/effectiveJobListType';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import {
  CLOSED_JOB_STATUSES,
  isOpenBucketJob,
} from '../utils/dashboardFormat';

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function normalizeStatus(status: unknown): string {
  return String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

const CLOSED = new Set(CLOSED_JOB_STATUSES.map(String));

/**
 * Active shipments grid — show every non-closed job BE allows this user to see.
 * BE owns JWT / operations_scope visibility. FE only:
 * - loads the full staff-visible set (plain + type probes + search recovery)
 * - drops completed/cancelled
 * - never filters by creator
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuth();
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  // null = admin (plain list). Staff: probe every job type; BE rejects ones outside grants.
  const scopeTypes = useMemo((): JobType[] | null => {
    if (isOpsUnrestrictedUser(user)) return null;
    return [...JOB_TYPES];
  }, [user]);

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'staff-all-v10',
      jobType,
      branchId,
      rowLimit,
      scopeTypes === null ? 'admin' : 'staff',
    ],
    queryFn: async () => {
      // Pull the same total the KPI uses so we know when the grid is incomplete.
      let expectedTotal = 0;
      try {
        const counts = await jobService.dashboardCounts(
          branchId ? { branch_id: branchId } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
      } catch {
        expectedTotal = 0;
      }

      const collected = await jobService.listVisibleJobs(
        {
          page: 1,
          limit: 100,
          order: 'desc',
          ...(branchId ? { branch_id: branchId } : {}),
        },
        { scopeTypes },
      );

      const byId = new Map<string, Job>();
      const take = (jobs: Job[] | undefined) => {
        for (const job of jobs ?? []) {
          if (!job?.id) continue;
          const status = normalizeStatus(job.status);
          if (CLOSED.has(status)) continue;
          const resolvedType = effectiveJobListType(job);
          if (jobType && resolvedType !== jobType) continue;
          byId.set(
            job.id,
            job.job_type === resolvedType && status === job.status
              ? job
              : { ...job, job_type: resolvedType, status: status as Job['status'] },
          );
        }
      };

      take(collected.jobs);

      // listVisibleJobs pages internally then slices — pull remaining pages if needed.
      const reported = collected.meta?.total ?? byId.size;
      const pageSize = 100;
      const maxPages = Math.min(10, Math.ceil(Math.max(reported, expectedTotal, 1) / pageSize));
      for (let page = 2; page <= maxPages; page += 1) {
        const more = await jobService.listVisibleJobs(
          {
            page,
            limit: pageSize,
            order: 'desc',
            ...(branchId ? { branch_id: branchId } : {}),
          },
          { scopeTypes },
        );
        take(more.jobs);
        if ((more.jobs?.length ?? 0) === 0) break;
        if (byId.size >= rowLimit) break;
      }

      const rows = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );
      const openBucket = rows.filter((j) => isOpenBucketJob(j.status));

      return {
        jobs: rows.slice(0, rowLimit),
        openTotal: openBucket.length,
        /** KPI total from dashboard-counts (may include closed). */
        expectedTotal,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
