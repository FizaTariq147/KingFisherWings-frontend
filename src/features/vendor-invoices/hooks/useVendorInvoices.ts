import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorInvoicesService } from '../services/vendorInvoices.service';
import type { VendorInvoiceListParams, VendorInvoiceSubmitDto } from '../types/vendorInvoices.types';

export const vendorInvoiceKeys = {
  all: (scope: string) => ['vendor', scope, 'invoices'] as const,
  summary: (scope: string) => [...vendorInvoiceKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: VendorInvoiceListParams) =>
    [...vendorInvoiceKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...vendorInvoiceKeys.all(scope), 'detail', id] as const,
};

export function useVendorInvoiceSummary(enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorInvoiceKeys.summary(scope),
    queryFn: () => vendorInvoicesService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
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
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      vendorInvoicesService.downloadPdf(id, name || 'invoice.pdf'),
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
