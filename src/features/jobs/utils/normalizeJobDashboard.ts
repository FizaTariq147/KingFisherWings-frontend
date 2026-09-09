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

const ACTIVE_STATUSES: JobStatus[] = [
  'ENQUIRY',
  'QUOTATION',
  'BOOKING_CONFIRMED',
  'IN_PROGRESS',
  'DOCS_PENDING',
  'CUSTOMS_CLEARANCE',
  'DELIVERED',
  'ON_HOLD',
];

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

  const bars = ACTIVE_STATUSES.map((status) => byStatus[status] ?? 0);
  const inTransit = get('in_transit', 'inTransit', 'IN_PROGRESS') + (byStatus.CUSTOMS_CLEARANCE ?? 0);
  const atOrigin =
    (byStatus.BOOKING_CONFIRMED ?? 0) + (byStatus.DOCS_PENDING ?? 0) + (byStatus.ENQUIRY ?? 0);
  const newJobs = (byStatus.ENQUIRY ?? 0) + (byStatus.QUOTATION ?? 0);
  const active =
    pickNumber(inner, ['active', 'active_jobs', 'activeJobs', 'total_active']) ??
    ACTIVE_STATUSES.reduce((sum, s) => sum + (byStatus[s] ?? 0), 0);

  return {
    byStatus,
    bars,
    active,
    inTransit: pickNumber(inner, ['in_transit', 'inTransit']) ?? inTransit,
    atOrigin: pickNumber(inner, ['at_origin', 'atOrigin']) ?? atOrigin,
    newJobs: pickNumber(inner, ['new_jobs', 'newJobs']) ?? newJobs,
    customsHold:
      pickNumber(inner, ['customs_hold', 'customsHold']) ??
      (byStatus.CUSTOMS_CLEARANCE ?? 0) + (byStatus.ON_HOLD ?? 0),
    docsPending: pickNumber(inner, ['docs_pending', 'docsPending']) ?? byStatus.DOCS_PENDING ?? 0,
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
