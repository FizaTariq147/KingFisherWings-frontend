import type { Job } from '@/features/jobs/types/job.types';
import type { JobStatus, JobType } from '@/features/jobs/constants/job.constants';

export type DashboardPeriod = 'today' | 'week' | 'month';

export const CLOSED_JOB_STATUSES: JobStatus[] = ['COMPLETED', 'CANCELLED'];

export function firstName(fullName?: string): string {
  const part = fullName?.trim().split(/\s+/)[0];
  return part || 'there';
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDashboardDate(now = new Date()): string {
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
  const date = now
    .toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
    .toUpperCase();
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone?.split('/').pop()?.replace(/_/g, ' ');
  return `${weekday}, ${date}  ·  ${time}${zone ? `/${zone.toUpperCase()}` : ''}`;
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function periodRange(period: DashboardPeriod, now = new Date()): { from: string; to: string } {
  const to = isoDate(now);
  if (period === 'today') return { from: to, to };
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { from: isoDate(start), to };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: isoDate(start), to };
}

export function compactMoney(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    const digits = v >= 10 ? 1 : 2;
    return `${sign}$${v.toFixed(digits).replace(/\.0+$/, '')}M`;
  }
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;
  return `${sign}$${Math.round(abs)}`;
}

export function formatMoney(amount?: number, currency?: string): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (!currency || currency === 'USD') return `$${formatted}`;
  return `${formatted} ${currency}`;
}

export function formatShortDate(value?: string): string {
  if (!value?.trim()) return '—';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw.slice(0, 10));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return raw.slice(0, 10);
  }
  return raw;
}

export function relativeTime(value?: string): string {
  if (!value) return '';
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return '';
  const delta = Date.now() - ts;
  const mins = Math.round(delta / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function jobMode(jobType: JobType | string): 'Air' | 'Sea' | 'Land' | 'Other' {
  if (String(jobType).startsWith('AIR')) return 'Air';
  if (String(jobType).startsWith('SEA') || String(jobType).startsWith('NVOCC')) return 'Sea';
  if (jobType === 'LAND' || jobType === 'COURIER') return 'Land';
  return 'Other';
}

export function jobLane(job: Pick<Job, 'origin_port_code' | 'dest_port_code'>): string {
  const origin = job.origin_port_code?.trim() || '—';
  const dest = job.dest_port_code?.trim() || '—';
  return `${origin} → ${dest}`;
}

export function jobClient(job: Pick<Job, 'shipper_name' | 'consignee_name'>): string {
  return job.shipper_name?.trim() || job.consignee_name?.trim() || '—';
}

export function isActiveJob(status: JobStatus): boolean {
  return !CLOSED_JOB_STATUSES.includes(status);
}

export function isCustomsHold(job: Pick<Job, 'status'>): boolean {
  return job.status === 'CUSTOMS_CLEARANCE' || job.status === 'ON_HOLD';
}

export function isDocsPending(job: Pick<Job, 'status'>): boolean {
  return job.status === 'DOCS_PENDING';
}

export function deptForStatus(status: JobStatus): string {
  switch (status) {
    case 'CUSTOMS_CLEARANCE':
    case 'ON_HOLD':
      return 'Customs';
    case 'DOCS_PENDING':
      return 'Documentation';
    case 'BOOKING_CONFIRMED':
      return 'Sales';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'Accounts';
    case 'ENQUIRY':
    case 'QUOTATION':
      return 'Sales';
    default:
      return 'Operations';
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function unwrapReportRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Record<string, unknown> => Boolean(asRecord(x)));
  }
  const r = asRecord(raw);
  if (!r) return [];
  for (const key of ['rows', 'items', 'data', 'results', 'lanes', 'customers', 'months']) {
    const v = r[key];
    if (Array.isArray(v)) {
      return v.filter((x): x is Record<string, unknown> => Boolean(asRecord(x)));
    }
  }
  const nested = asRecord(r.data);
  if (nested) {
    for (const key of ['rows', 'items']) {
      const v = nested[key];
      if (Array.isArray(v)) {
        return v.filter((x): x is Record<string, unknown> => Boolean(asRecord(x)));
      }
    }
  }
  return [];
}

function normKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, '');
}

export function pickString(row: Record<string, unknown>, candidates: string[]): string | undefined {
  const wanted = candidates.map(normKey);
  for (const [key, value] of Object.entries(row)) {
    if (!wanted.includes(normKey(key))) continue;
    if (value == null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return undefined;
}

export function pickNumber(row: Record<string, unknown>, candidates: string[]): number | undefined {
  const wanted = candidates.map(normKey);
  for (const [key, value] of Object.entries(row)) {
    if (!wanted.includes(normKey(key))) continue;
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}
