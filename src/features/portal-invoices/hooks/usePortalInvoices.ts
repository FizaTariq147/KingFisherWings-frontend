import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalInvoicesService } from '../services/portalInvoices.service';
import type { PortalInvoiceListParams } from '../types/portalInvoices.types';

export const portalInvoiceKeys = {
  all: (scope: string) => ['portal', scope, 'invoices'] as const,
  summary: (scope: string) => [...portalInvoiceKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalInvoiceListParams) => [...portalInvoiceKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalInvoiceKeys.all(scope), 'detail', id] as const,
};

export function usePortalInvoiceSummary(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.summary(scope),
    queryFn: () => portalInvoicesService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalInvoices(params: PortalInvoiceListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.list(scope, params),
    queryFn: () => portalInvoicesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalInvoice(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.detail(scope, id),
    queryFn: () => portalInvoicesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useExportPortalInvoicesCsv() {
  return useMutation({
    mutationFn: (params: PortalInvoiceListParams = {}) =>
      portalInvoicesService.exportCsv(params),
  });
}

export function useDownloadPortalInvoicePdf() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      portalInvoicesService.downloadPdf(id, name || 'invoice'),
  });
}

