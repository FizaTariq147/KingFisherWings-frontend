import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { JOB_TYPES } from '@/features/jobs/constants/job.constants';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobListParams } from '@/features/jobs/types/job.types';
import { effectiveJobListType } from '@/features/jobs/utils/effectiveJobListType';
import { isOpsUnrestrictedUser } from '@/features/jobs/utils/isOpsUnrestrictedUser';
import { resolveStaffListJobTypes } from '@/features/jobs/utils/resolveStaffListJobTypes';
import { OPEN_JOB_STATUSES } from '../utils/dashboardFormat';

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

const PAGE_SIZE = 100;
const MAX_ACTIVE_PAGES = 10;

/**
 * Active shipments — trust BE JWT visible_job_types (any creator).
 * Staff uses the same plain GET /jobs path as admin (no client job_types merge),
 * then keeps open rows; soft-filters to /me grants when present.
 */
export function useDashboardActiveJobs(options?: {
  enabled?: boolean;
  jobType?: string;
  branchId?: string;
  rowLimit?: number;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user, hasEnabledModule } = useAuth();
  const rowLimit = options?.rowLimit ?? 500;
  const jobType = options?.jobType?.trim() || undefined;
  const branchId = options?.branchId?.trim() || undefined;
  const unrestricted = isOpsUnrestrictedUser(user);

  const staffJobTypes = useMemo((): JobType[] => {
    if (unrestricted) return [];
    return resolveStaffListJobTypes({
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
      isModuleEnabled: hasEnabledModule,
      candidates: [...JOB_TYPES],
    });
  }, [user, unrestricted, hasEnabledModule]);

  const allowedTypeSet = useMemo(() => {
    if (unrestricted || !staffJobTypes.length) return null;
    return new Set(staffJobTypes);
  }, [unrestricted, staffJobTypes]);

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'be-visible-types-v3',
      jobType,
      branchId,
      staffJobTypes,
      rowLimit,
      unrestricted,
    ],
    queryFn: async () => {
      const openSet = new Set<string>(OPEN_JOB_STATUSES);
      const byId = new Map<string, Job>();

      const takeOpen = (jobs: Job[] | undefined) => {
        for (const job of jobs ?? []) {
          if (!job?.id) continue;
          if (!openSet.has(String(job.status))) continue;
          const resolvedType = effectiveJobListType(job);
          if (allowedTypeSet && !allowedTypeSet.has(resolvedType)) continue;
          byId.set(
            job.id,
            job.job_type === resolvedType ? job : { ...job, job_type: resolvedType },
          );
        }
      };

      // Plain JWT list — same as admin. BE scopes staff by visible_job_types.
      // Do NOT pass job_types (avoids heavy multi-merge that can drop rows).
      const baseParams: JobListParams = {
        order: 'desc',
        created_by: undefined,
        salesperson_id: undefined,
        department_id: undefined,
        ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
        ...(branchId ? { branch_id: branchId } : {}),
      };

      for (let page = 1; page <= MAX_ACTIVE_PAGES; page += 1) {
        const result = await jobService.list({
          ...baseParams,
          page,
          limit: PAGE_SIZE,
        });
        takeOpen(result.jobs);
        const total = result.meta?.total ?? result.jobs?.length ?? 0;
        const got = result.jobs?.length ?? 0;
        if (got === 0) break;
        if (page * PAGE_SIZE >= total) break;
        if (byId.size >= rowLimit) break;
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
    staleTime: 30_000,
  });
}
