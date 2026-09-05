import { useMutation, useQuery } from '@tanstack/react-query';
import { usePortalBrand } from '@/features/portal-auth/hooks/usePortalBrand';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { portalCreditService } from '../services/portalCredit.service';

export const portalCreditKeys = {
  all: (scope: string) => ['portal', scope, 'credit'] as const,
  summary: (scope: string) => [...portalCreditKeys.all(scope), 'summary'] as const,
  aging: (scope: string, asOf?: string) =>
    [...portalCreditKeys.all(scope), 'aging', asOf ?? ''] as const,
  statement: (scope: string, asOf?: string) =>
    [...portalCreditKeys.all(scope), 'statement', asOf ?? ''] as const,
};

export function usePortalCreditSummary() {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditKeys.summary(scope),
    queryFn: () => portalCreditService.summary(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalCreditAging(asOf?: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditKeys.aging(scope, asOf),
    queryFn: () => portalCreditService.aging(asOf),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalCreditStatement(asOf?: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditKeys.statement(scope, asOf),
    queryFn: () => portalCreditService.statement(asOf),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useDownloadPortalStatementPdf() {
  const { companyName } = usePortalBrand();
  const user = usePortalAuthStore((s) => s.user);
  const partyName = user?.party?.name?.trim() || user?.fullName?.trim() || undefined;
  return useMutation({
    mutationFn: (asOf?: string) =>
      portalCreditService.downloadStatementPdf(asOf, { companyName, partyName }),
  });
}
