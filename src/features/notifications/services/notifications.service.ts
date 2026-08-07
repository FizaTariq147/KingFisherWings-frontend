import { axiosInstance } from '@/lib/axios';
import { NOTIFICATIONS_API } from '../api/notifications.api';
import type { NotificationListParams, NotificationListResult } from '../types/notifications.types';
import { normalizeNotificationList, normalizeUnreadCount } from '../utils/normalizeNotifications';

export const notificationsService = {
  async list(params: NotificationListParams = {}): Promise<NotificationListResult> {
    const res = await axiosInstance.get(NOTIFICATIONS_API.list, { params });
    return normalizeNotificationList(res.data, params);
  },
  async unreadCount(): Promise<number> {
    const res = await axiosInstance.get(NOTIFICATIONS_API.unreadCount);
    return normalizeUnreadCount(res.data);
  },
  async markRead(id: string): Promise<void> {
    await axiosInstance.post(NOTIFICATIONS_API.read(id));
  },
  async markAllRead(): Promise<void> {
    await axiosInstance.post(NOTIFICATIONS_API.readAll);
  },
};
