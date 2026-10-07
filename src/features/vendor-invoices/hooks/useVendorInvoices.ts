import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import type { ApiPeriodQuery, UiDashboardPeriod } from '@/lib/apiPeriod';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { vendorInvoicesService } from '../services/vendorInvoices.service';
import type { VendorInvoiceListParams, VendorInvoiceSubmitDto } from '../types/vendorInvoices.types';

export const vendorInvoiceKeys = {
  all: (scope: string) => ['vendor', scope, 'invoices'] as const,
  summary: (scope: string) => [...vendorInvoiceKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: VendorInvoiceListParams) =>
    [...vendorInvoiceKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...vendorInvoiceKeys.all(scope), 'detail', id] as const,
  openItems: (scope: string) => [...vendorInvoiceKeys.all(scope), 'open-items'] as const,
};

export function useVendorInvoiceSummary(
  enabledOrPeriod: boolean | UiDashboardPeriod | ApiPeriodQuery = true,
  enabled = true,
) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  const periodQuery: ApiPeriodQuery | undefined =
    typeof enabledOrPeriod === 'boolean'
      ? undefined
      : typeof enabledOrPeriod === 'string'
        ? uiPeriodToApi(enabledOrPeriod)
        : enabledOrPeriod;
  const isEnabled = typeof enabledOrPeriod === 'boolean' ? enabledOrPeriod : enabled;
  return useQuery({
    queryKey: [...vendorInvoiceKeys.summary(scope), periodQuery ?? null],
    queryFn: () => vendorInvoicesService.summary(periodQuery),
    enabled: Boolean(accessToken) && isEnabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorInvoices(params: VendorInvoiceListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorInvoiceKeys.list(scope, params),
    queryFn: () => vendorInvoicesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useVendorInvoice(id: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorInvoiceKeys.detail(scope, id),
    queryFn: () => vendorInvoicesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useExportVendorInvoicesCsv() {
  return useMutation({
    mutationFn: (params: VendorInvoiceListParams = {}) => vendorInvoicesService.exportCsv(params),
  });
}

export function useDownloadVendorInvoicePdf() {
  return useMutation({
    mutationFn: ({
      id,
      name,
      pdfUrl,
    }: {
      id: string;
      name?: string;
      pdfUrl?: string;
    }) => vendorInvoicesService.downloadPdf(id, name || 'invoice.pdf', pdfUrl),
  });
}

export function useVendorInvoicePdfBlob() {
  return useMutation({
    mutationFn: ({
      id,
      name,
      pdfUrl,
    }: {
      id: string;
      name?: string;
      pdfUrl?: string;
    }) => vendorInvoicesService.getPdfBlob(id, name || 'invoice.pdf', pdfUrl),
  });
}

export function useSubmitVendorInvoice() {
  const queryClient = useQueryClient();
  const scope = useVendorQueryScope();
  return useMutation({
    mutationFn: (dto: VendorInvoiceSubmitDto) => vendorInvoicesService.submit(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.all(scope) });
    },
  });
}

export function usePostVendorInvoice() {
  const queryClient = useQueryClient();
  const scope = useVendorQueryScope();
  return useMutation({
    mutationFn: (detail: import('../types/vendorInvoices.types').VendorInvoiceDetail) =>
      vendorInvoicesService.post(detail),
    onSuccess: (detail, original) => {
      const id = detail?.id || original.id;
      const status = detail?.status || 'POSTED';
      if (id) {
        queryClient.setQueryData(vendorInvoiceKeys.detail(scope, id), detail);
        // Patch list/open-item rows so status shows POSTED without refetching DRAFT from API.
        queryClient.setQueriesData(
          { queryKey: vendorInvoiceKeys.all(scope) },
          (old: unknown) => {
            if (!old || typeof old !== 'object') return old;
            const record = old as { items?: Array<{ id: string; status?: string }> };
            if (!Array.isArray(record.items)) return old;
            return {
              ...record,
              items: record.items.map((item) =>
                item.id === id ? { ...item, status } : item,
              ),
            };
          },
        );
      }
      void queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.summary(scope) });
    },
  });
}

export function useVendorInvoiceOpenItems(enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorInvoiceKeys.openItems(scope),
    queryFn: () => vendorInvoicesService.openItems(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
  });
}

export function useSendVendorInvoiceEmail() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: import('@/features/shared/share-email').ShareEmailDto }) =>
      vendorInvoicesService.sendEmail(id, dto),
  });
}
