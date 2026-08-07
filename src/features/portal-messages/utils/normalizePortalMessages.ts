import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickString,
  unwrapList
} from '@/features/portal-shared/normalize';
import type { PortalMessage, PortalMessageListResult } from '../types/portalMessages.types';

export function normalizePortalMessage(raw: unknown): PortalMessage | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    subject: pickString(r.subject, r.title) || 'Message',
    body: pickString(r.body, r.message, r.content) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readByStaff: pickBoolean(r.read_by_staff, r.readByStaff, r.is_read, r.isRead),
    jobId: pickString(r.job_id, r.jobId) || undefined,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
  };
}

export function normalizePortalMessageList(raw: unknown, params: { page?: number; limit?: number }): PortalMessageListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'messages', 'data']);
  const normalized = items.map(normalizePortalMessage).filter((x): x is PortalMessage => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
