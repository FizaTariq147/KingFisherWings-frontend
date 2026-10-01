import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapList
} from '@/features/portal-shared/normalize';
import { extractCheckoutUrl } from '@/features/platform-billing/utils/billingApiHelpers';
import type {
  PortalOnlinePaymentItem,
  PortalOnlinePaymentListResult,
  PortalPaymentListItem,
  PortalPaymentListResult,
} from '../types/portalPayments.types';

export function normalizePaymentItem(raw: unknown): PortalPaymentListItem | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    reference: pickString(r.reference_number, r.referenceNumber, r.reference, r.number) || undefined,
    paymentDate: pickString(r.payment_date, r.paymentDate, r.created_at) || undefined,
    amount: pickNumber(r.amount, r.total_amount, r.totalAmount),
    currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
    method: pickString(r.payment_method, r.paymentMethod, r.method) || undefined,
    status: pickString(r.status) || undefined,
    direction: pickString(r.direction) || undefined,
  };
}

export function normalizePaymentList(raw: unknown, params: { page?: number; limit?: number }): PortalPaymentListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payments', 'data']);
  const normalized = items.map(normalizePaymentItem).filter((x): x is PortalPaymentListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeOnlinePaymentItem(raw: unknown): PortalOnlinePaymentItem | null {
  const base = normalizePaymentItem(raw);
  const r = asRecord(raw);
  if (!base || !r) return null;
  return {
    ...base,
    checkoutUrl: extractCheckoutUrl(r) || undefined,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    raw: r,
  };
}

export function normalizeOnlinePaymentList(
  raw: unknown,
  params: { page?: number; limit?: number },
): PortalOnlinePaymentListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payments', 'data']);
  const normalized = items
    .map(normalizeOnlinePaymentItem)
    .filter((x): x is PortalOnlinePaymentItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
