import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  PortalMessage,
  PortalMessageListResult,
  PortalMessageReply,
} from '../types/portalMessages.types';

export function normalizePortalMessageReply(raw: unknown): PortalMessageReply | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id) || Math.random().toString(36).slice(2);
  const body = pickString(r.body, r.message, r.content);
  if (!body) return null;
  return {
    id,
    body,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    authorType: pickString(r.author_type, r.authorType, r.sender_type, r.role) || undefined,
    authorName: pickString(r.author_name, r.authorName, r.sender_name, r.from_name) || undefined,
  };
}

export function normalizePortalMessage(raw: unknown): PortalMessage | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  const repliesRaw = Array.isArray(r.replies)
    ? r.replies
    : Array.isArray(asRecord(r.thread)?.replies)
      ? (asRecord(r.thread)?.replies as unknown[])
      : [];
  return {
    id,
    subject: pickString(r.subject, r.title) || 'Message',
    body: pickString(r.body, r.message, r.content) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readByStaff: pickBoolean(r.read_by_staff, r.readByStaff, r.is_read, r.isRead),
    jobId: pickString(r.job_id, r.jobId) || undefined,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    attachmentName:
      pickString(r.attachment_name, r.attachmentName, r.file_name, r.filename, r.original_name) ||
      undefined,
    hasAttachment:
      pickBoolean(r.has_attachment, r.hasAttachment) ??
      Boolean(
        pickString(
          r.attachment_name,
          r.attachmentName,
          r.attachment_url,
          r.file_name,
          r.filename,
          r.file_url,
        ),
      ),
    senderName:
      pickString(
        r.sender_name,
        r.senderName,
        r.created_by_name,
        r.author_name,
        asRecord(r.sender)?.full_name,
        asRecord(r.sender)?.name,
      ) || undefined,
    senderEmail:
      pickString(r.sender_email, r.senderEmail, r.email, asRecord(r.sender)?.email) || undefined,
    partyName:
      pickString(r.party_name, r.partyName, asRecord(r.party)?.name) || undefined,
    replies: repliesRaw
      .map(normalizePortalMessageReply)
      .filter((x): x is PortalMessageReply => Boolean(x)),
  };
}

export function normalizePortalMessageList(
  raw: unknown,
  params: { page?: number; limit?: number },
): PortalMessageListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'messages', 'data']);
  const normalized = items
    .map(normalizePortalMessage)
    .filter((x): x is PortalMessage => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizePortalMessageDetail(raw: unknown): PortalMessage | null {
  return normalizePortalMessage(asRecord(unwrapData(raw)) ?? raw);
}
