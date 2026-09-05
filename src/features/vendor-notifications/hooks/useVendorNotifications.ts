import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorNotificationsService } from '../services/vendorNotifications.service';
import type { VendorNotificationListParams } from '../types/vendorNotifications.types';

export const vendorNotificationKeys = {
  all: (scope: string) => ['vendor', scope, 'notifications'] as const,
  list: (scope: string, params: VendorNotificationListParams) =>
    [...vendorNotificationKeys.all(scope), 'list', params] as const,
  unread: (scope: string) => [...vendorNotificationKeys.all(scope), 'unread'] as const,
};

export function useVendorNotifications(params: VendorNotificationListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorNotificationKeys.list(scope, params),
    queryFn: () => vendorNotificationsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useVendorNotificationUnreadCount() {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorNotificationKeys.unread(scope),
    queryFn: () => vendorNotificationsService.unreadCount(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useMarkVendorNotificationRead() {
  const qc = useQueryClient();
  const scope = useVendorQueryScope();
  return useMutation({
    mutationFn: (id: string) => vendorNotificationsService.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vendorNotificationKeys.all(scope) });
    },
  });
}

export function useMarkAllVendorNotificationsRead() {
  const qc = useQueryClient();
  const scope = useVendorQueryScope();
  return useMutation({
    mutationFn: () => vendorNotificationsService.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vendorNotificationKeys.all(scope) });
    },
  });
}
