import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
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

const PAGE_SIZE = 100;
const MAX_ACTIVE_PAGES = 10;
const CLOSED = new Set(CLOSED_JOB_STATUSES.map(String));

/**
 * Active shipments for admin + staff.
 * Always plain GET /jobs (no job_type) — BE DB-resolves staff departments.
 * Sending job_type when it is missing from the token yields job_type:{in:[]}
 * while dashboard-counts (no job_type) still show totals.
 * Exclude only completed / cancelled. No creator filter.
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  /** Optional client-side type filter only — never sent as GET ?job_type=. */
  jobType?: string;
  branchId?: string;
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'jwt-list-v7',
      jobType,
      branchId,
      rowLimit,
    ],
    queryFn: async () => {
      const byId = new Map<string, Job>();

      const takeRow = (job: Job | undefined) => {
        if (!job?.id) return;
        const status = normalizeStatus(job.status);
        if (CLOSED.has(status)) return;
        const resolvedType = effectiveJobListType(job);
        if (jobType && resolvedType !== jobType) return;
        byId.set(
          job.id,
          job.job_type === resolvedType && status === job.status
            ? job
            : { ...job, job_type: resolvedType, status: status as Job['status'] },
        );
      };

      const baseParams: JobListParams = {
        order: 'desc',
        created_by: undefined,
        salesperson_id: undefined,
        department_id: undefined,
        job_type: undefined,
        job_types: undefined,
        ...(branchId ? { branch_id: branchId } : {}),
      };

      for (let page = 1; page <= MAX_ACTIVE_PAGES; page += 1) {
        const result = await jobService.list({
          ...baseParams,
          page,
          limit: PAGE_SIZE,
        });
        for (const job of result.jobs ?? []) takeRow(job);
        const total = result.meta?.total ?? result.jobs?.length ?? 0;
        const got = result.jobs?.length ?? 0;
        if (got === 0) break;
        if (page * PAGE_SIZE >= total) break;
        if (byId.size >= rowLimit) break;
      }

      const rows = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );
      const openBucket = rows.filter((j) => isOpenBucketJob(j.status));

      return {
        /** Grid rows: every non-closed job BE returns for this user. */
        jobs: rows.slice(0, rowLimit),
        /** “X open” KPI — open bucket only (excludes delivered). */
        openTotal: openBucket.length,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
