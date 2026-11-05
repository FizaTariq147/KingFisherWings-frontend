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
  const { scopeTypes, kind } = useVisibleJobListScope();
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'staff-plain-v15',
      jobType,
      branchId,
      rowLimit,
      kind,
      scopeTypes === null ? 'admin' : scopeTypes.slice().sort().join(','),
    ],
    queryFn: async () => {
      let expectedTotal = 0;
      let visibleJobTypes: string[] | null | undefined;
      try {
        const counts = await jobService.dashboardCounts(
          branchId ? { branch_id: branchId } : {},
        );
        expectedTotal = Number(counts.jobCount ?? 0) || 0;
        visibleJobTypes = counts.visibleJobTypes;
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
          if (jobType && resolvedType !== jobType) continue;
          byId.set(
            job.id,
            job.job_type === resolvedType && status === job.status
              ? job
              : { ...job, job_type: resolvedType, status: status as Job['status'] },
          );
        }
      };

      // Plain GET /jobs — same ACL as job_count (no department_id / job_type / creator).
      let apiTotal = expectedTotal;
      let listVisible: string[] | null | undefined = visibleJobTypes;
      for (let page = 1; page <= 20; page += 1) {
        const result = await jobService.list({
          page,
          limit: 100,
          order: 'desc',
          ...(branchId ? { branch_id: branchId } : {}),
          department_id: undefined,
          created_by: undefined,
          salesperson_id: undefined,
          job_type: undefined,
          job_types: undefined,
          skip_client_hydrate: true,
        });
        take(result.jobs);
        if (typeof result.meta?.total === 'number') apiTotal = result.meta.total;
        if (
          listVisible === undefined &&
          result.meta &&
          Object.prototype.hasOwnProperty.call(result.meta, 'visible_job_types')
        ) {
          listVisible = result.meta.visible_job_types;
        }
        if ((result.jobs?.length ?? 0) === 0) break;
        if (page * 100 >= Math.max(apiTotal, 1)) break;
        if (byId.size >= rowLimit) break;
      }

      const rows = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );
      const openBucket = rows.filter((j) => isOpenBucketJob(j.status));

      return {
        jobs: rows.slice(0, rowLimit),
        openTotal: openBucket.length,
        expectedTotal: Math.max(expectedTotal, apiTotal),
        visibleJobTypes: listVisible,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
