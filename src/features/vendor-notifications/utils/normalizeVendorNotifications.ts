import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import type {
  VendorNotification,
  VendorNotificationListParams,
  VendorNotificationListResult,
} from '../types/vendorNotifications.types';

export function normalizeVendorNotification(raw: unknown): VendorNotification | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const id = pickString(data.id, data.notification_id, data.notificationId);
  if (!id) return null;
  const readAt = pickString(data.read_at, data.readAt) || null;
  const isRead =
    typeof data.is_read === 'boolean'
      ? data.is_read
      : typeof data.isRead === 'boolean'
        ? data.isRead
        : Boolean(readAt);
  return {
    id,
    title:
      pickString(data.title, data.subject, data.heading, data.message_title) ||
      'Notification',
    body: pickString(data.body, data.message, data.description, data.content) || undefined,
    createdAt: pickString(data.created_at, data.createdAt, data.sent_at, data.sentAt) || undefined,
    readAt,
    isRead,
    type: pickString(data.type, data.notification_type, data.kind, data.event) || undefined,
    jobId: pickString(data.job_id, data.jobId) || undefined,
    invoiceId: pickString(data.invoice_id, data.invoiceId) || undefined,
    entityId: pickString(data.entity_id, data.entityId, data.ref_id, data.refId) || undefined,
    raw: data,
  };
}

export function normalizeVendorNotificationList(
  raw: unknown,
  params: VendorNotificationListParams = {},
): VendorNotificationListResult {
  const { items, meta } = unwrapList(raw, [
    'items',
    'results',
    'notifications',
    'alerts',
    'data',
  ]);
  const normalized = items
    .map(normalizeVendorNotification)
    .filter((n): n is VendorNotification => Boolean(n));
  return {
    items: normalized,
    meta: normalizeMeta(meta, normalized.length, params),
  };
}

export function normalizeUnreadCount(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, raw);
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return 0;
  return Math.max(
    0,
    pickNumber(data.unread, data.unread_count, data.unreadCount, data.count, data.total) ?? 0,
  );
}
