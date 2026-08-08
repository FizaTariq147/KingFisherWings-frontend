import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickString,
  unwrapList
} from '@/features/portal-shared/normalize';
import type { PortalDispute, PortalDisputeListResult } from '../types/portalDisputes.types';

export function normalizePortalDispute(raw: unknown): PortalDispute | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    invoiceNumber: pickString(r.invoice_number, r.invoiceNumber) || undefined,
    reason: pickString(r.reason) || undefined,
    description: pickString(r.description) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    staffNotes: pickString(r.staff_notes, r.staffNotes) || undefined,
    hasAttachment:
      pickBoolean(r.has_attachment, r.hasAttachment) ??
      Boolean(pickString(r.attachment_name, r.attachmentName, r.attachment_url)),
  };
}

export function normalizePortalDisputeList(raw: unknown, params: { page?: number; limit?: number }): PortalDisputeListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'disputes', 'data']);
  const normalized = items.map(normalizePortalDispute).filter((x): x is PortalDispute => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
