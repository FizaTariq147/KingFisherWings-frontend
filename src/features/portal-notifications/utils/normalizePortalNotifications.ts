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
  PortalNotification,
  PortalNotificationListResult,
  PortalNotificationOpenResult,
} from '../types/portalNotifications.types';

export function normalizePortalNotification(raw: unknown): PortalNotification | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt) || null;
  const isRead = pickBoolean(r.is_read, r.isRead, r.read) ?? Boolean(readAt);
  const linkPath =
    pickString(r.link_path, r.linkPath, r.href, r.link, r.url, r.action_url, r.actionUrl, r.path) ||
    null;
  return {
    id,
    title: pickString(r.title, r.subject, r.message) || 'Notification',
    body: pickString(r.body, r.content, r.description, r.message) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readAt,
    isRead,
    type: pickString(r.type, r.notification_type, r.kind, r.event) || undefined,
    kind: pickString(r.kind, r.notification_kind) || undefined,
    linkPath,
    href: linkPath,
    entityType: pickString(r.entity_type, r.entityType) || undefined,
    jobId: pickString(r.job_id, r.jobId) || undefined,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    quotationId: pickString(r.quotation_id, r.quotationId) || undefined,
    entityId: pickString(r.entity_id, r.entityId, r.resource_id, r.resourceId, r.ref_id, r.refId) || undefined,
    raw: r,
  };
}

export function normalizePortalNotificationOpen(raw: unknown): PortalNotificationOpenResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    id: pickString(d.id, d.notification_id) || '',
    linkPath: pickString(d.link_path, d.linkPath, d.href, d.link, d.path, d.url) || null,
    entityType: pickString(d.entity_type, d.entityType) || undefined,
    entityId: pickString(d.entity_id, d.entityId) || undefined,
    isRead: pickBoolean(d.is_read, d.isRead, d.read) ?? true,
    title: pickString(d.title, d.subject) || undefined,
    message: pickString(d.message, d.body, d.content) || undefined,
  };
}

export function normalizePortalNotificationList(raw: unknown, params: { page?: number; limit?: number }): PortalNotificationListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'notifications', 'data']);
  const normalized = items.map(normalizePortalNotification).filter((x): x is PortalNotification => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeUnreadCount(raw: unknown): number {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return pickNumber(d.count, d.unread, d.unread_count, d.unreadCount, typeof raw === 'number' ? raw : undefined) ?? 0;
}
