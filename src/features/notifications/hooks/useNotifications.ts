import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import type {
  NotificationListParams,
  NotificationListResult,
} from '../types/notifications.types';
import {
  filterNotificationsForViewer,
  type NotificationViewerContext,
} from '../utils/notificationAudience';
import { useNotificationViewer } from './useNotificationViewer';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationListParams, viewerKey: string) =>
    [...notificationKeys.all, 'list', params, viewerKey] as const,
  unread: (viewerKey: string) => [...notificationKeys.all, 'unread', viewerKey] as const,
};

function viewerCacheKey(viewer: NotificationViewerContext): string {
  return [
    viewer.isTenantManager ? 'mgr' : 'staff',
    viewer.userId || '',
    viewer.roleSlug || '',
    viewer.permissions.join(','),
  ].join('|');
}

function applyViewerScope(
  result: NotificationListResult,
  viewer: NotificationViewerContext,
): NotificationListResult {
  const items = filterNotificationsForViewer(result.items, viewer);
  return {
    items,
    meta: {
      ...result.meta,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / Math.max(result.meta.limit || 20, 1))),
    },
  };
}

function scopeListParams(
  params: NotificationListParams,
  viewer: NotificationViewerContext,
): NotificationListParams {
  // Ask BE to scope when it supports these query keys (harmless if ignored).
  return {
    ...params,
    ...(viewer.userId ? { for_user_id: viewer.userId } : {}),
    ...(viewer.roleSlug ? { role: viewer.roleSlug } : {}),
    audience: viewer.isTenantManager ? 'tenant_manager' : 'staff',
  };
}

export function useNotifications(params: NotificationListParams) {
  const viewer = useNotificationViewer();
  const viewerKey = viewerCacheKey(viewer);
  const scopedParams = scopeListParams(params, viewer);

  return useQuery({
    queryKey: notificationKeys.list(scopedParams, viewerKey),
    queryFn: async () => {
      const raw = await notificationsService.list(scopedParams);
      return applyViewerScope(raw, viewer);
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationUnreadCount(enabled = true) {
  const viewer = useNotificationViewer();
  const viewerKey = viewerCacheKey(viewer);

  return useQuery({
    queryKey: notificationKeys.unread(viewerKey),
    queryFn: async () => {
      const scoped = scopeListParams(
        { page: 1, limit: 100, unread_only: true },
        viewer,
      );
      // Prefer a scoped unread sample so badge matches filtered inbox.
      // Falls back to API count when the sample could not be loaded.
      try {
        const list = await notificationsService.list(scoped, { skipErrorToast: true });
        const visible = filterNotificationsForViewer(list.items, viewer);
        const apiCount = await notificationsService.unreadCount().catch(() => visible.length);
        // If the feed was already per-user (nothing hidden), trust API total.
        if (visible.length === list.items.length) return apiCount;
        // Client-hidden rows → badge from visible unread (sample cap 100).
        return visible.filter((n) => !n.isRead).length;
      } catch {
        return notificationsService.unreadCount();
      }
    },
    enabled,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    refetchInterval: enabled ? 30_000 : false,
    refetchOnWindowFocus: enabled,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useOpenNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.open(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
