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
 * (any creator). Uses sidebar-aligned probes when /me tokens are empty; never
 * hard-empties on uncertain FE scope. Prefer BE meta.visible_job_types when present.
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { scopeTypes, scopeConfident, probeTypes, kind } = useVisibleJobListScope();
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'staff-dept-v12',
      jobType,
      branchId,
      rowLimit,
      kind,
      scopeConfident ? 'confident' : 'uncertain',
      scopeTypes === null ? 'admin' : scopeTypes.slice().sort().join(','),
      probeTypes.slice().sort().join(','),
    ],
    queryFn: async () => {
      // KPI total — same ACL path as the grid should cover.
      let expectedTotal = 0;
      try {
        const counts = await jobService.dashboardCounts(
          branchId ? { branch_id: branchId } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
      } catch {
        expectedTotal = 0;
      }

      const listOpts = {
        scopeTypes,
        scopeConfident,
        probeTypes: scopeTypes === null ? [] : probeTypes,
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
      const maxPages = Math.min(
        10,
        Math.ceil(Math.max(reported, expectedTotal, 1) / pageSize),
      );
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

      // Count > grid: re-run recovery with probe types when untyped list under-delivered.
      if (
        expectedTotal > byId.size &&
        scopeTypes !== null &&
        probeTypes.length > 0 &&
        byId.size < rowLimit
      ) {
        const catchUp = await jobService.listVisibleJobs(
          {
            page: 1,
            limit: Math.min(rowLimit, 100),
            order: 'desc',
            ...(branchId ? { branch_id: branchId } : {}),
          },
          {
            scopeTypes: probeTypes,
            scopeConfident: false,
            probeTypes,
          },
        );
        take(catchUp.jobs);
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
        visibleJobTypes: collected.meta?.visible_job_types,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
