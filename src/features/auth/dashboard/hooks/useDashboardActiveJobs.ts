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

const PAGE_SIZE = 100;
/** Safety cap so a bad meta.total cannot loop forever. */
const MAX_ACTIVE_PAGES = 10;

/**
 * Active shipments grid rows.
 * After BE scopes staff GET /jobs by visible_job_types (any creator), this grid
 * must show every open job in the staff's granted departments — same relevance
 * rule as admin, without created_by / assignee filters.
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
    return new Set(staffJobTypes.map((t) => canonicalizeJobType(String(t))));
  }, [unrestricted, staffJobTypes]);

  return useQuery({
    queryKey: [
      'tenant',
      'dashboard',
      'active-jobs',
      'dept-any-creator-v2',
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
          if (allowedTypeSet) {
            const t = canonicalizeJobType(String(job.job_type ?? ''));
            if (!allowedTypeSet.has(t)) continue;
          }
          byId.set(job.id, job);
        }
      };

      const baseParams: JobListParams = {
        order: 'desc',
        // Never scope Active shipments by creator — BE + FE: any creator in grant.
        created_by: undefined,
        salesperson_id: undefined,
        department_id: undefined,
        ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
        ...(branchId ? { branch_id: branchId } : {}),
        // Staff: granted dept types (drives typed + search recovery until BE is fixed).
        ...(!jobType && staffJobTypes.length ? { job_types: staffJobTypes } : {}),
      };

      // Page through so we do not stop at the first 100 when BE returns more.
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

      // Extra pass: plain JWT list (no job_types) — merge any in-scope open rows
      // BE only exposes on the unfiltered path.
      if (!unrestricted && staffJobTypes.length && !jobType) {
        try {
          for (let page = 1; page <= MAX_ACTIVE_PAGES; page += 1) {
            const jwtPage = await jobService.list({
              page,
              limit: PAGE_SIZE,
              order: 'desc',
              skip_client_hydrate: true,
              created_by: undefined,
              salesperson_id: undefined,
              department_id: undefined,
              ...(branchId ? { branch_id: branchId } : {}),
            });
            takeOpen(jwtPage.jobs);
            const total = jwtPage.meta?.total ?? jwtPage.jobs?.length ?? 0;
            const got = jwtPage.jobs?.length ?? 0;
            if (got === 0) break;
            if (page * PAGE_SIZE >= total) break;
            if (byId.size >= rowLimit) break;
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
        /** Badge = unique open rows shown (all in-scope creators). */
        openTotal: openJobs.length,
      };
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}
