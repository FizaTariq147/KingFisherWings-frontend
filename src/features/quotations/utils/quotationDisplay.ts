import { buildPortLookup, resolvePortLabel } from '@/features/customers/utils/customerMasterLookup';
import { isUuid } from '@/lib/isUuid';
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

/** Format one side of a route as `CODE — Name` when possible. */
export function formatQuotationPortSide(
  code?: string,
  name?: string,
  id?: string,
  portMap?: PortLabelMap,
): string {
  const trimmedCode = code?.trim();
  const trimmedName = name?.trim();
  const codeOk = Boolean(trimmedCode && !isUuid(trimmedCode));
  const nameOk = Boolean(trimmedName && !isUuid(trimmedName));

  if (codeOk && nameOk && trimmedCode !== trimmedName) {
    return `${trimmedCode} — ${trimmedName}`;
  }
  if (codeOk) return trimmedCode!;
  if (nameOk) return trimmedName!;

  const fromMap = resolvePortLabel(undefined, id, portMap ?? new Map());
  return fromMap === '—' ? '' : fromMap;
}

/**
 * Parse customer-typed route lines stored on portal enquiries when port IDs
 * were missing or when the typed labels were persisted for display.
 */
export function parseCustomerRouteFromNotes(text?: string): {
  origin?: string;
  dest?: string;
} {
  if (!text?.trim()) return {};

  const customerRoute = text.match(
    /Customer route:\s*([^\n→\-]+?)\s*(?:→|->|–|-)\s*([^\n]+)/i,
  );
  if (customerRoute) {
    const origin = customerRoute[1]?.trim();
    const dest = customerRoute[2]?.trim();
    return {
      origin: origin && origin !== '—' ? origin : undefined,
      dest: dest && dest !== '—' ? dest : undefined,
    };
  }

  const origin =
    text.match(/Origin port:\s*([^\n;]+)/i)?.[1]?.trim() || undefined;
  const dest =
    text.match(/Destination port:\s*([^\n;]+)/i)?.[1]?.trim() || undefined;
  return { origin, dest };
}

/**
 * Dynamic origin → destination for list/detail.
 * Uses API port fields first, then master lookup, then customer notes.
 */
export function quotationRouteLabel(q: Quotation, portMap?: PortLabelMap): string {
  const map = portMap ?? new Map();
  let origin = formatQuotationPortSide(
    q.origin_port_code,
    q.origin_port_name,
    q.origin_port_id,
    map,
  );
  let dest = formatQuotationPortSide(
    q.dest_port_code,
    q.dest_port_name,
    q.dest_port_id,
    map,
  );

  if (!origin || !dest) {
    const fromNotes = parseCustomerRouteFromNotes(q.special_requirements);
    if (!origin && fromNotes.origin) origin = fromNotes.origin;
    if (!dest && fromNotes.dest) dest = fromNotes.dest;
  }

  if (!origin && !dest) return '—';
  return `${origin || '—'} → ${dest || '—'}`;
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
