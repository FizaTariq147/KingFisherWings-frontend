import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  AdminCreditLimitRequest,
  AdminPortalDispute,
  AdminPortalMessage,
  AdminPortalMessageListResult,
  AdminPortalMessageReply,
} from '../types/portalAdminInbox.types';

export function normalizeAdminMessageReply(raw: unknown): AdminPortalMessageReply | null {
  const r = asRecord(raw);
  if (!r) return null;
  const body = pickString(r.body, r.message, r.content);
  if (!body) return null;
  return {
    id: pickString(r.id) || Math.random().toString(36).slice(2),
    body,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    authorType: pickString(r.author_type, r.authorType, r.sender_type, r.role) || undefined,
    authorName: pickString(r.author_name, r.authorName, r.sender_name) || undefined,
  };
}

export function normalizeAdminMessage(raw: unknown): AdminPortalMessage | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt, r.staff_read_at);
  const repliesRaw = Array.isArray(r.replies) ? r.replies : [];
  return {
    id,
    subject: pickString(r.subject, r.title) || 'Message',
    body: pickString(r.body, r.message) || undefined,
    partyId: pickString(r.party_id, r.partyId) || undefined,
    partyName: pickString(r.party_name, r.partyName, asRecord(r.party)?.name) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    isRead: pickBoolean(r.is_read, r.isRead, r.read_by_staff) ?? Boolean(readAt),
    senderEmail: pickString(r.sender_email, r.email, r.from_email) || undefined,
    replies: repliesRaw
      .map(normalizeAdminMessageReply)
      .filter((x): x is AdminPortalMessageReply => Boolean(x)),
  };
}

export function normalizeAdminMessageList(raw: unknown, params: { page?: number; limit?: number }): AdminPortalMessageListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'messages', 'data']);
  const normalized = items.map(normalizeAdminMessage).filter((x): x is AdminPortalMessage => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeAdminDispute(raw: unknown): AdminPortalDispute | null {
  const r = asRecord(raw);
  if (!r) return null;
  const party = asRecord(r.party);
  const invoice = asRecord(r.invoice);
  const id =
    pickString(r.id) ||
    (typeof r.id === 'number' && Number.isFinite(r.id) ? String(r.id) : '');
  if (!id) return null;
  return {
    id,
    invoiceId:
      pickString(r.invoice_id, r.invoiceId, invoice?.id) ||
      (typeof r.invoice_id === 'number' ? String(r.invoice_id) : undefined),
    invoiceNumber:
      pickString(r.invoice_number, r.invoiceNumber, invoice?.invoice_number, invoice?.number) ||
      undefined,
    partyId: pickString(r.party_id, r.partyId, party?.id) || undefined,
    partyName: pickString(r.party_name, r.partyName, party?.name) || undefined,
    reason: pickString(r.reason) || undefined,
    description: pickString(r.description) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    staffNotes: pickString(r.staff_notes, r.staffNotes) || undefined,
  };
}

export function normalizeAdminDisputes(raw: unknown): AdminPortalDispute[] {
  // Support: [], { data: [] }, { data: { items|disputes|results: [] } }, { items|disputes: [] }
  const direct = unwrapList(raw, ['items', 'results', 'disputes', 'data']);
  let list = direct.items;

  if (!list.length) {
    const unwrapped = unwrapData(raw);
    if (Array.isArray(unwrapped)) {
      list = unwrapped;
    } else {
      const nested = asRecord(unwrapped);
      const nestedList =
        (Array.isArray(nested?.items) && nested.items) ||
        (Array.isArray(nested?.disputes) && nested.disputes) ||
        (Array.isArray(nested?.results) && nested.results) ||
        [];
      list = nestedList as unknown[];
    }
  }

  return list
    .map(normalizeAdminDispute)
    .filter((x): x is AdminPortalDispute => Boolean(x));
}

export function normalizeAdminCreditRequest(raw: unknown): AdminCreditLimitRequest | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    partyId: pickString(r.party_id, r.partyId) || undefined,
    partyName: pickString(r.party_name, r.partyName, asRecord(r.party)?.name) || undefined,
    requestedLimit: pickNumber(r.requested_limit, r.requestedLimit),
    justification: pickString(r.justification) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    reviewNotes: pickString(r.review_notes, r.reviewNotes) || undefined,
    approvedLimit: pickNumber(r.approved_limit, r.approvedLimit),
  };
}

export function normalizeAdminCreditRequests(raw: unknown): AdminCreditLimitRequest[] {
  const { items } = unwrapList(raw, ['items', 'results', 'requests', 'data']);
  const unwrapped = unwrapData(raw);
  const list = items.length ? items : Array.isArray(unwrapped) ? unwrapped : [];
  return list.map(normalizeAdminCreditRequest).filter((x): x is AdminCreditLimitRequest => Boolean(x));
}
