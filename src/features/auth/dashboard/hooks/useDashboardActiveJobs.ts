import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { JOB_TYPES, type JobType } from '@/features/jobs/constants/job.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import { effectiveJobListType } from '@/features/jobs/utils/effectiveJobListType';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import { resolveStaffListJobTypes } from '@/features/jobs/utils/resolveStaffListJobTypes';
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
 * Active shipments for admin + staff.
 *
 * Uses listVisibleJobs: plain GET /jobs first; if BE returns 0 under
 * operations_scope (job_type:{in:[]} while job_count is still 14), fans out
 * GET /jobs?job_type= for /me granted types only. No creator filter.
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  /** Optional client-side type filter only — never the sole API strategy. */
  jobType?: string;
  branchId?: string;
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuth();
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;

  const scopeTypes = useMemo((): JobType[] | null => {
    if (isOpsUnrestrictedUser(user)) return null;
    const types = resolveStaffListJobTypes({
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
      candidates: [...JOB_TYPES],
    });
    return types.length ? types : [...JOB_TYPES];
  }, [user]);

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'visible-v8',
      jobType,
      branchId,
      rowLimit,
      scopeTypes,
    ],
    queryFn: async () => {
      const baseParams: JobListParams = {
        page: 1,
        limit: Math.min(rowLimit, 100),
        order: 'desc',
        ...(branchId ? { branch_id: branchId } : {}),
      };

      const result = await jobService.listVisibleJobs(baseParams, {
        scopeTypes,
      });

      const byId = new Map<string, Job>();
      for (const job of result.jobs ?? []) {
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

      // listVisibleJobs already pages internally; if total > page slice, fetch more.
      const total = result.meta?.total ?? byId.size;
      if (total > (result.jobs?.length ?? 0) && scopeTypes !== undefined) {
        const pageSize = 100;
        const maxPages = Math.min(10, Math.ceil(Math.min(total, rowLimit) / pageSize));
        for (let page = 2; page <= maxPages; page += 1) {
          const more = await jobService.listVisibleJobs(
            { ...baseParams, page, limit: pageSize },
            { scopeTypes },
          );
          for (const job of more.jobs ?? []) {
            if (!job?.id) continue;
            const status = normalizeStatus(job.status);
            if (CLOSED.has(status)) continue;
            const resolvedType = effectiveJobListType(job);
            if (jobType && resolvedType !== jobType) continue;
            byId.set(
              job.id,
              job.job_type === resolvedType && status === job.status
                ? job
                : {
                    ...job,
                    job_type: resolvedType,
                    status: status as Job['status'],
                  },
            );
          }
          if ((more.jobs?.length ?? 0) === 0) break;
          if (byId.size >= rowLimit) break;
        }
      }

      const rows = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );
      const openBucket = rows.filter((j) => isOpenBucketJob(j.status));

      return {
        jobs: rows.slice(0, rowLimit),
        openTotal: openBucket.length,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 15_000,
  });
}
