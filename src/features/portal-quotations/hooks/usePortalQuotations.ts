import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalQuotationsService } from '../services/portalQuotations.service';
import { fetchLocaleCurrencyForCountry } from '../utils/loadPortalCurrencyOptions';
import type {
  PortalQuotationListParams,
  PortalQuotationRequestDto,
} from '../types/portalQuotations.types';

export const portalQuotationKeys = {
  all: (scope: string) => ['portal', scope, 'quotations'] as const,
  summary: (scope: string) => [...portalQuotationKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalQuotationListParams) =>
    [...portalQuotationKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalQuotationKeys.all(scope), 'detail', id] as const,
  localeCurrency: (countryCode: string) =>
    ['portal', 'locale-currency', countryCode] as const,
};

/** Public locale currency for a country (not staff masters). */
export function usePortalLocaleCurrency(countryCode: string) {
  const cc = countryCode.trim().toUpperCase();
  return useQuery({
    queryKey: portalQuotationKeys.localeCurrency(cc || 'none'),
    queryFn: () => fetchLocaleCurrencyForCountry(cc),
    enabled: /^[A-Z]{2}$/.test(cc),
    staleTime: 60 * 60_000,
  });
}

export function usePortalQuotationSummary(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalQuotationKeys.summary(scope),
    queryFn: () => portalQuotationsService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalQuotations(params: PortalQuotationListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalQuotationKeys.list(scope, params),
    queryFn: () => portalQuotationsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalQuotation(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalQuotationKeys.detail(scope, id),
    queryFn: () => portalQuotationsService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useRequestPortalQuotation() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalQuotationRequestDto) => portalQuotationsService.request(dto),
    onSuccess: (q) => {
      void qc.invalidateQueries({ queryKey: portalQuotationKeys.all(scope) });
      if (scope !== 'anon' && q.id && q.id !== 'new') {
        qc.setQueryData(portalQuotationKeys.detail(scope, q.id), q);
      }
    },
  });
}
