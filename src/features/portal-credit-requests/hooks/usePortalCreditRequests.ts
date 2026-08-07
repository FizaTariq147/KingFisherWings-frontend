import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalCreditRequestsService } from '../services/portalCreditRequests.service';
import type { PortalCreditLimitRequestDto } from '../types/portalCreditRequests.types';

export const portalCreditRequestKeys = {
  all: (scope: string) => ['portal', scope, 'credit-requests'] as const,
  list: (scope: string) => [...portalCreditRequestKeys.all(scope), 'list'] as const,
};

export function usePortalCreditRequests() {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditRequestKeys.list(scope),
    queryFn: () => portalCreditRequestsService.list(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useCreatePortalCreditRequest() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalCreditLimitRequestDto) => portalCreditRequestsService.create(dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalCreditRequestKeys.all(scope) }); },
  });
}
