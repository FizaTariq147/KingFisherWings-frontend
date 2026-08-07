import { useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalCreditService } from '../services/portalCredit.service';

export const portalCreditKeys = {
  all: (scope: string) => ['portal', scope, 'credit'] as const,
  summary: (scope: string) => [...portalCreditKeys.all(scope), 'summary'] as const,
  aging: (scope: string, asOf?: string) => [...portalCreditKeys.all(scope), 'aging', asOf ?? ''] as const,
  statement: (scope: string, asOf?: string) => [...portalCreditKeys.all(scope), 'statement', asOf ?? ''] as const,
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
  return useMutation({
    mutationFn: (asOf?: string) => portalCreditService.downloadStatementPdf(asOf),
  });
}
