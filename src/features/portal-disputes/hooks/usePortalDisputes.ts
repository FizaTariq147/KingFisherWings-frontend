import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalDisputesService } from '../services/portalDisputes.service';
import type { PortalDisputeCreateDto, PortalDisputeListParams } from '../types/portalDisputes.types';

export const portalDisputeKeys = {
  all: (scope: string) => ['portal', scope, 'disputes'] as const,
  list: (scope: string, params: PortalDisputeListParams) => [...portalDisputeKeys.all(scope), 'list', params] as const,
};

export function usePortalDisputes(params: PortalDisputeListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalDisputeKeys.list(scope, params),
    queryFn: () => portalDisputesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useCreatePortalDispute() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalDisputeCreateDto) => portalDisputesService.create(dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalDisputeKeys.all(scope) }); },
  });
}
