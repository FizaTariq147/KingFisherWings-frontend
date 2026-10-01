import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onlinePaymentsService } from '../services/onlinePayments.service';
import type {
  CreatePaymentLinkDto,
  OnlinePaymentListParams,
  RefundPaymentDto,
  StartCheckoutDto,
  UpdatePaymentGatewaySettingsDto,
} from '../types/onlinePayments.types';

export const onlinePaymentsKeys = {
  all: ['tenant', 'online-payments'] as const,
  stripeStatus: () => [...onlinePaymentsKeys.all, 'stripe', 'status'] as const,
  stripeConfig: () => [...onlinePaymentsKeys.all, 'stripe', 'config'] as const,
  stripeSettings: () => [...onlinePaymentsKeys.all, 'stripe', 'settings'] as const,
  list: (params: OnlinePaymentListParams) => [...onlinePaymentsKeys.all, 'list', params] as const,
  detail: (id: string) => [...onlinePaymentsKeys.all, 'detail', id] as const,
  checkoutStatus: (id: string) => [...onlinePaymentsKeys.all, 'checkout-status', id] as const,
  refunds: (id: string) => [...onlinePaymentsKeys.all, 'refunds', id] as const,
  history: (params: OnlinePaymentListParams) => [...onlinePaymentsKeys.all, 'history', params] as const,
  customerHistory: (customerId: string, params: OnlinePaymentListParams) =>
    [...onlinePaymentsKeys.all, 'history', 'customer', customerId, params] as const,
  vendorHistory: (vendorId: string, params: OnlinePaymentListParams) =>
    [...onlinePaymentsKeys.all, 'history', 'vendor', vendorId, params] as const,
  invoiceHistory: (invoiceId: string, params: OnlinePaymentListParams) =>
    [...onlinePaymentsKeys.all, 'history', 'invoice', invoiceId, params] as const,
  refund: (refundId: string) => [...onlinePaymentsKeys.all, 'refund', refundId] as const,
  invoicePaymentStatus: (invoiceId: string) =>
    [...onlinePaymentsKeys.all, 'invoice', invoiceId, 'payment-status'] as const,
  invoicePayments: (invoiceId: string) =>
    [...onlinePaymentsKeys.all, 'invoice', invoiceId, 'payments'] as const,
  invoicePaymentLinks: (invoiceId: string) =>
    [...onlinePaymentsKeys.all, 'invoice', invoiceId, 'payment-links'] as const,
};

export function useOnlinePaymentsStripeStatus(enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.stripeStatus(),
    queryFn: () => onlinePaymentsService.getStripeStatus(),
    enabled,
  });
}

export function useOnlinePaymentsStripeConfig(enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.stripeConfig(),
    queryFn: () => onlinePaymentsService.getStripeConfig(),
    enabled,
  });
}

export function useOnlinePaymentsStripeSettings(enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.stripeSettings(),
    queryFn: () => onlinePaymentsService.getStripeSettings(),
    enabled,
  });
}

export function useUpdateOnlinePaymentsStripeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePaymentGatewaySettingsDto) =>
      onlinePaymentsService.updateStripeSettings(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.stripeSettings() });
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.stripeConfig() });
    },
  });
}

export function useRotateOnlinePaymentsStripeWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => onlinePaymentsService.rotateStripeWebhook(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.stripeSettings() });
    },
  });
}

export function useReconcileOnlinePaymentsStripe() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => onlinePaymentsService.reconcileStripe(body),
  });
}

export function useOnlinePayments(params: OnlinePaymentListParams = {}, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.list(params),
    queryFn: () => onlinePaymentsService.listPayments(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useOnlinePayment(id: string) {
  return useQuery({
    queryKey: onlinePaymentsKeys.detail(id),
    queryFn: () => onlinePaymentsService.getPayment(id),
    enabled: Boolean(id),
  });
}

export function useStartOnlinePaymentCheckout() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: StartCheckoutDto }) =>
      onlinePaymentsService.startCheckout(id, dto),
  });
}

export function useOnlinePaymentCheckoutStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.checkoutStatus(id),
    queryFn: () => onlinePaymentsService.getCheckoutStatus(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCancelOnlinePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
      onlinePaymentsService.cancelPayment(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.detail(id) });
    },
  });
}

export function useRetryOnlinePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
      onlinePaymentsService.retryPayment(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.detail(id) });
    },
  });
}

export function useRefundOnlinePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: RefundPaymentDto }) =>
      onlinePaymentsService.refundPayment(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.refunds(id) });
    },
  });
}

export function useOnlinePaymentRefunds(id: string, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.refunds(id),
    queryFn: () => onlinePaymentsService.listPaymentRefunds(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useOnlinePaymentHistory(params: OnlinePaymentListParams = {}, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.history(params),
    queryFn: () => onlinePaymentsService.listPaymentHistory(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCustomerPaymentHistory(
  customerId: string,
  params: OnlinePaymentListParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: onlinePaymentsKeys.customerHistory(customerId, params),
    queryFn: () => onlinePaymentsService.listCustomerPaymentHistory(customerId, params),
    enabled: Boolean(customerId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVendorPaymentHistory(
  vendorId: string,
  params: OnlinePaymentListParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: onlinePaymentsKeys.vendorHistory(vendorId, params),
    queryFn: () => onlinePaymentsService.listVendorPaymentHistory(vendorId, params),
    enabled: Boolean(vendorId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useInvoicePaymentHistory(
  invoiceId: string,
  params: OnlinePaymentListParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: onlinePaymentsKeys.invoiceHistory(invoiceId, params),
    queryFn: () => onlinePaymentsService.listInvoicePaymentHistory(invoiceId, params),
    enabled: Boolean(invoiceId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useOnlineRefund(refundId: string, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.refund(refundId),
    queryFn: () => onlinePaymentsService.getRefund(refundId),
    enabled: Boolean(refundId) && enabled,
  });
}

export function usePayInvoiceOnline(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => onlinePaymentsService.payInvoice(invoiceId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.invoicePaymentStatus(invoiceId) });
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.invoicePayments(invoiceId) });
    },
  });
}

export function useCreateInvoicePaymentLink(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePaymentLinkDto) =>
      onlinePaymentsService.createInvoicePaymentLink(invoiceId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.invoicePaymentLinks(invoiceId) });
    },
  });
}

export function useInvoicePaymentLinks(invoiceId: string, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.invoicePaymentLinks(invoiceId),
    queryFn: () => onlinePaymentsService.listInvoicePaymentLinks(invoiceId),
    enabled: Boolean(invoiceId) && enabled,
  });
}

export function useRevokeInvoicePaymentLink(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) =>
      onlinePaymentsService.revokeInvoicePaymentLink(invoiceId, linkId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onlinePaymentsKeys.invoicePaymentLinks(invoiceId) });
    },
  });
}

export function useInvoiceOnlinePaymentStatus(invoiceId: string, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.invoicePaymentStatus(invoiceId),
    queryFn: () => onlinePaymentsService.getInvoicePaymentStatus(invoiceId),
    enabled: Boolean(invoiceId) && enabled,
  });
}

export function useInvoiceOnlinePayments(invoiceId: string, enabled = true) {
  return useQuery({
    queryKey: onlinePaymentsKeys.invoicePayments(invoiceId),
    queryFn: () => onlinePaymentsService.listInvoicePayments(invoiceId),
    enabled: Boolean(invoiceId) && enabled,
  });
}
