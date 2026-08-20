import type { PortalQuotationListItem } from '@/features/portal-quotations/types/portalQuotations.types';
import type { PortalShipmentListItem } from '@/features/portal-shipments/types/portalShipments.types';

export type PortalDashboardPeriod = 'today' | 'week' | 'month';

const TERMINAL_SHIPMENT = new Set(['DELIVERED', 'COMPLETED', 'CANCELLED', 'CANCELED', 'CLOSED']);
const OPEN_QUOTE = new Set(['DRAFT', 'SUBMITTED', 'APPROVED', 'SENT', 'PENDING', 'OPEN']);

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName?: string, email?: string): string {
  const part = fullName?.trim().split(/\s+/)[0];
  if (part) return part;
  if (email?.includes('@')) return email.split('@')[0] ?? 'there';
  return 'there';
}

export function formatPortalDate(now = new Date()): string {
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
  const date = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  return `${weekday}, ${date}`;
}

export function formatShortDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function compactMoney(value?: number, currency = 'AED'): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${currency} ${(value / 1_000).toFixed(1)}k`;
  return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function isActiveShipment(status?: string): boolean {
  if (!status) return true;
  return !TERMINAL_SHIPMENT.has(status.toUpperCase().replace(/\s+/g, '_'));
}

export function isCustomsHold(status?: string): boolean {
  if (!status) return false;
  const s = status.toUpperCase();
  return s.includes('CUSTOMS') || s.includes('HOLD');
}

export function isDocsPending(status?: string): boolean {
  if (!status) return false;
  const s = status.toUpperCase();
  return s.includes('DOC') || s.includes('DOCUMENT');
}

export function isOpenQuote(status?: string): boolean {
  if (!status) return true;
  return OPEN_QUOTE.has(status.toUpperCase().replace(/\s+/g, '_'));
}

export function shipmentMode(jobType?: string): 'Air' | 'Sea' | 'Land' | 'Other' {
  const j = (jobType ?? '').toUpperCase();
  if (j.includes('AIR')) return 'Air';
  if (j.includes('SEA') || j.includes('FCL') || j.includes('LCL')) return 'Sea';
  if (j.includes('LAND') || j.includes('ROAD') || j.includes('TRUCK')) return 'Land';
  return 'Other';
}

export function quoteAmount(item: PortalQuotationListItem): number | undefined {
  const raw = item.raw ?? {};
  const total =
    raw.total_amount ?? raw.totalAmount ?? raw.grand_total ?? raw.grandTotal ?? raw.amount;
  return typeof total === 'number' && Number.isFinite(total) ? total : undefined;
}

export function quoteCurrency(item: PortalQuotationListItem): string {
  return item.currencyCode ?? 'AED';
}

export function inPeriod(value: string | undefined, period: PortalDashboardPeriod): boolean {
  if (!value) return period === 'month';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();
  if (period === 'today') {
    return d.toDateString() === now.toDateString();
  }
  if (period === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }
  const monthAgo = new Date(now);
  monthAgo.setMonth(now.getMonth() - 1);
  return d >= monthAgo;
}

export function statusTone(status?: string): 'info' | 'warning' | 'success' | 'cyan' | 'neutral' {
  const s = (status ?? '').toUpperCase();
  if (s.includes('HOLD')) return 'warning';
  if (s.includes('CONFIRM')) return 'cyan';
  if (s.includes('TRANSIT')) return 'info';
  if (s.includes('PENDING') || s.includes('DELIVERED') || s.includes('COMPLETED')) return 'success';
  return 'neutral';
}

export function formatStatusLabel(status?: string): string {
  if (!status) return '—';
  return status.replaceAll('_', ' ');
}

export interface PortalTaskItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}

export function buildPortalTasks(
  shipments: PortalShipmentListItem[],
  quotes: PortalQuotationListItem[],
): PortalTaskItem[] {
  const tasks: PortalTaskItem[] = [];

  for (const s of shipments.filter((item) => isCustomsHold(item.status)).slice(0, 1)) {
    tasks.push({
      id: `customs-${s.id}`,
      label: `Confirm delivery address for ${s.reference}`,
      done: false,
      href: `/portal/shipments/${s.id}`,
    });
  }

  for (const s of shipments.filter((item) => isDocsPending(item.status)).slice(0, 1)) {
    tasks.push({
      id: `docs-${s.id}`,
      label: `Upload commercial invoice for ${s.reference}`,
      done: true,
      href: `/portal/shipments/${s.id}`,
    });
  }

  for (const q of quotes.filter((item) => isOpenQuote(item.status)).slice(0, 2)) {
    tasks.push({
      id: `quote-${q.id}`,
      label: `Approve quotation ${q.number}`,
      done: false,
      href: `/portal/quotes/${q.id}`,
    });
  }

  return tasks.slice(0, 5);
}
