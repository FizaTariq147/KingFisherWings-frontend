import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { JOB_TYPES } from '@/features/jobs/constants/job.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import { canonicalizeJobType } from '@/features/jobs/utils/canonicalizeJobType';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import { resolveStaffListJobTypes } from '@/features/jobs/utils/resolveStaffListJobTypes';
import { OPEN_JOB_STATUSES } from '../utils/dashboardFormat';

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Active shipments grid rows.
 * - Staff: every open job in granted departments (full FCL+LCL families, any creator).
 * - Admin: all open jobs (no job_types filter).
 * - openTotal = unique open rows loaded (All jobs badge matches the grid).
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  /** Max rows to keep for the grid after merge (newest first). */
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user, hasEnabledModule } = useAuth();
  const rowLimit = options?.rowLimit ?? 100;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;
  const unrestricted = isOpsUnrestrictedUser(user);

  const staffJobTypes = useMemo((): JobType[] => {
    if (unrestricted) return [];
    // Trust /me Ops visible∪writable (full families) so no granted type is dropped.
    return resolveStaffListJobTypes({
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
      isModuleEnabled: hasEnabledModule,
      candidates: [...JOB_TYPES],
    });
  }, [user, unrestricted, hasEnabledModule]);

  const filterParams: Pick<JobListParams, 'job_type' | 'branch_id' | 'job_types'> = {
    ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
    ...(branchId ? { branch_id: branchId } : {}),
    // Staff: pass dept types so list() runs search-prefix recovery (admin creates).
    ...(!jobType && staffJobTypes.length ? { job_types: staffJobTypes } : {}),
  };

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'all-dept-any-creator',
      jobType,
      branchId,
      staffJobTypes,
      rowLimit,
      unrestricted,
    ],
    queryFn: async () => {
      const pageLimit = Math.min(100, Math.max(rowLimit, 100));
      const openSet = new Set<string>(OPEN_JOB_STATUSES);
      const byId = new Map<string, Job>();

      const takeOpen = (jobs: Job[] | undefined) => {
        for (const job of jobs ?? []) {
          if (!job?.id) continue;
          if (!openSet.has(String(job.status))) continue;
          byId.set(job.id, job);
        }
      };

      const page = await jobService.list({
        page: 1,
        limit: pageLimit,
        order: 'desc',
        ...filterParams,
      });
      takeOpen(page.jobs);

      // Staff secondary: JWT default list — merge any in-scope open rows.
      if (!unrestricted && staffJobTypes.length && !jobType) {
        const allowed = new Set(staffJobTypes.map((t) => canonicalizeJobType(String(t))));
        try {
          const jwtPage = await jobService.list({
            page: 1,
            limit: pageLimit,
            order: 'desc',
            skip_client_hydrate: true,
            ...(branchId ? { branch_id: branchId } : {}),
          });
          for (const job of jwtPage.jobs ?? []) {
            if (!job?.id) continue;
            if (!openSet.has(String(job.status))) continue;
            const t = canonicalizeJobType(String(job.job_type ?? ''));
            if (!allowed.has(t)) continue;
            if (!byId.has(job.id)) byId.set(job.id, job);
          }
        } catch {
          /* keep primary rows */
        }
      }

      const openJobs = [...byId.values()].sort(
        (a, b) => jobSortTime(b) - jobSortTime(a),
      );

      return {
        jobs: openJobs.slice(0, rowLimit),
        openTotal: openJobs.length,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
