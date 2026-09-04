import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { PortalApiError } from '@/lib/portalApiClient';
import { portalQuotationsService } from '../services/portalQuotations.service';
import { fetchLocaleCurrencyForCountry } from '../utils/loadPortalCurrencyOptions';
import {
  fetchPortalAirportOptions,
  fetchPortalPortOptions,
} from '../utils/loadPortalPortOptions';
import type {
  PortalQuotationDetail,
  PortalQuotationListParams,
  PortalQuotationListResult,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
  PortalQuotationEstimateDto,
  PortalQuotationCounterOfferDto,
} from '../types/portalQuotations.types';
import {
  applyPortalCustomerDecisionStatus,
} from '../utils/portalQuotationStatus';

export const portalQuotationKeys = {
  all: (scope: string) => ['portal', scope, 'quotations'] as const,
  summary: (scope: string) => [...portalQuotationKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalQuotationListParams) =>
    [...portalQuotationKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalQuotationKeys.all(scope), 'detail', id] as const,
  localeCurrency: (countryCode: string) =>
    ['portal', 'locale-currency', countryCode] as const,
  ports: (scope: string, search = '') =>
    [...portalQuotationKeys.all(scope), 'lookups', 'ports', search] as const,
  airports: (scope: string, search = '') =>
    [...portalQuotationKeys.all(scope), 'lookups', 'airports', search] as const,
  serviceCatalog: (scope: string, jobType?: string) =>
    [...portalQuotationKeys.all(scope), 'service-catalog', jobType ?? 'all'] as const,
  negotiation: (scope: string, id: string) =>
    [...portalQuotationKeys.all(scope), 'negotiation', id] as const,
};

function patchPortalQuotationCaches(
  qc: QueryClient,
  scope: string,
  quote: PortalQuotationDetail,
) {
  if (!quote.id) return;
  qc.setQueryData(portalQuotationKeys.detail(scope, quote.id), quote);
  qc.setQueriesData<PortalQuotationListResult>(
    { queryKey: [...portalQuotationKeys.all(scope), 'list'] },
    (old) => {
      if (!old?.items?.length) return old;
      return {
        ...old,
        items: old.items.map((item) =>
          item.id === quote.id
            ? {
                ...item,
                status: quote.status,
                currencyCode: quote.currencyCode ?? item.currencyCode,
                number: quote.number || item.number,
              }
            : item,
        ),
      };
    },
  );
}

async function syncPortalQuotationAfterDecision(
  qc: QueryClient,
  scope: string,
  quote: PortalQuotationDetail,
  decision: 'accept' | 'reject',
) {
  const closed = applyPortalCustomerDecisionStatus(quote, decision);
  // Do not refetch list/detail here — live API often still returns NEGOTIATING after a
  // successful reject/accept, which would wipe the updated badge.
  patchPortalQuotationCaches(qc, scope, closed);
  void qc.invalidateQueries({ queryKey: portalQuotationKeys.summary(scope) });
  void qc.invalidateQueries({ queryKey: portalQuotationKeys.negotiation(scope, closed.id) });
}

/** World ports for quote booking — GET /portal/lookups/ports (fallback reference). */
export function usePortalPortOptions(search = '', enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const q = search.trim();
  return useQuery({
    queryKey: portalQuotationKeys.ports(scope, q),
    queryFn: async () => {
      try {
        return await fetchPortalPortOptions(q || undefined);
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

/** World airports — GET /portal/lookups/airports. */
export function usePortalAirportOptions(search = '', enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const q = search.trim();
  return useQuery({
    queryKey: portalQuotationKeys.airports(scope, q),
    queryFn: async () => {
      try {
        return await fetchPortalAirportOptions(q || undefined);
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
    onSuccess: async (q) => {
      if (scope === 'anon' || !q.id) return;
      await syncPortalQuotationAfterDecision(qc, scope, q, 'accept');
    },
  });
}

export function useRejectPortalQuotation() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PortalQuotationRejectDto }) =>
      portalQuotationsService.reject(id, dto),
    onSuccess: async (q) => {
      if (scope === 'anon' || !q.id) return;
      await syncPortalQuotationAfterDecision(qc, scope, q, 'reject');
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
  const trimmedJobType = jobType?.trim() || '';
  return useQuery({
    queryKey: portalQuotationKeys.serviceCatalog(scope, trimmedJobType),
    queryFn: () => portalQuotationsService.serviceCatalog(trimmedJobType),
    enabled:
      Boolean(accessToken) && enabled && scope !== 'anon' && Boolean(trimmedJobType),
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
