import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type { PortalNotification, PortalNotificationListResult } from '../types/portalNotifications.types';

export function normalizePortalNotification(raw: unknown): PortalNotification | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt) || null;
  const isRead = pickBoolean(r.is_read, r.isRead, r.read) ?? Boolean(readAt);
  return {
    id,
    title: pickString(r.title, r.subject, r.message) || 'Notification',
    body: pickString(r.body, r.content, r.description) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readAt,
    isRead,
    type: pickString(r.type, r.notification_type) || undefined,
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
