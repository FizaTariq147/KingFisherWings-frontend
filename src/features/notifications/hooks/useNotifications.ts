import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import type { NotificationListParams } from '../types/notifications.types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationListParams) => [...notificationKeys.all, 'list', params] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.list(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsService.unreadCount(),
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: notificationKeys.all }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: notificationKeys.all }); },
  });
}
