import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorPaymentRequestsService } from '../services/vendorPaymentRequests.service';
import type { VendorPaymentRequestListParams } from '../types/vendorPaymentRequests.types';

export function useVendorPaymentRequests(params: VendorPaymentRequestListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: ['vendor', scope, 'payment-requests', params] as const,
    queryFn: () => vendorPaymentRequestsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
