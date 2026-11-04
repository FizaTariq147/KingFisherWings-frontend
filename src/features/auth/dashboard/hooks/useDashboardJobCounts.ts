import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '@/features/jobs/services/job.service';
import type { JobStatus } from '@/features/jobs/constants/job.constants';
import type { JobListParams } from '@/features/jobs/types/job.types';
import { effectiveListJobTypes } from '@/features/jobs/utils/deptAccessFromStaffGrants';
import { normalizeVisibleJobTypeScope } from '@/features/jobs/utils/visibleJobTypeScope';
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

const EMPTY_JOB_COUNTS = {
  byStatus: Object.fromEntries(COUNT_STATUSES.map((s) => [s, 0])) as Record<JobStatus, number>,
  bars: COUNT_STATUSES.map(() => 0),
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

type JobCountsShape = typeof EMPTY_JOB_COUNTS & {
  byStatus: Record<JobStatus, number>;
};

async function legacyJobCounts(scopeParams: Pick<JobListParams, 'job_types'>): Promise<JobCountsShape> {
  // No period filter — Active jobs / All jobs are an open-ops snapshot, not MTD creates.
  const pages = await Promise.all(
    COUNT_STATUSES.map((status) =>
      jobService.list({ page: 1, limit: 1, status, ...scopeParams }),
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

/** Prefer list totals when dashboard-counts under-counts (e.g. period / ops-only ACL). */
function reconcileJobCounts(
  api: JobCountsShape,
  list: JobCountsShape,
): JobCountsShape {
  const maxNum = (a: number, b: number) => Math.max(a || 0, b || 0);
  const byStatus = { ...api.byStatus };
  for (const status of COUNT_STATUSES) {
    byStatus[status] = maxNum(api.byStatus[status] ?? 0, list.byStatus[status] ?? 0);
  }
  const active = maxNum(api.active, list.active);
  return {
    ...api,
    byStatus,
    bars: COUNT_STATUSES.map((status) => byStatus[status] ?? 0),
    active,
    inTransit: maxNum(api.inTransit, list.inTransit),
    atOrigin: maxNum(api.atOrigin, list.atOrigin),
    newJobs: maxNum(api.newJobs, list.newJobs),
    customsHold: maxNum(api.customsHold, list.customsHold),
    docsPending: maxNum(api.docsPending, list.docsPending),
    onHold: maxNum(api.onHold, list.onHold),
    delayed: maxNum(api.delayed, list.delayed),
    delivered: maxNum(api.delivered, list.delivered),
    cancelled: maxNum(api.cancelled, list.cancelled),
    completed: maxNum(api.completed, list.completed),
    inProgress: maxNum(api.inProgress, list.inProgress),
    open: maxNum(maxNum(api.open, list.open), active),
  };
}

export function useDashboardJobCounts(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuth();
  const apiPeriod = uiPeriodToApi(period);
  const jobScope = useMemo(() => {
    if (user?.unrestrictedOps) return { kind: 'unrestricted' as const };
    const effective = effectiveListJobTypes(
      user?.visibleJobTypes,
      user?.writableJobTypes,
      user?.permissions ?? [],
    );
    return normalizeVisibleJobTypeScope(effective);
  }, [
    user?.unrestrictedOps,
    user?.visibleJobTypes,
    user?.writableJobTypes,
    user?.permissions,
  ]);

  const scopeParams = useMemo((): Pick<JobListParams, 'job_types'> => {
    if (jobScope.kind === 'locked') return { job_types: [] };
    if (jobScope.kind === 'scoped') return { job_types: jobScope.types };
    return {};
  }, [jobScope]);

  return useQuery({
    queryKey: ['tenant', 'dashboard', 'job-counts', apiPeriod, jobScope],
    queryFn: async () => {
      if (jobScope.kind === 'locked') return EMPTY_JOB_COUNTS;
      // List totals match Active shipments / All jobs (no period). Reconcile so
      // period-scoped or ops-only dashboard-counts cannot under-count staff jobs for admin.
      const listCounts = await legacyJobCounts(scopeParams);
      try {
        const apiCounts = await jobService.dashboardCounts(apiPeriod);
        return reconcileJobCounts(apiCounts as JobCountsShape, listCounts);
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
        // Pending cards are DRAFT-only — never replace with a broader API "open/pending" total.
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
