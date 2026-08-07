import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type { AppNotification, NotificationListResult } from '../types/notifications.types';

export function normalizeNotification(raw: unknown): AppNotification | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt) || null;
  return {
    id,
    title: pickString(r.title, r.subject, r.message) || 'Notification',
    body: pickString(r.body, r.content, r.description) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readAt,
    isRead: pickBoolean(r.is_read, r.isRead, r.read) ?? Boolean(readAt),
    type: pickString(r.type) || undefined,
  };
}

export function normalizeNotificationList(raw: unknown, params: { page?: number; limit?: number }): NotificationListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'notifications', 'data']);
  const normalized = items.map(normalizeNotification).filter((x): x is AppNotification => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeUnreadCount(raw: unknown): number {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return pickNumber(d.count, d.unread, d.unread_count, d.unreadCount, typeof raw === 'number' ? raw : undefined) ?? 0;
}
