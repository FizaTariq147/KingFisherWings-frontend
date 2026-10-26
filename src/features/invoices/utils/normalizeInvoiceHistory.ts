import { asRecord, pickString, unwrapData, unwrapList } from '@/features/portal-shared/normalize';
import { actorNameFromRow, pickActorName } from '@/lib/pickActorName';
import type { InvoiceHistoryEntry } from '../types/invoice.types';

export function normalizeInvoiceHistoryEntry(raw: unknown): InvoiceHistoryEntry | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    pickString(r.id, r.audit_id, r.auditId, r.event_id) ||
    pickString(r.created_at, r.createdAt, r.at) ||
    Math.random().toString(36).slice(2);
  const actorRec = asRecord(r.actor);
  return {
    id,
    action: pickString(r.action, r.event, r.event_type, r.type, r.operation) || undefined,
    summary:
      pickString(r.summary, r.message, r.description, r.details, r.comment, r.comments) ||
      undefined,
    createdAt: pickString(r.created_at, r.createdAt, r.at, r.timestamp) || undefined,
    actorName:
      actorNameFromRow(r) ||
      pickActorName(actorRec) ||
      undefined,
    actorId: pickString(r.actor_id, r.actorId, actorRec?.id) || undefined,
    raw: r,
  };
}

export function normalizeInvoiceHistory(raw: unknown): InvoiceHistoryEntry[] {
  const unwrapped = unwrapData(raw);
  if (Array.isArray(unwrapped)) {
    return unwrapped
      .map(normalizeInvoiceHistoryEntry)
      .filter((x): x is InvoiceHistoryEntry => Boolean(x));
  }
  const { items } = unwrapList(raw, ['items', 'results', 'history', 'events', 'data']);
  return items
    .map(normalizeInvoiceHistoryEntry)
    .filter((x): x is InvoiceHistoryEntry => Boolean(x));
}
