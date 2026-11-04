import { asRecord, pickNumber, pickString } from '@/features/auth/dashboard/utils/dashboardFormat';
import type { JobStatus } from '../constants/job.constants';
import type { JobDashboardCounts, TeamWorkloadRow } from '../types/jobDashboard.types';

function unwrapPayload(raw: unknown): Record<string, unknown> {
  return asRecord(raw) ?? {};
}

function statusMap(raw: unknown): Partial<Record<string, number>> {
  const data = asRecord(raw) ?? {};
  const nested =
    asRecord(data.by_status) ??
    asRecord(data.byStatus) ??
    asRecord(data.statuses) ??
    asRecord(data.counts) ??
    data;
  const out: Partial<Record<string, number>> = {};
  for (const [key, value] of Object.entries(nested)) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) out[key] = n;
  }
  return out;
}

/** Matches BE `open` bucket (excludes delivered / completed / cancelled). */
const OPEN_BUCKET_STATUSES: JobStatus[] = [
  'ENQUIRY',
  'QUOTATION',
  'BOOKING_CONFIRMED',
  'APPROVED',
  'OPEN',
  'IN_PROGRESS',
  'DOCS_PENDING',
  'CUSTOMS_CLEARANCE',
  'ON_HOLD',
];

function jobTypeMap(raw: unknown): Record<string, number> | undefined {
  const data = asRecord(raw);
  if (!data) return undefined;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(data)) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) out[key] = n;
  }
  return Object.keys(out).length ? out : undefined;
}

export function normalizeJobDashboardCounts(raw: unknown): JobDashboardCounts {
  const data = unwrapPayload(raw);
  const inner = asRecord(data.data) ?? data;
  const byStatus = statusMap(inner.by_status ?? inner.byStatus ?? inner);
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const n = pickNumber(inner, [key]) ?? byStatus[key];
      if (n != null) return n;
    }
    return 0;
  };

  const bars = OPEN_BUCKET_STATUSES.map((status) => byStatus[status] ?? 0);
  const inTransit = get('in_transit', 'inTransit', 'IN_PROGRESS') + (byStatus.CUSTOMS_CLEARANCE ?? 0);
  const atOrigin =
    (byStatus.BOOKING_CONFIRMED ?? 0) +
    (byStatus.DOCS_PENDING ?? 0) +
    (byStatus.ENQUIRY ?? 0) +
    (byStatus.APPROVED ?? 0) +
    (byStatus.OPEN ?? 0);
  const newJobs = (byStatus.ENQUIRY ?? 0) + (byStatus.QUOTATION ?? 0);
  const onHold =
    pickNumber(inner, ['on_hold', 'onHold', 'hold']) ?? byStatus.ON_HOLD ?? 0;
  const delayed = pickNumber(inner, ['delayed', 'delayed_count', 'delayedCount']) ?? 0;
  const delivered =
    pickNumber(inner, ['delivered', 'delivered_count']) ?? byStatus.DELIVERED ?? 0;
  const cancelled =
    pickNumber(inner, ['cancelled', 'canceled', 'cancelled_count']) ??
    byStatus.CANCELLED ??
    0;
  const completed =
    pickNumber(inner, ['completed', 'completed_count']) ?? byStatus.COMPLETED ?? 0;
  const inProgress =
    pickNumber(inner, ['in_progress', 'inProgress']) ?? byStatus.IN_PROGRESS ?? 0;

  // BE contract: job_count === total === GET /jobs meta.total (same ACL).
  const jobCount =
    pickNumber(inner, ['job_count', 'jobCount', 'total', 'total_jobs', 'totalJobs']) ?? 0;

  const openFromBucket = OPEN_BUCKET_STATUSES.reduce(
    (sum, s) => sum + (byStatus[s] ?? 0),
    0,
  );
  const open =
    pickNumber(inner, ['open', 'open_count', 'openCount', 'open_bucket', 'openBucket']) ??
    (OPEN_BUCKET_STATUSES.some((s) => byStatus[s] != null) ? openFromBucket : 0);

  const createdInPeriod = pickNumber(inner, [
    'created_in_period',
    'createdInPeriod',
    'created_in_period_count',
  ]);

  const byJobType = jobTypeMap(inner.by_job_type ?? inner.byJobType);

  return {
    byStatus,
    bars,
    jobCount: Math.max(0, jobCount),
    // Legacy alias — do not use for “total jobs” UI (was often confused with open).
    active: Math.max(0, open),
    inTransit: pickNumber(inner, ['in_transit', 'inTransit']) ?? inTransit,
    atOrigin: pickNumber(inner, ['at_origin', 'atOrigin']) ?? atOrigin,
    newJobs: pickNumber(inner, ['new_jobs', 'newJobs']) ?? newJobs,
    customsHold:
      pickNumber(inner, ['customs_hold', 'customsHold']) ??
      (byStatus.CUSTOMS_CLEARANCE ?? 0) + onHold,
    docsPending: pickNumber(inner, ['docs_pending', 'docsPending']) ?? byStatus.DOCS_PENDING ?? 0,
    onHold,
    delayed,
    delivered,
    cancelled,
    completed,
    inProgress,
    open: Math.max(0, open),
    ...(createdInPeriod != null ? { createdInPeriod } : {}),
    ...(byJobType ? { byJobType } : {}),
    raw: inner,
  };
}

export function normalizeTeamWorkload(raw: unknown): TeamWorkloadRow[] {
  const data = unwrapPayload(raw);
  const list =
    (Array.isArray(data) ? data : null) ??
    (Array.isArray(data.items) ? data.items : null) ??
    (Array.isArray(data.users) ? data.users : null) ??
    (Array.isArray(data.team) ? data.team : null) ??
    (Array.isArray(data.workload) ? data.workload : null) ??
    (Array.isArray(asRecord(data.data)?.items) ? (asRecord(data.data)!.items as unknown[]) : null) ??
    [];

  return list
    .map((entry) => {
      const r = asRecord(entry);
      if (!r) return null;
      const name =
        pickString(r, ['name', 'full_name', 'fullName', 'user_name', 'userName', 'display_name']) ||
        '—';
      return {
        userId: pickString(r, ['user_id', 'userId', 'id']),
        name,
        openJobs:
          pickNumber(r, ['open_jobs', 'openJobs', 'open', 'job_count', 'jobs', 'assigned']) ?? 0,
        capacity: pickNumber(r, ['capacity', 'max_jobs', 'maxJobs']),
        utilizationPct: pickNumber(r, [
          'utilization_pct',
          'utilizationPct',
          'utilization',
          'capacity_utilization',
        ]),
        slaPct: pickNumber(r, ['sla_pct', 'slaPct', 'sla', 'sla_hit_rate', 'milestone_sla_pct']),
        raw: r,
      } satisfies TeamWorkloadRow;
    })
    .filter((row): row is TeamWorkloadRow => Boolean(row));
}
