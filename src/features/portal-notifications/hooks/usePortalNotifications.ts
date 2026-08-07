import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalNotificationsService } from '../services/portalNotifications.service';
import type { PortalNotificationListParams } from '../types/portalNotifications.types';

export const portalNotificationKeys = {
  all: (scope: string) => ['portal', scope, 'notifications'] as const,
  list: (scope: string, params: PortalNotificationListParams) => [...portalNotificationKeys.all(scope), 'list', params] as const,
  unread: (scope: string) => [...portalNotificationKeys.all(scope), 'unread'] as const,
};

export function usePortalNotifications(params: PortalNotificationListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalNotificationKeys.list(scope, params),
    queryFn: () => portalNotificationsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalNotificationUnreadCount() {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalNotificationKeys.unread(scope),
    queryFn: () => portalNotificationsService.unreadCount(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useMarkPortalNotificationRead() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (id: string) => portalNotificationsService.markRead(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalNotificationKeys.all(scope) }); },
  });
}

export function useMarkAllPortalNotificationsRead() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: () => portalNotificationsService.markAllRead(),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalNotificationKeys.all(scope) }); },
  });
}
