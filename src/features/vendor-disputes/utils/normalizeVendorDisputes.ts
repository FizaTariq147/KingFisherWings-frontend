import { asRecord, normalizeMeta, pickString, unwrapData, unwrapList } from '@/features/vendor-shared/normalize';
import type { VendorDispute, VendorDisputeListResult } from '../types/vendorDisputes.types';

export function normalizeVendorDispute(raw: unknown): VendorDispute | null {
  const r = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return {
    id,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    invoiceNumber: pickString(r.invoice_number, r.invoiceNumber) || undefined,
    reason: pickString(r.reason) || undefined,
    description: pickString(r.description) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
  };
}

export function normalizeVendorDisputeList(
  raw: unknown,
  params: { page?: number; limit?: number },
): VendorDisputeListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'disputes', 'data']);
  const normalized = items
    .map(normalizeVendorDispute)
    .filter((x): x is VendorDispute => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
