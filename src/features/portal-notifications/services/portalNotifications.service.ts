import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_NOTIFICATIONS_API } from '../api/portalNotifications.api';import type {
  PortalNotificationListParams,
  PortalNotificationListResult,
} from '../types/portalNotifications.types';
import {
  normalizePortalNotificationList,
  normalizeUnreadCount,
} from '../utils/normalizePortalNotifications';

export const portalNotificationsService = {
  async list(
    params: PortalNotificationListParams = {},
    opts?: { skipErrorToast?: boolean },
  ): Promise<PortalNotificationListResult> {
    const res = await portalApiClient.get(PORTAL_NOTIFICATIONS_API.list, {
      params,
      ...(opts?.skipErrorToast ? { skipErrorToast: true } : {}),
    });
    return normalizePortalNotificationList(res.data, params);
  },
  async unreadCount(): Promise<number> {
    const res = await portalApiClient.get(PORTAL_NOTIFICATIONS_API.unreadCount, {
      skipErrorToast: true,
    });
    return normalizeUnreadCount(res.data);
  },
  async markRead(id: string): Promise<void> {
    await portalApiClient.post(PORTAL_NOTIFICATIONS_API.read(id));
  },
  async markAllRead(): Promise<void> {
    await portalApiClient.post(PORTAL_NOTIFICATIONS_API.readAll);
  },
  /**
   * SSE with bearer tokens in the query string is disabled — tokens would leak to logs/history.
   * Unread counts rely on polling ({@link usePortalNotificationUnreadCount} refetchInterval).
   */
  subscribeUnreadCount(_onCount: (count: number) => void): () => void {
    return () => undefined;
  },
};
