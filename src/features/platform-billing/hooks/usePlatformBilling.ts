import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformBillingService } from '../services/platformBilling.service';
import type {
  CancelSubscriptionDto,
  ChangeSubscriptionPlanDto,
  CreateBillingPlanDto,
  CreatePaymentLinkDto,
  CreatePlatformInvoiceDto,
  ManualPlatformPaymentDto,
  PlatformBillingListParams,
  RejectPlatformPaymentDto,
  RefundPaymentDto,
  SendPlatformInvoiceDto,
  UpdateBillingPlanDto,
  UpdatePaymentGatewaySettingsDto,
  UpdatePlatformInvoiceDto,
  VerifyPlatformPaymentDto,
} from '../types/platformBilling.types';

export const platformBillingKeys = {
  all: ['superadmin', 'platform-billing'] as const,
  plans: (params: PlatformBillingListParams) => [...platformBillingKeys.all, 'plans', params] as const,
  plan: (id: string) => [...platformBillingKeys.all, 'plan', id] as const,
  stripeStatus: () => [...platformBillingKeys.all, 'stripe-status'] as const,
  webhookEvents: (params: PlatformBillingListParams) =>
    [...platformBillingKeys.all, 'webhook-events', params] as const,
  invoices: (params: PlatformBillingListParams) =>
    [...platformBillingKeys.all, 'invoices', params] as const,
  invoice: (id: string) => [...platformBillingKeys.all, 'invoice', id] as const,
  invoicePaymentStatus: (id: string) =>
    [...platformBillingKeys.all, 'invoice', id, 'payment-status'] as const,
  invoicePayments: (id: string) =>
    [...platformBillingKeys.all, 'invoice', id, 'payments'] as const,
  payments: (params: PlatformBillingListParams) =>
    [...platformBillingKeys.all, 'payments', params] as const,
  payment: (id: string) => [...platformBillingKeys.all, 'payment', id] as const,
  tenantSubscription: (tenantId: string) =>
    [...platformBillingKeys.all, 'tenant-subscription', tenantId] as const,
  tenantPaymentGateway: (tenantId: string) =>
    [...platformBillingKeys.all, 'tenant-payment-gateway', tenantId] as const,
};

export function usePlatformBillingPlans(params: PlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.plans(params),
    queryFn: () => platformBillingService.listPlans(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePlatformBillingPlan(id: string) {
  return useQuery({
    queryKey: platformBillingKeys.plan(id),
    queryFn: () => platformBillingService.getPlan(id),
    enabled: Boolean(id),
  });
}

export function useCreatePlatformBillingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBillingPlanDto) => platformBillingService.createPlan(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useUpdatePlatformBillingPlan(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBillingPlanDto) => platformBillingService.updatePlan(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.plan(id) });
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useDeletePlatformBillingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformBillingService.deletePlan(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function usePlatformBillingReconcile() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => platformBillingService.reconcile(body),
  });
}

export function usePlatformBillingStripeStatus(enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.stripeStatus(),
    queryFn: () => platformBillingService.getStripeStatus(),
    enabled,
  });
}

export function usePlatformBillingWebhookEvents(params: PlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.webhookEvents(params),
    queryFn: () => platformBillingService.listWebhookEvents(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useReplayPlatformBillingWebhookEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformBillingService.replayWebhookEvent(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function usePlatformInvoices(params: PlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.invoices(params),
    queryFn: () => platformBillingService.listInvoices(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePlatformInvoice(id: string) {
  return useQuery({
    queryKey: platformBillingKeys.invoice(id),
    queryFn: () => platformBillingService.getInvoice(id),
    enabled: Boolean(id),
  });
}

export function useCreatePlatformInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePlatformInvoiceDto) => platformBillingService.createInvoice(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useUpdatePlatformInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePlatformInvoiceDto) => platformBillingService.updateInvoice(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.invoice(id) });
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useDeletePlatformInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformBillingService.deleteInvoice(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useSendPlatformInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: SendPlatformInvoiceDto }) =>
      platformBillingService.sendInvoice(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.invoice(id) });
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useCreatePlatformInvoicePaymentLink() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: CreatePaymentLinkDto }) =>
      platformBillingService.createInvoicePaymentLink(id, dto),
  });
}

export function useCancelPlatformInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
      platformBillingService.cancelInvoice(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.invoice(id) });
    },
  });
}

export function useDownloadPlatformInvoicePdf() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName?: string }) =>
      platformBillingService.getInvoicePdf(id, fileName),
  });
}

export function usePlatformInvoicePaymentStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.invoicePaymentStatus(id),
    queryFn: () => platformBillingService.getInvoicePaymentStatus(id),
    enabled: Boolean(id) && enabled,
  });
}

export function usePlatformInvoicePayments(id: string, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.invoicePayments(id),
    queryFn: () => platformBillingService.listInvoicePayments(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useRecordPlatformManualPayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ManualPlatformPaymentDto) =>
      platformBillingService.recordManualPayment(invoiceId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.invoice(invoiceId) });
      void qc.invalidateQueries({ queryKey: platformBillingKeys.invoicePayments(invoiceId) });
    },
  });
}

export function usePlatformPayments(params: PlatformBillingListParams = {}, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.payments(params),
    queryFn: () => platformBillingService.listPayments(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePlatformPayment(id: string) {
  return useQuery({
    queryKey: platformBillingKeys.payment(id),
    queryFn: () => platformBillingService.getPayment(id),
    enabled: Boolean(id),
  });
}

export function useDownloadPlatformPaymentProof() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName?: string }) =>
      platformBillingService.downloadPaymentProof(id, fileName),
  });
}

export function useVerifyPlatformPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: VerifyPlatformPaymentDto }) =>
      platformBillingService.verifyPayment(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.payment(id) });
      void qc.invalidateQueries({ queryKey: platformBillingKeys.all });
    },
  });
}

export function useRejectPlatformPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejectPlatformPaymentDto }) =>
      platformBillingService.rejectPayment(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.payment(id) });
    },
  });
}

export function useRefundPlatformPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: RefundPaymentDto }) =>
      platformBillingService.refundPayment(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.payment(id) });
    },
  });
}

export function useTenantPlatformSubscription(tenantId: string, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.tenantSubscription(tenantId),
    queryFn: () => platformBillingService.getTenantSubscription(tenantId),
    enabled: Boolean(tenantId) && enabled,
  });
}

export function useChangeTenantPlatformPlan(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeSubscriptionPlanDto) =>
      platformBillingService.changeTenantPlan(tenantId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.tenantSubscription(tenantId) });
    },
  });
}

export function useCancelTenantPlatformSubscription(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CancelSubscriptionDto) =>
      platformBillingService.cancelTenantSubscription(tenantId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.tenantSubscription(tenantId) });
    },
  });
}

export function useTenantPaymentGateway(tenantId: string, enabled = true) {
  return useQuery({
    queryKey: platformBillingKeys.tenantPaymentGateway(tenantId),
    queryFn: () => platformBillingService.getTenantPaymentGateway(tenantId),
    enabled: Boolean(tenantId) && enabled,
  });
}

export function useUpdateTenantPaymentGateway(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePaymentGatewaySettingsDto) =>
      platformBillingService.updateTenantPaymentGateway(tenantId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: platformBillingKeys.tenantPaymentGateway(tenantId) });
    },
  });
}
