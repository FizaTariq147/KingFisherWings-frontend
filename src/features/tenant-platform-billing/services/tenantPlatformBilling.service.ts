import { axiosInstance } from '@/lib/axios';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { TENANT_PLATFORM_BILLING_API } from '../api/tenantPlatformBilling.api';
import type {
  CancelSubscriptionDto,
  ChangeSubscriptionPlanDto,
  StartCheckoutDto,
  TenantPlatformBillingListParams,
  UploadTenantPlatformPaymentProofInput,
} from '../types/tenantPlatformBilling.types';
import {
  normalizePaymentStatus,
  normalizeTenantBillingPlanList,
  normalizeTenantPlatformInvoice,
  normalizeTenantPlatformInvoiceList,
  normalizeTenantPlatformPayment,
  normalizeTenantPlatformPaymentList,
  normalizeTenantSubscription,
} from '../utils/normalizeTenantPlatformBilling';
import { normalizeCheckoutSession, unwrap } from '../utils/billingApiHelpers';

async function downloadBlob(path: string, fallbackName: string): Promise<void> {
  const res = await axiosInstance.get(path, { responseType: 'blob' });
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
  const cd = res.headers['content-disposition'];
  let fileName = fallbackName;
  if (typeof cd === 'string') {
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(cd);
    if (match?.[1]) fileName = decodeURIComponent(match[1].replace(/"/g, ''));
  }
  triggerBlobDownload(blob, fileName);
}

export const tenantPlatformBillingService = {
  async listPlans(params: TenantPlatformBillingListParams = {}) {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.plans, { params });
    return normalizeTenantBillingPlanList(res.data, params);
  },
  async getSubscription() {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.subscription);
    return normalizeTenantSubscription(unwrap(res.data));
  },
  async startSubscriptionCheckout(dto: StartCheckoutDto = {}) {
    const res = await axiosInstance.post(TENANT_PLATFORM_BILLING_API.subscriptionCheckout, dto);
    return normalizeCheckoutSession(res.data);
  },
  async changePlan(dto: ChangeSubscriptionPlanDto) {
    const res = await axiosInstance.post(TENANT_PLATFORM_BILLING_API.subscriptionChangePlan, dto);
    return normalizeTenantSubscription(unwrap(res.data));
  },
  async cancelSubscription(dto: CancelSubscriptionDto = {}) {
    const res = await axiosInstance.post(TENANT_PLATFORM_BILLING_API.subscriptionCancel, dto);
    return normalizeTenantSubscription(unwrap(res.data));
  },

  async listInvoices(params: TenantPlatformBillingListParams = {}) {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.invoices, { params });
    return normalizeTenantPlatformInvoiceList(res.data, params);
  },
  async getInvoice(id: string) {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.invoice(id));
    const invoice = normalizeTenantPlatformInvoice(unwrap(res.data));
    if (!invoice) throw new Error('Platform invoice not found.');
    return invoice;
  },
  async getInvoicePdf(id: string, fileName = 'platform-invoice.pdf') {
    await downloadBlob(TENANT_PLATFORM_BILLING_API.invoicePdf(id), fileName);
  },
  async getInvoicePaymentStatus(id: string) {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.invoicePaymentStatus(id));
    return normalizePaymentStatus(unwrap(res.data));
  },
  async payInvoice(id: string, body: Record<string, unknown> = {}) {
    const res = await axiosInstance.post(TENANT_PLATFORM_BILLING_API.invoicePay(id), body);
    return unwrap(res.data);
  },
  async checkoutInvoice(id: string, dto: StartCheckoutDto = {}) {
    const res = await axiosInstance.post(TENANT_PLATFORM_BILLING_API.invoiceCheckout(id), dto);
    return normalizeCheckoutSession(res.data);
  },
  async uploadInvoicePaymentProof(id: string, input: UploadTenantPlatformPaymentProofInput) {
    const form = new FormData();
    form.append('file', input.file);
    if (input.fields) {
      for (const [key, value] of Object.entries(input.fields)) {
        form.append(key, value);
      }
    }
    const res = await axiosInstance.post(TENANT_PLATFORM_BILLING_API.invoicePaymentProof(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },

  async listPayments(params: TenantPlatformBillingListParams = {}) {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.payments, { params });
    return normalizeTenantPlatformPaymentList(res.data, params);
  },
  async getPayment(id: string) {
    const res = await axiosInstance.get(TENANT_PLATFORM_BILLING_API.payment(id));
    const payment = normalizeTenantPlatformPayment(unwrap(res.data));
    if (!payment) throw new Error('Platform payment not found.');
    return payment;
  },
  async downloadPaymentProof(id: string, fileName = 'payment-proof') {
    await downloadBlob(TENANT_PLATFORM_BILLING_API.paymentProof(id), fileName);
  },
};
