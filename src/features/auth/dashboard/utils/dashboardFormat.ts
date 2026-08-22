import type { Job } from '@/features/jobs/types/job.types';
import type { JobStatus, JobType } from '@/features/jobs/constants/job.constants';
import { isUuid } from '@/lib/isUuid';

const UUID_IN_TEXT_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

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

export function looksLikeUuid(value: string): boolean {
  return isUuid(value.trim());
}

/** Drop raw UUIDs and uuid>uuid lane keys; keep human-readable labels only. */
export function sanitizeDisplayLabel(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (looksLikeUuid(trimmed)) return undefined;

  const compositeParts = trimmed
    .split(/[>→]|(?:\s*->\s*)/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (compositeParts.length >= 2 && compositeParts.every((part) => looksLikeUuid(part))) {
    return undefined;
  }

  const nonUuidParts = compositeParts.filter((part) => !looksLikeUuid(part));
  if (nonUuidParts.length >= 2) return nonUuidParts.join(' → ');
  if (nonUuidParts.length === 1) return nonUuidParts[0];

  const stripped = trimmed
    .replace(UUID_IN_TEXT_RE, '')
    .replace(/[>→\-–—|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length >= 2 && !looksLikeUuid(stripped)) return stripped;

  return undefined;
}

export function jobLane(job: Pick<Job, 'origin_port_code' | 'dest_port_code'>): string {
  const origin = sanitizeDisplayLabel(job.origin_port_code) ?? '—';
  const dest = sanitizeDisplayLabel(job.dest_port_code) ?? '—';
  return `${origin} → ${dest}`;
}

export function jobPortCode(code?: string | null): string {
  return sanitizeDisplayLabel(code ?? undefined) ?? '—';
}

export function jobInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length || name === '—') return 'JB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function jobModeDetail(job: Pick<Job, 'job_type'>): string {
  const type = String(job.job_type);
  if (type.startsWith('AIR')) return 'Air';
  if (type.includes('LCL')) return 'Sea LCL';
  if (type.startsWith('SEA') || type.startsWith('NVOCC')) return 'Sea FCL';
  if (type === 'LAND' || type === 'COURIER') return 'Land';
  return jobMode(job.job_type);
}

export function durationInDept(updatedAt?: string): string {
  if (!updatedAt) return '—';
  const ts = Date.parse(updatedAt);
  if (Number.isNaN(ts)) return '—';
  const hours = Math.max(1, Math.floor((Date.now() - ts) / 3_600_000));
  if (hours < 24) return `${hours} h in dept`;
  const days = Math.max(1, Math.floor(hours / 24));
  return `${days} d in dept`;
}

export type ShipmentStatusChip = 'all' | 'in_transit' | 'customs' | 'docs_due' | 'booked' | 'delivered';

export function shipmentStatusChip(job: Pick<Job, 'status'>): ShipmentStatusChip {
  if (job.status === 'IN_PROGRESS') return 'in_transit';
  if (isCustomsHold(job)) return 'customs';
  if (isDocsPending(job)) return 'docs_due';
  if (job.status === 'BOOKING_CONFIRMED') return 'booked';
  if (job.status === 'DELIVERED') return 'delivered';
  return 'all';
}

export function shipmentStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In transit';
    case 'CUSTOMS_CLEARANCE':
    case 'ON_HOLD':
      return 'Customs';
    case 'DOCS_PENDING':
      return 'Docs due';
    case 'BOOKING_CONFIRMED':
      return 'Booked';
    case 'DELIVERED':
      return 'Delivered';
    default:
      return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }
}

export function routeProgressInfo(job: Job): {
  origin: string;
  dest: string;
  pct: number;
  barColor: string;
  caption: string;
} {
  const origin = jobPortCode(job.origin_port_code);
  const dest = jobPortCode(job.dest_port_code);
  const etd = Date.parse(job.etd || job.sea_fcl_details?.etd || '');
  const eta = Date.parse(job.eta || job.sea_fcl_details?.eta || '');
  const mode = jobMode(job.job_type);
  let pct = 35;
  if (Number.isFinite(etd) && Number.isFinite(eta) && eta > etd) {
    pct = Math.round(((Date.now() - etd) / (eta - etd)) * 100);
    pct = Math.min(96, Math.max(8, pct));
  }
  if (job.status === 'DELIVERED' || job.status === 'COMPLETED') pct = 100;
  if (job.status === 'BOOKING_CONFIRMED' || job.status === 'ENQUIRY' || job.status === 'QUOTATION') {
    pct = 10;
  }

  let barColor = mode === 'Air' ? '#C7590F' : '#2C557A';
  if (isCustomsHold(job)) barColor = '#FF751F';
  if (isDocsPending(job)) barColor = '#C6303E';
  if (job.status === 'DELIVERED') barColor = '#3BA066';

  let caption = 'En route';
  if (isCustomsHold(job)) {
    caption = dest !== '—' ? `Held at ${dest} customs` : 'Held at customs';
    if (job.updated_at) {
      const time = new Date(job.updated_at).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      caption += ` since ${time}`;
    }
  } else if (isDocsPending(job)) {
    caption = 'Documents outstanding';
  } else if (job.status === 'DELIVERED') {
    caption = 'Delivered';
  } else if (Number.isFinite(eta)) {
    const days = Math.max(0, Math.ceil((eta - Date.now()) / 86_400_000));
    caption = days === 0 ? 'Arriving today' : `${days} day${days === 1 ? '' : 's'} to go`;
  }

  return { origin, dest, pct, barColor, caption };
}

export function jobMetaHints(job: Job): Array<{ text: string; tone: 'success' | 'warning' }> {
  const hints: Array<{ text: string; tone: 'success' | 'warning' }> = [];
  const customs = job.sea_fcl_details?.customs_status;
  if (customs === 'CLEARED' || customs === 'RELEASED') {
    hints.push({ text: 'Customs cleared', tone: 'success' });
  }
  const blType = job.sea_fcl_details?.bl_type;
  if (blType) hints.push({ text: `BL ${blType}`, tone: 'success' });
  else if (job.bills_of_lading?.some((bl) => bl.is_surrendered || bl.bl_number)) {
    hints.push({ text: 'BL released', tone: 'success' });
  }
  if (job.documents?.length) {
    hints.push({ text: `${job.documents.length} document${job.documents.length === 1 ? '' : 's'}`, tone: 'success' });
  }
  if (job.is_dg) hints.push({ text: 'DG cargo', tone: 'warning' });
  if (isDocsPending(job)) hints.push({ text: 'Docs pending', tone: 'warning' });
  return hints;
}

export function deptBadgeClass(dept: string): string {
  switch (dept) {
    case 'Customs':
      return 'bg-[#FCE8EA] text-[#C6303E]';
    case 'Documentation':
      return 'bg-[#FDECDC] text-[#E07A2F]';
    case 'Sales':
      return 'bg-[#FCE8F4] text-[#B83280]';
    case 'Accounts':
      return 'bg-[#E7F6EC] text-[#3BA066]';
    default:
      return 'bg-[#E8F4F8] text-[#1F8A8A]';
  }
}

export function shipmentStatusClass(status: JobStatus): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'bg-[#E8EEF4] text-[#0A2942]';
    case 'CUSTOMS_CLEARANCE':
    case 'ON_HOLD':
      return 'bg-[#FDECDC] text-[#E07A2F]';
    case 'DOCS_PENDING':
      return 'bg-[#FCE8EA] text-[#C6303E]';
    case 'BOOKING_CONFIRMED':
      return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]';
    case 'DELIVERED':
      return 'bg-[#E7F6EC] text-[#3BA066]';
    default:
      return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]';
  }
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
