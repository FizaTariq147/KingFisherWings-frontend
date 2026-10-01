import { axiosInstance } from '@/lib/axios';
import {
  ONLINE_INVOICE_PAYMENTS_API,
  ONLINE_PAYMENTS_API,
  ONLINE_PAYMENTS_STRIPE_API,
} from '../api/onlinePayments.api';
import type {
  CreatePaymentLinkDto,
  OnlinePaymentListParams,
  RefundPaymentDto,
  StartCheckoutDto,
  UpdatePaymentGatewaySettingsDto,
} from '../types/onlinePayments.types';
import {
  normalizeCheckoutStatus,
  normalizeOnlinePayment,
  normalizeOnlinePaymentList,
  normalizeOnlineRefund,
  normalizePaymentLink,
  normalizePaymentStatus,
  normalizeStripeConfig,
  normalizeStripeSettings,
  normalizeStripeStatus,
} from '../utils/normalizeOnlinePayments';
import { asList, normalizeCheckoutSession, unwrap } from '../utils/billingApiHelpers';

export const onlinePaymentsService = {
  async getStripeStatus() {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_STRIPE_API.status);
    return normalizeStripeStatus(unwrap(res.data));
  },
  async getStripeConfig() {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_STRIPE_API.config);
    return normalizeStripeConfig(unwrap(res.data));
  },
  async getStripeSettings() {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_STRIPE_API.settings);
    return normalizeStripeSettings(unwrap(res.data));
  },
  async updateStripeSettings(dto: UpdatePaymentGatewaySettingsDto) {
    const res = await axiosInstance.put(ONLINE_PAYMENTS_STRIPE_API.settings, dto);
    return normalizeStripeSettings(unwrap(res.data));
  },
  async rotateStripeWebhook() {
    const res = await axiosInstance.post(ONLINE_PAYMENTS_STRIPE_API.rotateWebhook, {});
    return unwrap(res.data);
  },
  async reconcileStripe(body: Record<string, unknown> = {}) {
    const res = await axiosInstance.post(ONLINE_PAYMENTS_STRIPE_API.reconcile, body);
    return unwrap(res.data);
  },

  async listPayments(params: OnlinePaymentListParams = {}) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.list, { params });
    return normalizeOnlinePaymentList(res.data, params);
  },
  async getPayment(id: string) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.detail(id));
    const payment = normalizeOnlinePayment(unwrap(res.data));
    if (!payment) throw new Error('Online payment not found.');
    return payment;
  },
  async startCheckout(id: string, dto: StartCheckoutDto = {}) {
    const res = await axiosInstance.post(ONLINE_PAYMENTS_API.checkout(id), dto);
    return normalizeCheckoutSession(res.data);
  },
  async getCheckoutStatus(id: string) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.checkoutStatus(id));
    return normalizeCheckoutStatus(unwrap(res.data));
  },
  async cancelPayment(id: string, body: Record<string, unknown> = {}) {
    const res = await axiosInstance.post(ONLINE_PAYMENTS_API.cancel(id), body);
    return unwrap(res.data);
  },
  async retryPayment(id: string, body: Record<string, unknown> = {}) {
    const res = await axiosInstance.post(ONLINE_PAYMENTS_API.retry(id), body);
    return unwrap(res.data);
  },
  async refundPayment(id: string, dto: RefundPaymentDto = {}) {
    const res = await axiosInstance.post(ONLINE_PAYMENTS_API.refund(id), dto);
    return unwrap(res.data);
  },
  async listPaymentRefunds(id: string) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.refunds(id));
    return asList(res.data, ['refunds', 'items', 'results', 'data'])
      .map((row) => normalizeOnlineRefund(row))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  },
  async getRefund(refundId: string) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.refundById(refundId));
    return normalizeOnlineRefund(unwrap(res.data));
  },

  async listPaymentHistory(params: OnlinePaymentListParams = {}) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.history, { params });
    return normalizeOnlinePaymentList(res.data, params);
  },
  async listCustomerPaymentHistory(customerId: string, params: OnlinePaymentListParams = {}) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.historyCustomer(customerId), { params });
    return normalizeOnlinePaymentList(res.data, params);
  },
  async listVendorPaymentHistory(vendorId: string, params: OnlinePaymentListParams = {}) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.historyVendor(vendorId), { params });
    return normalizeOnlinePaymentList(res.data, params);
  },
  async listInvoicePaymentHistory(invoiceId: string, params: OnlinePaymentListParams = {}) {
    const res = await axiosInstance.get(ONLINE_PAYMENTS_API.historyInvoice(invoiceId), { params });
    return normalizeOnlinePaymentList(res.data, params);
  },

  async payInvoice(invoiceId: string, body: Record<string, unknown> = {}) {
    const res = await axiosInstance.post(ONLINE_INVOICE_PAYMENTS_API.pay(invoiceId), body);
    return unwrap(res.data);
  },
  async createInvoicePaymentLink(invoiceId: string, dto: CreatePaymentLinkDto = {}) {
    const res = await axiosInstance.post(ONLINE_INVOICE_PAYMENTS_API.paymentLink(invoiceId), dto);
    return normalizeCheckoutSession(res.data);
  },
  async listInvoicePaymentLinks(invoiceId: string) {
    const res = await axiosInstance.get(ONLINE_INVOICE_PAYMENTS_API.paymentLinks(invoiceId));
    return asList(res.data, ['links', 'payment_links', 'items', 'results', 'data'])
      .map((row) => normalizePaymentLink(row))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  },
  async revokeInvoicePaymentLink(invoiceId: string, linkId: string) {
    const res = await axiosInstance.post(
      ONLINE_INVOICE_PAYMENTS_API.revokePaymentLink(invoiceId, linkId),
      {},
    );
    return unwrap(res.data);
  },
  async getInvoicePaymentStatus(invoiceId: string) {
    const res = await axiosInstance.get(ONLINE_INVOICE_PAYMENTS_API.paymentStatus(invoiceId));
    return normalizePaymentStatus(unwrap(res.data));
  },
  async listInvoicePayments(invoiceId: string) {
    const res = await axiosInstance.get(ONLINE_INVOICE_PAYMENTS_API.payments(invoiceId));
    return asList(res.data, ['payments', 'items', 'results', 'data'])
      .map((row) => normalizeOnlinePayment(row))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  },
};
