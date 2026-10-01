import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantPlatformBillingService } from '../services/tenantPlatformBilling.service';
import type {
  CancelSubscriptionDto,
  ChangeSubscriptionPlanDto,
  StartCheckoutDto,
  TenantPlatformBillingListParams,
  UploadTenantPlatformPaymentProofInput,
} from '../types/tenantPlatformBilling.types';

export const tenantPlatformBillingKeys = {
  all: ['tenant', 'platform-billing'] as const,
  plans: (params: TenantPlatformBillingListParams) =>
    [...tenantPlatformBillingKeys.all, 'plans', params] as const,
  subscription: () => [...tenantPlatformBillingKeys.all, 'subscription'] as const,
  invoices: (params: TenantPlatformBillingListParams) =>
    [...tenantPlatformBillingKeys.all, 'invoices', params] as const,
  invoice: (id: string) => [...tenantPlatformBillingKeys.all, 'invoice', id] as const,
  invoicePaymentStatus: (id: string) =>
    [...tenantPlatformBillingKeys.all, 'invoice', id, 'payment-status'] as const,
  payments: (params: TenantPlatformBillingListParams) =>
    [...tenantPlatformBillingKeys.all, 'payments', params] as const,
  payment: (id: string) => [...tenantPlatformBillingKeys.all, 'payment', id] as const,
};

export function useTenantBillingPlans(params: TenantPlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.plans(params),
    queryFn: () => tenantPlatformBillingService.listPlans(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTenantSubscription(enabled = true) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.subscription(),
    queryFn: () => tenantPlatformBillingService.getSubscription(),
    enabled,
  });
}

export function useTenantSubscriptionCheckout() {
  return useMutation({
    mutationFn: (dto: StartCheckoutDto) => tenantPlatformBillingService.startSubscriptionCheckout(dto),
  });
}

export function useTenantChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeSubscriptionPlanDto) => tenantPlatformBillingService.changePlan(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: tenantPlatformBillingKeys.subscription() });
    },
  });
}

export function useTenantCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CancelSubscriptionDto) => tenantPlatformBillingService.cancelSubscription(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: tenantPlatformBillingKeys.subscription() });
    },
  });
}

export function useTenantPlatformInvoices(params: TenantPlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.invoices(params),
    queryFn: () => tenantPlatformBillingService.listInvoices(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTenantPlatformInvoice(id: string) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.invoice(id),
    queryFn: () => tenantPlatformBillingService.getInvoice(id),
    enabled: Boolean(id),
  });
}

export function useDownloadTenantPlatformInvoicePdf() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName?: string }) =>
      tenantPlatformBillingService.getInvoicePdf(id, fileName),
  });
}

export function useTenantPlatformInvoicePaymentStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.invoicePaymentStatus(id),
    queryFn: () => tenantPlatformBillingService.getInvoicePaymentStatus(id),
    enabled: Boolean(id) && enabled,
  });
}

export function usePayTenantPlatformInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => tenantPlatformBillingService.payInvoice(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: tenantPlatformBillingKeys.invoice(id) });
      void qc.invalidateQueries({ queryKey: tenantPlatformBillingKeys.invoicePaymentStatus(id) });
    },
  });
}

export function useCheckoutTenantPlatformInvoice(id: string) {
  return useMutation({
    mutationFn: (dto: StartCheckoutDto) => tenantPlatformBillingService.checkoutInvoice(id, dto),
  });
}

export function useUploadTenantPlatformInvoicePaymentProof(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadTenantPlatformPaymentProofInput) =>
      tenantPlatformBillingService.uploadInvoicePaymentProof(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: tenantPlatformBillingKeys.invoice(id) });
    },
  });
}

export function useTenantPlatformPayments(params: TenantPlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.payments(params),
    queryFn: () => tenantPlatformBillingService.listPayments(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTenantPlatformPayment(id: string) {
  return useQuery({
    queryKey: tenantPlatformBillingKeys.payment(id),
    queryFn: () => tenantPlatformBillingService.getPayment(id),
    enabled: Boolean(id),
  });
}

export function useDownloadTenantPlatformPaymentProof() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName?: string }) =>
      tenantPlatformBillingService.downloadPaymentProof(id, fileName),
  });
}
