import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalPaymentsService } from '../services/portalPayments.service';
import type { PortalPaymentListParams } from '../types/portalPayments.types';

export const portalPaymentKeys = {
  all: (scope: string) => ['portal', scope, 'payments'] as const,
  list: (scope: string, params: PortalPaymentListParams) => [...portalPaymentKeys.all(scope), 'list', params] as const,
  summary: (scope: string) => [...portalPaymentKeys.all(scope), 'summary'] as const,
  onlineList: (scope: string, params: PortalPaymentListParams) =>
    [...portalPaymentKeys.all(scope), 'online', params] as const,
  onlineDetail: (scope: string, id: string) =>
    [...portalPaymentKeys.all(scope), 'online', id] as const,
  stripeConfig: (scope: string) => [...portalPaymentKeys.all(scope), 'stripe-config'] as const,
};

export function usePortalPaymentsSummary(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.summary(scope),
    queryFn: () => portalPaymentsService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalPayments(params: PortalPaymentListParams, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.list(scope, params),
    queryFn: () => portalPaymentsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon' && enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalOnlinePayments(params: PortalPaymentListParams, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.onlineList(scope, params),
    queryFn: () => portalPaymentsService.listOnline(params),
    enabled: Boolean(accessToken) && scope !== 'anon' && enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalOnlinePayment(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.onlineDetail(scope, id),
    queryFn: () => portalPaymentsService.getOnline(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
  });
}

export function useCancelPortalPayment() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
      portalPaymentsService.cancel(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: portalPaymentKeys.onlineDetail(scope, id) });
      void qc.invalidateQueries({ queryKey: portalPaymentKeys.all(scope) });
    },
  });
}

export function useRetryPortalPayment() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
      portalPaymentsService.retry(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: portalPaymentKeys.onlineDetail(scope, id) });
      void qc.invalidateQueries({ queryKey: portalPaymentKeys.all(scope) });
    },
  });
}

export function usePortalPaymentsStripeConfig(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.stripeConfig(scope),
    queryFn: () => portalPaymentsService.getStripeConfig(),
    enabled: Boolean(accessToken) && scope !== 'anon' && enabled,
  });
}
