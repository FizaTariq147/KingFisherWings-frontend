import { asRecord, pickString, unwrapData, unwrapList } from '@/features/portal-shared/normalize';
import type { PartyHistoryEntry } from '../types/party.types';

function normalizePartyHistoryEntry(raw: unknown): PartyHistoryEntry | null {
  const record = asRecord(raw);
  if (!record) return null;

  const label =
    pickString(
      record.label,
      record.title,
      record.summary,
      record.description,
      record.reference,
      record.ref,
    ) || 'Activity';

  return {
    id: pickString(record.id, record.uuid) || undefined,
    type: pickString(record.type, record.kind, record.category) || undefined,
    label,
    reference:
      pickString(record.reference, record.ref, record.document_no, record.documentNo, record.number) ||
      undefined,
    date:
      pickString(record.date, record.occurred_at, record.occurredAt, record.created_at, record.createdAt) ||
      undefined,
    amount: typeof record.amount === 'number' ? record.amount : undefined,
    status: pickString(record.status) || undefined,
  };
}

export function normalizePartyHistory(raw: unknown): PartyHistoryEntry[] {
  const data = unwrapData(raw);
  if (Array.isArray(data)) {
    return data
      .map(normalizePartyHistoryEntry)
      .filter((entry): entry is PartyHistoryEntry => Boolean(entry));
  }

  const { items } = unwrapList(raw, ['items', 'results', 'history', 'entries', 'data']);
  return items
    .map(normalizePartyHistoryEntry)
    .filter((entry): entry is PartyHistoryEntry => Boolean(entry));
}
