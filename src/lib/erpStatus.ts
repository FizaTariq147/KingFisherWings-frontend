export type ErpBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary';

/** Normalize API / enum status strings for lookup. */
export function normalizeStatusKey(status?: string | null): string {
  return (status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

const SUCCESS = new Set([
  'ACTIVE',
  'APPROVED',
  'BOOKED',
  'COMPLETED',
  'CONFIRMED',
  'CONVERTED',
  'DELIVERED',
  'PAID',
  'POSITIVE',
  'SENT',
  'VERIFIED',
  'WON',
]);

const WARNING = new Set([
  'ATTENTION',
  'CUSTOMER_REVIEW',
  'DOCS_PENDING',
  'DRAFT',
  'EXPIRED',
  'IN_PROGRESS',
  'NEGOTIATING',
  'ON_HOLD',
  'PENDING',
  'QUALIFIED',
  'WAITING',
]);

const DANGER = new Set([
  'CANCELLED',
  'CANCELED',
  'DISAPPROVED',
  'FAILED',
  'INACTIVE',
  'LOST',
  'NEGATIVE',
  'REJECTED',
  'UNSUBSCRIBED',
  'VOID',
]);

const INFO = new Set([
  'BOOKING_CONFIRMED',
  'ENQUIRY',
  'NEW',
  'OPEN',
  'PROCESSING',
  'QUOTATION',
  'QUOTED',
  'SUBMITTED',
]);

const PRIMARY = new Set(['INTERNALLY_APPROVED']);

/** Single mapping for operational status → badge variant (freight ERP). */
export function statusToBadgeVariant(status?: string | null): ErpBadgeVariant {
  const key = normalizeStatusKey(status);
  if (!key) return 'neutral';
  if (PRIMARY.has(key)) return 'primary';
  if (SUCCESS.has(key)) return 'success';
  if (DANGER.has(key)) return 'danger';
  if (WARNING.has(key)) return 'warning';
  if (INFO.has(key)) return 'info';
  return 'neutral';
}

/** Human-readable label when no module-specific label exists. */
export function formatStatusLabel(status?: string | null): string {
  const key = normalizeStatusKey(status);
  if (!key) return '—';
  return key
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}
