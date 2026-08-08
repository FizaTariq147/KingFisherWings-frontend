import { portalApiClient } from '@/lib/portalApiClient';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { PORTAL_NOTIFICATIONS_API } from '../api/portalNotifications.api';
import type {
  PortalNotificationListParams,
  PortalNotificationListResult,
} from '../types/portalNotifications.types';
import {
  normalizePortalNotificationList,
  normalizeUnreadCount,
} from '../utils/normalizePortalNotifications';

function streamUrl(accessToken: string): string {
  const base = String(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/backend',
  ).replace(/\/$/, '');
  const qs = new URLSearchParams({ access_token: accessToken });
  return `${base}${PORTAL_NOTIFICATIONS_API.stream}?${qs.toString()}`;
}

export const portalNotificationsService = {
  async list(params: PortalNotificationListParams = {}): Promise<PortalNotificationListResult> {
    const res = await portalApiClient.get(PORTAL_NOTIFICATIONS_API.list, { params });
    return normalizePortalNotificationList(res.data, params);
  },
  async unreadCount(): Promise<number> {
    const res = await portalApiClient.get(PORTAL_NOTIFICATIONS_API.unreadCount);
    return normalizeUnreadCount(res.data);
  },
  async markRead(id: string): Promise<void> {
    await portalApiClient.post(PORTAL_NOTIFICATIONS_API.read(id));
  },
  async markAllRead(): Promise<void> {
    await portalApiClient.post(PORTAL_NOTIFICATIONS_API.readAll);
  },
  /**
   * Opens SSE unread-count stream. Falls back silently if EventSource fails
   * (Bearer-only APIs often need token query; polling remains the safety net).
   */
  subscribeUnreadCount(onCount: (count: number) => void): () => void {
    const token = usePortalAuthStore.getState().accessToken;
    if (!token || typeof EventSource === 'undefined') return () => undefined;
    let closed = false;
    let es: EventSource | null = null;
    try {
      es = new EventSource(streamUrl(token));
      es.onmessage = (ev) => {
        if (closed) return;
        try {
          const parsed: unknown = JSON.parse(ev.data);
          onCount(normalizeUnreadCount(parsed));
        } catch {
          const n = Number(ev.data);
          if (Number.isFinite(n)) onCount(n);
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
      };
    } catch {
      return () => undefined;
    }
    return () => {
      closed = true;
      es?.close();
    };
  },
};
