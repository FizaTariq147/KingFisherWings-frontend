import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useVisibleJobListScope } from '@/features/jobs/hooks/useVisibleJobListParams';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job } from '@/features/jobs/types/job.types';
import { canonicalizeJobType } from '@/features/jobs/utils/canonicalizeJobType';
import { effectiveJobListType } from '@/features/jobs/utils/effectiveJobListType';
import { resolveListProbesFromCounts } from '@/features/jobs/utils/resolveListProbesFromCounts';
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
 * Active shipments grid — every non-completed/cancelled job in staff grants
 * (any creator). Loads with the same visibility as job_count, then drops closed.
 * Compare row count to open/non-closed, not always to job_count (which includes closed).
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { scopeTypes, probeTypes, kind } = useVisibleJobListScope();
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'staff-visible-v17',
      jobType,
      branchId,
      rowLimit,
      kind,
      scopeTypes === null ? 'admin' : scopeTypes.slice().sort().join(','),
      probeTypes.slice().sort().join(','),
    ],
    queryFn: async () => {
      let expectedTotal = 0;
      let countVisible: string[] | null | undefined;
      try {
        const counts = await jobService.dashboardCounts(
          branchId ? { branch_id: branchId } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
        countVisible = counts.visibleJobTypes;
      } catch {
        expectedTotal = 0;
      }

      const byId = new Map<string, Job>();
      const take = (jobs: Job[] | undefined) => {
        for (const job of jobs ?? []) {
          if (!job?.id) continue;
          const status = normalizeStatus(job.status);
          if (CLOSED.has(status)) continue;
          const resolvedType = effectiveJobListType(job);
          if (jobType && resolvedType !== canonicalizeJobType(jobType)) continue;
          byId.set(
            job.id,
            job.job_type === resolvedType && status === job.status
              ? job
              : { ...job, job_type: resolvedType, status: status as Job['status'] },
          );
        }
      };

      const { scopeTypes: listScope, probeTypes: listProbes } =
        resolveListProbesFromCounts({
          staffScopeTypes: scopeTypes,
          staffProbeTypes: probeTypes,
          countVisible,
        });

      const listOpts = {
        scopeTypes: listScope,
        scopeConfident: false,
        probeTypes: listProbes,
        expectedTotal,
      };

      const collected = await jobService.listVisibleJobs(
        {
          page: 1,
          limit: 100,
          order: 'desc',
          ...(branchId ? { branch_id: branchId } : {}),
          department_id: undefined,
        },
        listOpts,
      );
      take(collected.jobs);

      const reported = Math.max(collected.meta?.total ?? 0, expectedTotal, byId.size);
      const maxPages = Math.min(10, Math.ceil(Math.max(reported, 1) / 100));
      for (let page = 2; page <= maxPages; page += 1) {
        const more = await jobService.listVisibleJobs(
          {
            page,
            limit: 100,
            order: 'desc',
            ...(branchId ? { branch_id: branchId } : {}),
            department_id: undefined,
          },
          listOpts,
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
        expectedTotal,
        visibleJobTypes: collected.meta?.visible_job_types ?? countVisible,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
