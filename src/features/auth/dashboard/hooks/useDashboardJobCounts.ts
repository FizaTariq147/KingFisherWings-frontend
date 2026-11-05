import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '@/features/jobs/services/job.service';
import type { JobDashboardCounts } from '@/features/jobs/types/jobDashboard.types';
import type { JobListParams } from '@/features/jobs/types/job.types';
import { PENDING_QUOTATION_STATUSES } from '@/features/quotations/constants/quotation.constants';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { type DashboardPeriod } from '../utils/dashboardFormat';

const EMPTY_COUNTS: JobDashboardCounts = {
  byStatus: {},
  bars: [],
  jobCount: 0,
  active: 0,
  inTransit: 0,
  atOrigin: 0,
  newJobs: 0,
  customsHold: 0,
  docsPending: 0,
  onHold: 0,
  delayed: 0,
  delivered: 0,
  cancelled: 0,
  completed: 0,
  inProgress: 0,
  open: 0,
};

export type DashboardJobCountScope = {
  kind: 'unrestricted' | 'locked' | 'scoped';
  /** Optional section filter — same job_type sent on list + dashboard-counts. */
  jobType?: string;
  jobTypes?: import('@/features/jobs/constants/job.constants').JobType[];
  branchId?: string;
};

/**
 * Dashboard job KPIs from GET /jobs/dashboard-counts.
 * Bind total-jobs UI to `jobCount` (same as `total`). Never use `open` for that.
 * Do not send created_by / department_id / user id — BE scopes by resolveVisibleJobTypes
 * (job type grants). Org department_id is not staff ACL (most jobs have department_id null).
 * Optional `job_type` / `branch_id` must match the list filters when used;
 * then job_count === GET /jobs meta.total.
 */
export function useDashboardJobCounts(
  period: DashboardPeriod = 'month',
  options?: { enabled?: boolean; scope?: DashboardJobCountScope },
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  const scope = options?.scope ?? { kind: 'unrestricted' as const };

  const jobType =
    scope.kind === 'scoped'
      ? (scope.jobType?.trim() ||
          (scope.jobTypes?.length === 1 ? String(scope.jobTypes[0]) : undefined))
      : undefined;
  const branchId = scope.kind === 'scoped' ? scope.branchId?.trim() : undefined;

  return useQuery({
    queryKey: ['tenant', 'dashboard', 'job-counts', apiPeriod, scope.kind, jobType, branchId],
    queryFn: async (): Promise<JobDashboardCounts> => {
      if (scope.kind === 'locked') return EMPTY_COUNTS;
      try {
        return await jobService.dashboardCounts({
          ...apiPeriod,
          ...(jobType ? { job_type: jobType } : {}),
          ...(branchId ? { branch_id: branchId } : {}),
        });
      } catch {
        // Fallback: unfiltered list meta.total ≡ job_count (same ACL).
        const page = await jobService.list({
          page: 1,
          limit: 1,
          skip_client_hydrate: true,
          ...(jobType ? { job_type: jobType as JobListParams['job_type'] } : {}),
          ...(branchId ? { branch_id: branchId } : {}),
        });
        const total = page.meta?.total ?? 0;
        return {
          ...EMPTY_COUNTS,
          jobCount: total,
          active: 0,
          open: 0,
        };
      }
    },
    enabled: Boolean(accessToken) && options?.enabled !== false,
    staleTime: 60_000,
  });
}

export function useDashboardPendingQuoteStats(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'pending-quote-stats', apiPeriod, PENDING_QUOTATION_STATUSES, 50],
    queryFn: async () => {
      const listPages = await Promise.all(
        PENDING_QUOTATION_STATUSES.map((status) =>
          quotationService.list({ page: 1, limit: 50, status, order: 'desc' }),
        ),
      );
      const byStatus = Object.fromEntries(
        PENDING_QUOTATION_STATUSES.map((status, i) => [status, listPages[i]?.meta.total ?? 0]),
      );
      const bars = PENDING_QUOTATION_STATUSES.map((status) => byStatus[status] ?? 0);
      const quotations = listPages
        .flatMap((page) => page.quotations)
        .sort(
          (a, b) =>
            Date.parse(b.updated_at || b.created_at || '0') -
            Date.parse(a.updated_at || a.created_at || '0'),
        );
      const totalPending = listPages.reduce((sum, page) => sum + (page.meta.total || 0), 0);
      const pipelineValue = quotations.reduce(
        (sum, q) => sum + (q.total_amount ?? q.revenue_total ?? 0),
        0,
      );
      const legacy = { totalPending, byStatus, bars, quotations, pipelineValue };

      try {
        const stats = await quotationService.dashboardStats({
          period: apiPeriod.period,
          from_date: apiPeriod.from_date,
          to_date: apiPeriod.to_date,
        });
        const draftFromApi =
          stats.byStatus.DRAFT ?? stats.byStatus.Draft ?? stats.byStatus.draft;
        return {
          totalPending:
            typeof draftFromApi === 'number' ? draftFromApi : legacy.totalPending,
          byStatus: legacy.byStatus,
          bars: legacy.bars,
          quotations: legacy.quotations,
          pipelineValue: legacy.pipelineValue,
        };
      } catch {
        return legacy;
      }
    },
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useDashboardTeamWorkload(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'team-workload', apiPeriod],
    queryFn: () => jobService.teamWorkload(apiPeriod),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}
