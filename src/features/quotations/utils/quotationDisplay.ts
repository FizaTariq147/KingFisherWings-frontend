import { buildPortLookup, resolvePortLabel } from '@/features/customers/utils/customerMasterLookup';
import type { MasterRecord } from '@/features/masters/types/master.types';
import type { Quotation } from '../types/quotation.types';
import { recalculateQuotationTotals } from './recalculateQuotationTotals';

export type PortLabelMap = Map<string, string>;

/** Build port id → display label from master records. */
export function buildPortLabelMap(ports: MasterRecord[]): PortLabelMap {
  return buildPortLookup(ports);
}

export function formatQuotationDate(value?: string): string {
  if (!value) return '—';
  const iso = value.includes('T') ? value.slice(0, 10) : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return value;
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function quotationRouteLabel(q: Quotation, portMap?: PortLabelMap): string {
  const map = portMap ?? new Map();
  const origin = resolvePortLabel(q.origin_port_code, q.origin_port_id, map);
  const dest = resolvePortLabel(q.dest_port_code, q.dest_port_id, map);
  if (origin === '—' && dest === '—') return '—';
  return `${origin} → ${dest}`;
}

export function quotationTotalAmount(q: Quotation): number | undefined {
  if (q.total_amount != null && Number.isFinite(q.total_amount)) return q.total_amount;

  if (q.revenue_total != null && Number.isFinite(q.revenue_total)) {
    const tax = q.tax_total ?? 0;
    const discount = q.discount_amount ?? 0;
    return Math.max(0, q.revenue_total + tax - discount);
  }

  if (q.subtotal != null && Number.isFinite(q.subtotal)) {
    const tax = q.tax_total ?? 0;
    const discount = q.discount_amount ?? 0;
    return Math.max(0, q.subtotal + tax - discount);
  }

  if (q.lines && q.lines.length > 0) {
    return recalculateQuotationTotals(q.lines, {
      discount_percent: q.discount_percent,
      discount_amount: q.discount_amount,
    }).totalAmount;
  }

  return undefined;
}

export function quotationTotalLabel(q: Quotation): string {
  const amount = quotationTotalAmount(q);
  if (amount == null) return '—';
  return `${q.currency_code} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function quotationCustomerLabel(
  q: Quotation,
  partyMap?: Map<string, string>,
): string {
  if (q.customer_name) return q.customer_name;
  if (q.customer_id && partyMap?.has(q.customer_id)) {
    return partyMap.get(q.customer_id)!;
  }
  return q.customer_id ? q.customer_id.slice(0, 8) : '—';
}
