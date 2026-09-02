import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorPaymentsService } from '../services/vendorPayments.service';
import type { VendorPaymentListParams } from '../types/vendorPayments.types';

export const vendorPaymentKeys = {
  all: (scope: string) => ['vendor', scope, 'payments'] as const,
  list: (scope: string, params: VendorPaymentListParams) =>
    [...vendorPaymentKeys.all(scope), 'list', params] as const,
  advances: (scope: string, params: VendorPaymentListParams) =>
    ['vendor', scope, 'advances', params] as const,
  summary: (scope: string) => [...vendorPaymentKeys.all(scope), 'summary'] as const,
};

export function useVendorPaymentsSummary(enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPaymentKeys.summary(scope),
    queryFn: () => vendorPaymentsService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
  });
}

export function useVendorPayments(params: VendorPaymentListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPaymentKeys.list(scope, params),
    queryFn: () => vendorPaymentsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useVendorAdvances(params: VendorPaymentListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPaymentKeys.advances(scope, params),
    queryFn: () => vendorPaymentsService.listAdvances(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useDownloadVendorRemittance() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      vendorPaymentsService.downloadRemittance(id, name || 'remittance.pdf'),
  });
}
