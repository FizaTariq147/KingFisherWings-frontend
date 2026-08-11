import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import type {
  VendorPaymentListItem,
  VendorPaymentListParams,
  VendorPaymentListResult,
} from '../types/vendorPayments.types';

export function normalizePaymentItem(raw: unknown): VendorPaymentListItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return {
    id,
    reference: pickString(r.reference, r.ref, r.payment_number, r.paymentNumber) || undefined,
    paymentDate: pickString(r.payment_date, r.paymentDate, r.date) || undefined,
    amount: pickNumber(r.amount, r.total, r.paid_amount),
    unallocatedAmount: pickNumber(
      r.unallocated_amount,
      r.unallocatedAmount,
      r.unallocated,
      r.advance_balance,
    ),
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    method: pickString(r.method, r.payment_method, r.paymentMethod) || undefined,
    status: pickString(r.status) || undefined,
  };
}

export function normalizePaymentList(
  raw: unknown,
  params: VendorPaymentListParams,
  keys: string[],
): VendorPaymentListResult {
  const { items, meta } = unwrapList(raw, keys);
  const normalized = items
    .map(normalizePaymentItem)
    .filter((x): x is VendorPaymentListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
