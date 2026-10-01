import { superAdminApiClient } from '@/lib/superAdminApiClient';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PLATFORM_BILLING_API } from '../api/platformBilling.api';
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
import {
  normalizeBillingPlan,
  normalizeBillingPlanList,
  normalizePaymentGatewaySettings,
  normalizePaymentStatus,
  normalizePlatformInvoice,
  normalizePlatformInvoiceList,
  normalizePlatformPayment,
  normalizePlatformPaymentList,
  normalizeStripeStatus,
  normalizeTenantSubscription,
  normalizeWebhookEventList,
} from '../utils/normalizePlatformBilling';
import { asList, asRecord, normalizeCheckoutSession, unwrap } from '../utils/billingApiHelpers';

async function downloadBlob(path: string, fallbackName: string): Promise<void> {
  const res = await superAdminApiClient.get(path, { responseType: 'blob' });
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
  const cd = res.headers['content-disposition'];
  let fileName = fallbackName;
  if (typeof cd === 'string') {
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(cd);
    if (match?.[1]) fileName = decodeURIComponent(match[1].replace(/"/g, ''));
  }
  triggerBlobDownload(blob, fileName);
}

export const platformBillingService = {
  async listPlans(params: PlatformBillingListParams = {}) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.plans, { params });
    return normalizeBillingPlanList(res.data, params);
  },
  async getPlan(id: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.plan(id));
    const plan = normalizeBillingPlan(unwrap(res.data));
    if (!plan) throw new Error('Billing plan not found.');
    return plan;
  },
  async createPlan(dto: CreateBillingPlanDto) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.plans, dto);
    return normalizeBillingPlan(unwrap(res.data)) ?? { id: '', raw: asRecord(unwrap(res.data)) ?? {} };
  },
  async updatePlan(id: string, dto: UpdateBillingPlanDto) {
    const res = await superAdminApiClient.patch(PLATFORM_BILLING_API.plan(id), dto);
    return normalizeBillingPlan(unwrap(res.data));
  },
  async deletePlan(id: string) {
    await superAdminApiClient.delete(PLATFORM_BILLING_API.plan(id));
  },
  async reconcile(body: Record<string, unknown> = {}) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.reconcile, body);
    return unwrap(res.data);
  },
  async getStripeStatus() {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.stripeStatus);
    return normalizeStripeStatus(unwrap(res.data));
  },
  async listWebhookEvents(params: PlatformBillingListParams = {}) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.webhookEvents, { params });
    return normalizeWebhookEventList(res.data, params);
  },
  async replayWebhookEvent(id: string) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.replayWebhookEvent(id), {});
    return unwrap(res.data);
  },

  async listInvoices(params: PlatformBillingListParams = {}) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.invoices, { params });
    return normalizePlatformInvoiceList(res.data, params);
  },
  async getInvoice(id: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.invoice(id));
    const invoice = normalizePlatformInvoice(unwrap(res.data));
    if (!invoice) throw new Error('Platform invoice not found.');
    return invoice;
  },
  async createInvoice(dto: CreatePlatformInvoiceDto) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.invoices, dto);
    return normalizePlatformInvoice(unwrap(res.data));
  },
  async updateInvoice(id: string, dto: UpdatePlatformInvoiceDto) {
    const res = await superAdminApiClient.patch(PLATFORM_BILLING_API.invoice(id), dto);
    return normalizePlatformInvoice(unwrap(res.data));
  },
  async deleteInvoice(id: string) {
    await superAdminApiClient.delete(PLATFORM_BILLING_API.invoice(id));
  },
  async sendInvoice(id: string, body: SendPlatformInvoiceDto = {}) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.invoiceSend(id), body);
    return unwrap(res.data);
  },
  async createInvoicePaymentLink(id: string, dto: CreatePaymentLinkDto = {}) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.invoicePaymentLink(id), dto);
    return normalizeCheckoutSession(res.data);
  },
  async cancelInvoice(id: string, body: Record<string, unknown> = {}) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.invoiceCancel(id), body);
    return unwrap(res.data);
  },
  async getInvoicePdf(id: string, fileName = 'platform-invoice.pdf') {
    await downloadBlob(PLATFORM_BILLING_API.invoicePdf(id), fileName);
  },
  async getInvoicePaymentStatus(id: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.invoicePaymentStatus(id));
    return normalizePaymentStatus(unwrap(res.data));
  },
  async listInvoicePayments(id: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.invoicePayments(id));
    return asList(res.data, ['payments', 'items', 'results', 'data']).map((row) =>
      normalizePlatformPayment(row),
    ).filter(Boolean);
  },
  async recordManualPayment(id: string, dto: ManualPlatformPaymentDto) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.invoiceManualPayments(id), dto);
    return unwrap(res.data);
  },

  async listPayments(params: PlatformBillingListParams = {}) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.payments, { params });
    return normalizePlatformPaymentList(res.data, params);
  },
  async getPayment(id: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.payment(id));
    const payment = normalizePlatformPayment(unwrap(res.data));
    if (!payment) throw new Error('Platform payment not found.');
    return payment;
  },
  async downloadPaymentProof(id: string, fileName = 'payment-proof') {
    await downloadBlob(PLATFORM_BILLING_API.paymentProof(id), fileName);
  },
  async verifyPayment(id: string, dto: VerifyPlatformPaymentDto = {}) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.paymentVerify(id), dto);
    return unwrap(res.data);
  },
  async rejectPayment(id: string, dto: RejectPlatformPaymentDto) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.paymentReject(id), dto);
    return unwrap(res.data);
  },
  async refundPayment(id: string, dto: RefundPaymentDto = {}) {
    const res = await superAdminApiClient.post(PLATFORM_BILLING_API.paymentRefund(id), dto);
    return unwrap(res.data);
  },

  async getTenantSubscription(tenantId: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.tenantSubscription(tenantId));
    return normalizeTenantSubscription(unwrap(res.data), tenantId);
  },
  async changeTenantPlan(tenantId: string, dto: ChangeSubscriptionPlanDto) {
    const res = await superAdminApiClient.post(
      PLATFORM_BILLING_API.tenantSubscriptionChangePlan(tenantId),
      dto,
    );
    return normalizeTenantSubscription(unwrap(res.data), tenantId);
  },
  async cancelTenantSubscription(tenantId: string, dto: CancelSubscriptionDto = {}) {
    const res = await superAdminApiClient.post(
      PLATFORM_BILLING_API.tenantSubscriptionCancel(tenantId),
      dto,
    );
    return normalizeTenantSubscription(unwrap(res.data), tenantId);
  },
  async getTenantPaymentGateway(tenantId: string) {
    const res = await superAdminApiClient.get(PLATFORM_BILLING_API.tenantPaymentGateway(tenantId));
    return normalizePaymentGatewaySettings(unwrap(res.data), tenantId);
  },
  async updateTenantPaymentGateway(tenantId: string, dto: UpdatePaymentGatewaySettingsDto) {
    const res = await superAdminApiClient.put(
      PLATFORM_BILLING_API.tenantPaymentGateway(tenantId),
      dto,
    );
    return normalizePaymentGatewaySettings(unwrap(res.data), tenantId);
  },
};
