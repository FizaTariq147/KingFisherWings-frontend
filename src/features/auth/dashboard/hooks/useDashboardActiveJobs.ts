import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useVisibleJobListScope } from '@/features/jobs/hooks/useVisibleJobListParams';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job } from '@/features/jobs/types/job.types';
import { effectiveJobListType } from '@/features/jobs/utils/effectiveJobListType';
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
 * Active shipments grid — every non-closed job in staff department grants
 * (any creator). When dashboard-counts.job_count > merged rows, deepen
 * mid-code search recovery for sidebar-aligned probeTypes only.
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
      'staff-dept-v14',
      jobType,
      branchId,
      rowLimit,
      kind,
      scopeTypes === null ? 'admin' : scopeTypes.slice().sort().join(','),
      probeTypes.slice().sort().join(','),
    ],
    queryFn: async () => {
      let expectedTotal = 0;
      try {
        const counts = await jobService.dashboardCounts(
          branchId ? { branch_id: branchId } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
      } catch {
        expectedTotal = 0;
      }

      const staffProbes = scopeTypes === null ? [] : probeTypes;
      // Trust BE plain list (same rule as job_count); do not FE-filter types away.
      const listOpts = {
        scopeTypes,
        scopeConfident: false,
        probeTypes: staffProbes,
        expectedTotal,
      };

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

      const collected = await jobService.listVisibleJobs(
        {
          page: 1,
          limit: 100,
          order: 'desc',
          ...(branchId ? { branch_id: branchId } : {}),
        },
        listOpts,
      );
      take(collected.jobs);

      const reported = Math.max(collected.meta?.total ?? 0, expectedTotal, byId.size);
      const pageSize = 100;
      const maxPages = Math.min(10, Math.ceil(Math.max(reported, 1) / pageSize));
      for (let page = 2; page <= maxPages; page += 1) {
        const more = await jobService.listVisibleJobs(
          {
            page,
            limit: pageSize,
            order: 'desc',
            ...(branchId ? { branch_id: branchId } : {}),
          },
          listOpts,
        );
        take(more.jobs);
        if ((more.jobs?.length ?? 0) === 0) break;
        if (byId.size >= rowLimit) break;
      }

      // Count OK / grid short: force recovery with uncertain scope + probes.
      // job_count includes closed; compare against raw meta when open filter shrinks.
      const openShort = expectedTotal > byId.size && byId.size < rowLimit;
      if (openShort && staffProbes.length > 0) {
        const catchUp = await jobService.listVisibleJobs(
          {
            page: 1,
            limit: Math.min(rowLimit, 100),
            order: 'desc',
            ...(branchId ? { branch_id: branchId } : {}),
          },
          {
            scopeTypes: staffProbes,
            scopeConfident: false,
            probeTypes: staffProbes,
            expectedTotal,
          },
        );
        take(catchUp.jobs);

        // Second page of catch-up when still short of count.
        if (expectedTotal > byId.size && (catchUp.meta?.total ?? 0) > catchUp.jobs.length) {
          const moreCatch = await jobService.listVisibleJobs(
            {
              page: 2,
              limit: Math.min(rowLimit, 100),
              order: 'desc',
              ...(branchId ? { branch_id: branchId } : {}),
            },
            {
              scopeTypes: staffProbes,
              scopeConfident: false,
              probeTypes: staffProbes,
              expectedTotal,
            },
          );
          take(moreCatch.jobs);
        }
      }

      const rows = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );
      const openBucket = rows.filter((j) => isOpenBucketJob(j.status));

      return {
        jobs: rows.slice(0, rowLimit),
        openTotal: openBucket.length,
        expectedTotal,
        visibleJobTypes: collected.meta?.visible_job_types,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
