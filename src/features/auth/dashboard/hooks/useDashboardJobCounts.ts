import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '@/features/jobs/services/job.service';
import type { JobStatus } from '@/features/jobs/constants/job.constants';
import { PENDING_QUOTATION_STATUSES } from '@/features/quotations/constants/quotation.constants';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import type { DashboardPeriod } from '../utils/dashboardFormat';

const COUNT_STATUSES: JobStatus[] = [
  'ENQUIRY',
  'QUOTATION',
  'BOOKING_CONFIRMED',
  'IN_PROGRESS',
  'DOCS_PENDING',
  'CUSTOMS_CLEARANCE',
  'DELIVERED',
  'ON_HOLD',
];

type JobCountsShape = {
  byStatus: Record<JobStatus, number>;
  bars: number[];
  active: number;
  inTransit: number;
  atOrigin: number;
  newJobs: number;
  customsHold: number;
  docsPending: number;
  onHold: number;
  delayed: number;
  delivered: number;
  cancelled: number;
  completed: number;
  inProgress: number;
  open: number;
};

/**
 * Open-ops snapshot from GET /jobs (no period, no client hydrate).
 * Same path for admin and staff so KPI/header cards stay aligned.
 */
async function legacyJobCounts(): Promise<JobCountsShape> {
  const pages = await Promise.all(
    COUNT_STATUSES.map((status) =>
      jobService.list({
        page: 1,
        limit: 1,
        status,
        skip_client_hydrate: true,
      }),
    ),
  );
  const byStatus = Object.fromEntries(
    COUNT_STATUSES.map((status, i) => [status, pages[i]?.meta.total ?? 0]),
  ) as Record<JobStatus, number>;
  const inTransit = (byStatus.IN_PROGRESS ?? 0) + (byStatus.CUSTOMS_CLEARANCE ?? 0);
  const atOrigin =
    (byStatus.BOOKING_CONFIRMED ?? 0) +
    (byStatus.DOCS_PENDING ?? 0) +
    (byStatus.ENQUIRY ?? 0);
  const newJobs = (byStatus.ENQUIRY ?? 0) + (byStatus.QUOTATION ?? 0);
  const active =
    (byStatus.ENQUIRY ?? 0) +
    (byStatus.QUOTATION ?? 0) +
    (byStatus.BOOKING_CONFIRMED ?? 0) +
    (byStatus.IN_PROGRESS ?? 0) +
    (byStatus.DOCS_PENDING ?? 0) +
    (byStatus.CUSTOMS_CLEARANCE ?? 0) +
    (byStatus.DELIVERED ?? 0) +
    (byStatus.ON_HOLD ?? 0);
  const onHold = byStatus.ON_HOLD ?? 0;
  return {
    byStatus,
    bars: COUNT_STATUSES.map((status) => byStatus[status] ?? 0),
    active,
    inTransit,
    atOrigin,
    newJobs,
    customsHold: (byStatus.CUSTOMS_CLEARANCE ?? 0) + onHold,
    docsPending: byStatus.DOCS_PENDING ?? 0,
    onHold,
    delayed: 0,
    delivered: byStatus.DELIVERED ?? 0,
    cancelled: 0,
    completed: 0,
    inProgress: byStatus.IN_PROGRESS ?? 0,
    open: active,
  };
}

/**
 * Prefer list open-ops totals over period-scoped dashboard-counts.
 * Admin and staff use the same unscoped list totals (no FE inflate).
 */
export function useDashboardJobCounts(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'job-counts', 'open-ops', apiPeriod],
    queryFn: async () => {
      // Primary: same GET /jobs meta.total path for every role (skip client hydrate).
      const listCounts = await legacyJobCounts();
      try {
        // Keep period API for delayed/completed extras when it returns them, but
        // never let a lower period/ops-scoped active overwrite the open-ops total.
        const apiCounts = await jobService.dashboardCounts(apiPeriod);
        return {
          ...listCounts,
          delayed: Math.max(listCounts.delayed, apiCounts.delayed ?? 0),
          cancelled: Math.max(listCounts.cancelled, apiCounts.cancelled ?? 0),
          completed: Math.max(listCounts.completed, apiCounts.completed ?? 0),
        };
      } catch {
        return listCounts;
      }
    },
    enabled: Boolean(accessToken),
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
