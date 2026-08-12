import { asRecord, pickString, unwrapData, unwrapList } from '@/features/portal-shared/normalize';
import type { AdminVendorDispute } from '../types/vendorAdminDisputes.types';

export function normalizeAdminVendorDispute(raw: unknown): AdminVendorDispute | null {
  const r = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  const party = asRecord(r.party);
  return {
    id,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    invoiceNumber: pickString(r.invoice_number, r.invoiceNumber) || undefined,
    partyId: pickString(r.party_id, r.partyId, party?.id) || undefined,
    partyName: pickString(r.party_name, r.partyName, party?.name) || undefined,
    reason: pickString(r.reason) || undefined,
    description: pickString(r.description) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    staffNotes: pickString(r.staff_notes, r.staffNotes) || undefined,
  };
}

export function normalizeAdminVendorDisputes(raw: unknown): AdminVendorDispute[] {
  const { items } = unwrapList(raw, ['items', 'results', 'disputes', 'data']);
  if (items.length) {
    return items
      .map(normalizeAdminVendorDispute)
      .filter((x): x is AdminVendorDispute => Boolean(x));
  }
  const single = normalizeAdminVendorDispute(raw);
  return single ? [single] : [];
}
