import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { PortalApiError } from '@/lib/portalApiClient';
import { portalQuotationsService } from '../services/portalQuotations.service';
import { fetchLocaleCurrencyForCountry } from '../utils/loadPortalCurrencyOptions';
import { fetchPortalPortOptions } from '../utils/loadPortalPortOptions';
import type {
  PortalQuotationListParams,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
  PortalQuotationEstimateDto,
  PortalQuotationCounterOfferDto,
} from '../types/portalQuotations.types';

export const portalQuotationKeys = {
  all: (scope: string) => ['portal', scope, 'quotations'] as const,
  summary: (scope: string) => [...portalQuotationKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalQuotationListParams) =>
    [...portalQuotationKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalQuotationKeys.all(scope), 'detail', id] as const,
  localeCurrency: (countryCode: string) =>
    ['portal', 'locale-currency', countryCode] as const,
  ports: (scope: string) => [...portalQuotationKeys.all(scope), 'reference', 'ports'] as const,
  serviceCatalog: (scope: string, jobType?: string) =>
    [...portalQuotationKeys.all(scope), 'service-catalog', jobType ?? 'all'] as const,
  negotiation: (scope: string, id: string) =>
    [...portalQuotationKeys.all(scope), 'negotiation', id] as const,
};

/** Port list for quote booking (portal reference API, not staff `/masters/*`). */
export function usePortalPortOptions(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalQuotationKeys.ports(scope),
    queryFn: async () => {
      try {
        return await fetchPortalPortOptions();
      } catch (err) {
        if (err instanceof PortalApiError && (err.status === 404 || err.status === 403)) {
          return [];
        }
        throw err;
      }
    },
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 10 * 60_000,
  });
}

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

export function useAcceptPortalQuotation() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (id: string) => portalQuotationsService.accept(id, {}),
    onSuccess: (q) => {
      void qc.invalidateQueries({ queryKey: portalQuotationKeys.all(scope) });
      if (scope !== 'anon' && q.id) {
        qc.setQueryData(portalQuotationKeys.detail(scope, q.id), q);
        void qc.invalidateQueries({ queryKey: portalQuotationKeys.negotiation(scope, q.id) });
      }
    },
  });
}

export function useRejectPortalQuotation() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PortalQuotationRejectDto }) =>
      portalQuotationsService.reject(id, dto),
    onSuccess: (q) => {
      void qc.invalidateQueries({ queryKey: portalQuotationKeys.all(scope) });
      if (scope !== 'anon' && q.id) {
        qc.setQueryData(portalQuotationKeys.detail(scope, q.id), q);
        void qc.invalidateQueries({ queryKey: portalQuotationKeys.negotiation(scope, q.id) });
      }
    },
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

export function usePortalServiceCatalog(jobType?: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalQuotationKeys.serviceCatalog(scope, jobType),
    queryFn: () => portalQuotationsService.serviceCatalog(jobType),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 5 * 60_000,
  });
}

export function usePortalQuotationEstimate() {
  return useMutation({
    mutationFn: (dto: PortalQuotationEstimateDto) => portalQuotationsService.estimate(dto),
  });
}

export function usePortalQuotationNegotiation(id: string, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalQuotationKeys.negotiation(scope, id),
    queryFn: () => portalQuotationsService.negotiation(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
  });
}

export function usePortalQuotationCounterOffer() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PortalQuotationCounterOfferDto }) =>
      portalQuotationsService.counterOffer(id, dto),
    onSuccess: (q) => {
      void qc.invalidateQueries({ queryKey: portalQuotationKeys.all(scope) });
      if (scope !== 'anon' && q.id) {
        qc.setQueryData(portalQuotationKeys.detail(scope, q.id), q);
        void qc.invalidateQueries({ queryKey: portalQuotationKeys.negotiation(scope, q.id) });
      }
    },
  });
}
