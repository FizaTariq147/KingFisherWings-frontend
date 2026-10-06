import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import type { ApiPeriodQuery, UiDashboardPeriod } from '@/lib/apiPeriod';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { adjustInvoiceAmountsWithProofs } from '@/features/payment-proofs/utils/adjustInvoiceAmountsWithProofs';
import type { PaymentProof } from '@/features/payment-proofs/types/paymentProof.types';
import { portalInvoicesService } from '../services/portalInvoices.service';
import type {
  PortalInvoiceListItem,
  PortalInvoiceListParams,
  PortalInvoiceListResult,
  PortalInvoicePaymentStatusView,
} from '../types/portalInvoices.types';

export const portalInvoiceKeys = {
  all: (scope: string) => ['portal', scope, 'invoices'] as const,
  summary: (scope: string) => [...portalInvoiceKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalInvoiceListParams) => [...portalInvoiceKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalInvoiceKeys.all(scope), 'detail', id] as const,
  openItems: (scope: string) => [...portalInvoiceKeys.all(scope), 'open-items'] as const,
  paymentProofs: (scope: string, invoiceId: string) =>
    [...portalInvoiceKeys.all(scope), 'payment-proofs', invoiceId] as const,
  paymentStatus: (scope: string, invoiceId: string) =>
    [...portalInvoiceKeys.all(scope), 'payment-status', invoiceId] as const,
  stripeConfig: (scope: string) => [...portalInvoiceKeys.all(scope), 'stripe-config'] as const,
};

export function usePortalInvoiceSummary(
  enabledOrPeriod: boolean | UiDashboardPeriod | ApiPeriodQuery = true,
  enabled = true,
) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const periodQuery: ApiPeriodQuery | undefined =
    typeof enabledOrPeriod === 'boolean'
      ? undefined
      : typeof enabledOrPeriod === 'string'
        ? uiPeriodToApi(enabledOrPeriod)
        : enabledOrPeriod;
  const isEnabled = typeof enabledOrPeriod === 'boolean' ? enabledOrPeriod : enabled;
  return useQuery({
    queryKey: [...portalInvoiceKeys.summary(scope), periodQuery ?? null],
    queryFn: () => portalInvoicesService.summary(periodQuery),
    enabled: Boolean(accessToken) && isEnabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalInvoices(
  params: PortalInvoiceListParams,
  enabled = true,
  options?: {
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data?: PortalInvoiceListResult } }) => number | false | undefined);
  },
) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.list(scope, params),
    queryFn: () => portalInvoicesService.list(params),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
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

export function usePortalInvoicePdfBlob() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      portalInvoicesService.getPdfBlob(id, name || 'invoice'),
  });
}

export function usePortalInvoiceOpenItems(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.openItems(scope),
    queryFn: () => portalInvoicesService.openItems(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalInvoicePaymentProofs(invoiceId: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.paymentProofs(scope, invoiceId),
    queryFn: () => portalInvoicesService.listPaymentProofs(invoiceId),
    enabled: Boolean(accessToken) && Boolean(invoiceId) && scope !== 'anon',
  });
}

export function useUploadPortalInvoicePaymentProof(invoiceId: string) {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: ({ file, dto }: { file: File; dto: import('@/features/payment-proofs/types/paymentProof.types').UploadPaymentProofDto }) =>
      portalInvoicesService.uploadPaymentProof(invoiceId, file, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.paymentProofs(scope, invoiceId) });
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.detail(scope, invoiceId) });
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.openItems(scope) });
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.all(scope) });
      void qc.invalidateQueries({ queryKey: ['portal', scope, 'credit'] });
    },
  });
}

export function usePayPortalInvoice(invoiceId: string) {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => portalInvoicesService.pay(invoiceId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.detail(scope, invoiceId) });
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.paymentStatus(scope, invoiceId) });
      void qc.invalidateQueries({ queryKey: portalInvoiceKeys.openItems(scope) });
    },
  });
}

export function useCheckoutPortalInvoice(invoiceId: string) {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => portalInvoicesService.checkout(invoiceId, body),
  });
}

export function usePortalInvoicePaymentStatus(
  invoiceId: string,
  enabled = true,
  options?: {
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data?: PortalInvoicePaymentStatusView } }) => number | false | undefined);
  },
) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.paymentStatus(scope, invoiceId),
    queryFn: () => portalInvoicesService.paymentStatus(invoiceId),
    enabled: Boolean(accessToken) && Boolean(invoiceId) && scope !== 'anon' && enabled,
    refetchInterval: options?.refetchInterval,
  });
}

export function usePortalInvoiceStripeConfig(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.stripeConfig(scope),
    queryFn: () => portalInvoicesService.getStripeConfig(),
    enabled: Boolean(accessToken) && scope !== 'anon' && enabled,
  });
}

export function useDownloadPortalInvoiceProofFile() {
  return useMutation({
    mutationFn: ({
      invoiceId,
      proofId,
      fileName,
    }: {
      invoiceId: string;
      proofId: string;
      fileName?: string;
    }) => portalInvoicesService.downloadProofFile(invoiceId, proofId, fileName),
  });
}

export type PortalInvoiceDisplayRow = PortalInvoiceListItem & {
  displayStatus: string;
  displayPaidAmount: number;
  displayRemainingAmount: number;
  includesPendingProofs: boolean;
};

/** Merge list rows with payment proofs so status/paid/remaining stay dynamic. */
export function usePortalInvoiceDisplayRows(
  items: PortalInvoiceListItem[],
): PortalInvoiceDisplayRow[] {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const ids = items.map((item) => item.id);

  const proofQueries = useQueries({
    queries: ids.map((invoiceId) => ({
      queryKey: portalInvoiceKeys.paymentProofs(scope, invoiceId),
      queryFn: () => portalInvoicesService.listPaymentProofs(invoiceId),
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


