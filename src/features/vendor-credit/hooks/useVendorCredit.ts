import { useMutation, useQuery } from '@tanstack/react-query';
import { useVendorBrand } from '@/features/vendor-auth/hooks/useVendorBrand';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorCreditService } from '../services/vendorCredit.service';

export function useVendorCreditAging(asOf?: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: ['vendor', scope, 'credit', 'aging', asOf ?? ''] as const,
    queryFn: () => vendorCreditService.aging(asOf),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorCreditStatement(asOf?: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: ['vendor', scope, 'credit', 'statement', asOf ?? ''] as const,
    queryFn: () => vendorCreditService.statement(asOf),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useDownloadVendorStatementPdf() {
  const { companyName } = useVendorBrand();
  const user = useVendorAuthStore((s) => s.user);
  const partyName = user?.party?.name?.trim() || user?.fullName?.trim() || undefined;
  return useMutation({
    mutationFn: (asOf?: string) =>
      vendorCreditService.downloadStatementPdf(asOf, { companyName, partyName }),
  });
}
