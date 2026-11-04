import type { Job } from '@/features/jobs/types/job.types';
import type { JobStatus } from '@/features/jobs/constants/job.constants';
import { isActiveJob, OPEN_JOB_STATUSES } from './dashboardFormat';

const COUNT_STATUSES: JobStatus[] = [...OPEN_JOB_STATUSES];

export type DerivedJobCounts = {
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
 * Derive dashboard job KPIs from the same job rows the Active shipments grid uses.
 * Admin uses tenant-wide API totals; staff should use this on their scoped list.
 */
export function jobCountsFromJobs(jobs: readonly Job[]): DerivedJobCounts {
  const byStatus = Object.fromEntries(COUNT_STATUSES.map((s) => [s, 0])) as Record<
    JobStatus,
    number
  >;
  let cancelled = 0;
  let completed = 0;

  for (const job of jobs) {
    const status = job.status;
    if (status === 'CANCELLED') {
      cancelled += 1;
      continue;
    }
    if (status === 'COMPLETED') {
      completed += 1;
      continue;
    }
    if ((COUNT_STATUSES as readonly string[]).includes(status)) {
      byStatus[status as JobStatus] += 1;
    }
  }

  const active = jobs.filter((j) => isActiveJob(j.status)).length;
  const onHold = byStatus.ON_HOLD ?? 0;
  const inTransit = (byStatus.IN_PROGRESS ?? 0) + (byStatus.CUSTOMS_CLEARANCE ?? 0);
  const atOrigin =
    (byStatus.BOOKING_CONFIRMED ?? 0) +
    (byStatus.DOCS_PENDING ?? 0) +
    (byStatus.ENQUIRY ?? 0);
  const newJobs = (byStatus.ENQUIRY ?? 0) + (byStatus.QUOTATION ?? 0);

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
    cancelled,
    completed,
    inProgress: byStatus.IN_PROGRESS ?? 0,
    open: active,
  };
}
