import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import type {
  VendorPaymentRequest,
  VendorPaymentRequestListParams,
  VendorPaymentRequestListResult,
} from '../types/vendorPaymentRequests.types';

function normalizeItem(raw: unknown): VendorPaymentRequest | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return {
    id,
    number: pickString(r.request_number, r.number, r.ref) || undefined,
    status: pickString(r.status) || undefined,
    requestedAt: pickString(r.requested_at, r.created_at, r.date) || undefined,
    amount: pickNumber(r.amount, r.total),
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    notes: pickString(r.notes, r.remarks) || undefined,
  };
}

export function normalizePaymentRequestList(
  raw: unknown,
  params: VendorPaymentRequestListParams,
): VendorPaymentRequestListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payment_requests', 'data']);
  const normalized = items
    .map(normalizeItem)
    .filter((x): x is VendorPaymentRequest => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
