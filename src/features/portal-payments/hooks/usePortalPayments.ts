import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalPaymentsService } from '../services/portalPayments.service';
import type { PortalPaymentListParams } from '../types/portalPayments.types';

export const portalPaymentKeys = {
  all: (scope: string) => ['portal', scope, 'payments'] as const,
  list: (scope: string, params: PortalPaymentListParams) => [...portalPaymentKeys.all(scope), 'list', params] as const,
};

export function usePortalPayments(params: PortalPaymentListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.list(scope, params),
    queryFn: () => portalPaymentsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
