import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorPaymentRequestsService } from '../services/vendorPaymentRequests.service';
import type { VendorPaymentRequestListParams } from '../types/vendorPaymentRequests.types';

export const vendorPaymentRequestKeys = {
  all: (scope: string) => ['vendor', scope, 'payment-requests'] as const,
  list: (scope: string, params: VendorPaymentRequestListParams) =>
    [...vendorPaymentRequestKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...vendorPaymentRequestKeys.all(scope), 'detail', id] as const,
};

export function useVendorPaymentRequests(params: VendorPaymentRequestListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPaymentRequestKeys.list(scope, params),
    queryFn: () => vendorPaymentRequestsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useVendorPaymentRequest(id: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPaymentRequestKeys.detail(scope, id),
    queryFn: () => vendorPaymentRequestsService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
  });
}
