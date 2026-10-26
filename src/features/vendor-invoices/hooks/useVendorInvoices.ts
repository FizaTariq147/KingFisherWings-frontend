import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import type { ApiPeriodQuery, UiDashboardPeriod } from '@/lib/apiPeriod';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { adjustInvoiceAmountsWithProofs } from '@/features/payment-proofs/utils/adjustInvoiceAmountsWithProofs';
import type { PaymentProof } from '@/features/payment-proofs/types/paymentProof.types';
import { vendorInvoicesService } from '../services/vendorInvoices.service';
import type {
  VendorInvoiceListItem,
  VendorInvoiceListParams,
  VendorInvoiceSubmitDto,
} from '../types/vendorInvoices.types';

export const vendorInvoiceKeys = {
  all: (scope: string) => ['vendor', scope, 'invoices'] as const,
  summary: (scope: string) => [...vendorInvoiceKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: VendorInvoiceListParams) =>
    [...vendorInvoiceKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...vendorInvoiceKeys.all(scope), 'detail', id] as const,
  openItems: (scope: string) => [...vendorInvoiceKeys.all(scope), 'open-items'] as const,
  paymentProofs: (scope: string, invoiceId: string) =>
    [...vendorInvoiceKeys.all(scope), 'payment-proofs', invoiceId] as const,
  paymentStatus: (scope: string, invoiceId: string) =>
    [...vendorInvoiceKeys.all(scope), 'payment-status', invoiceId] as const,
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
      const status = detail?.status || 'DRAFT';
      if (id) {
        queryClient.setQueryData(vendorInvoiceKeys.detail(scope, id), detail);
        // Patch list/open-item rows with API status (usually DRAFT until staff posts PI).
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
      void queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.all(scope) });
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

export function useVendorInvoicePaymentProofs(invoiceId: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorInvoiceKeys.paymentProofs(scope, invoiceId),
    queryFn: () => vendorInvoicesService.listPaymentProofs(invoiceId),
    enabled: Boolean(accessToken) && Boolean(invoiceId) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorInvoicePaymentStatus(invoiceId: string, enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorInvoiceKeys.paymentStatus(scope, invoiceId),
    queryFn: () => vendorInvoicesService.paymentStatus(invoiceId),
    enabled: Boolean(accessToken) && Boolean(invoiceId) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useDownloadVendorInvoicePaymentProof() {
  return useMutation({
    mutationFn: ({
      invoiceId,
      proof,
      fileName,
    }: {
      invoiceId: string;
      proof: PaymentProof;
      fileName?: string;
    }) => vendorInvoicesService.downloadPaymentProof(invoiceId, proof, fileName),
  });
}

export type VendorInvoiceDisplayRow = VendorInvoiceListItem & {
  displayStatus: string;
  displayPaidAmount: number;
  displayRemainingAmount: number;
  includesPendingProofs: boolean;
};

/** Merge list rows with payment proofs so status / paid / remaining stay API-driven. */
export function useVendorInvoiceDisplayRows(
  items: VendorInvoiceListItem[],
): VendorInvoiceDisplayRow[] {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  const ids = items.map((item) => item.id);

  const proofQueries = useQueries({
    queries: ids.map((invoiceId) => ({
      queryKey: vendorInvoiceKeys.paymentProofs(scope, invoiceId),
      queryFn: () => vendorInvoicesService.listPaymentProofs(invoiceId),
      enabled: Boolean(accessToken) && Boolean(invoiceId) && scope !== 'anon',
      staleTime: 30_000,
    })),
  });

  return items.map((item, index) => {
    const proofs = (proofQueries[index]?.data ?? []) as PaymentProof[];
    const adjusted = adjustInvoiceAmountsWithProofs(
      {
        totalAmount: item.totalAmount,
        paidAmount: item.paidAmount,
        outstandingBalance: item.outstandingBalance,
        status: item.status,
      },
      proofs,
    );
    return {
      ...item,
      displayStatus: adjusted.displayStatus,
      displayPaidAmount: adjusted.paidAmount,
      displayRemainingAmount: adjusted.remainingAmount,
      includesPendingProofs: adjusted.includesPendingProofs,
      paidAmount: adjusted.paidAmount,
      outstandingBalance: adjusted.remainingAmount,
      status: adjusted.displayStatus,
    };
  });
}
