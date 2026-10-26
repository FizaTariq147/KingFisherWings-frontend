import { axiosInstance } from '@/lib/axios';
import { NOTIFICATIONS_API } from '../api/notifications.api';
import type {
  NotificationListParams,
  NotificationListResult,
  NotificationOpenResult,
} from '../types/notifications.types';
import {
  normalizeNotificationList,
  normalizeNotificationOpen,
  normalizeUnreadCount,
} from '../utils/normalizeNotifications';

export const notificationsService = {
  async list(
    params: NotificationListParams = {},
    opts?: { skipErrorToast?: boolean },
  ): Promise<NotificationListResult> {
    const res = await axiosInstance.get(NOTIFICATIONS_API.list, {
      params,
      ...(opts?.skipErrorToast ? { skipErrorToast: true } : {}),
    });
    return normalizeNotificationList(res.data, params);
  },
  async unreadCount(): Promise<number> {
    const res = await axiosInstance.get(NOTIFICATIONS_API.unreadCount, {
      skipErrorToast: true,
    });
    return normalizeUnreadCount(res.data);
  },
  async markRead(id: string): Promise<void> {
    await axiosInstance.post(NOTIFICATIONS_API.read(id));
  },
  async markAllRead(): Promise<void> {
    await axiosInstance.post(NOTIFICATIONS_API.readAll);
  },
  /** POST /notifications/:id/open — mark read + return `link_path` for navigation. */
  async open(id: string): Promise<NotificationOpenResult> {
    const res = await axiosInstance.post(NOTIFICATIONS_API.open(id));
    return normalizeNotificationOpen(res.data);
  },
};
