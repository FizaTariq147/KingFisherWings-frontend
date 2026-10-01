import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapList,
} from '@/features/portal-shared/normalize';
import { extractCheckoutUrl } from './billingApiHelpers';
import type {
  CheckoutStatusView,
  OnlinePaymentListResult,
  OnlinePaymentSummary,
  OnlineRefundSummary,
  PaymentLinkSummary,
  PaymentStatusView,
  StripeConfigView,
  StripeSettingsView,
  StripeStatusView,
} from '../types/onlinePayments.types';

function withRaw<T extends object>(fields: T, raw: Record<string, unknown>): T & { raw: Record<string, unknown> } {
  return { ...fields, raw };
}

export function normalizeOnlinePayment(raw: unknown): OnlinePaymentSummary | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return withRaw(
    {
      id,
      status: pickString(r.status) || undefined,
      amount: pickNumber(r.amount, r.total_amount, r.totalAmount),
      currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
      invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
      customerId: pickString(r.customer_id, r.customerId, r.party_id) || undefined,
      vendorId: pickString(r.vendor_id, r.vendorId) || undefined,
      method: pickString(r.payment_method, r.paymentMethod, r.method) || undefined,
      checkoutUrl: extractCheckoutUrl(r) || undefined,
    },
    r,
  );
}

export function normalizeOnlinePaymentList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): OnlinePaymentListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payments', 'data', 'history']);
  const normalized = items.map(normalizeOnlinePayment).filter((x): x is OnlinePaymentSummary => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeStripeSettings(raw: unknown): StripeSettingsView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      isEnabled: pickBoolean(r.is_enabled ?? r.isEnabled ?? r.enabled),
      publishableKey: pickString(r.publishable_key, r.publishableKey) || undefined,
      webhookConfigured: pickBoolean(r.webhook_configured ?? r.webhookConfigured),
    },
    r,
  );
}

export function normalizeStripeConfig(raw: unknown): StripeConfigView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      mode: pickString(r.mode, r.environment) || undefined,
      publishableKey: pickString(r.publishable_key, r.publishableKey) || undefined,
    },
    r,
  );
}

export function normalizeStripeStatus(raw: unknown): StripeStatusView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      connected: pickBoolean(r.connected ?? r.is_connected ?? r.isConnected),
      accountId: pickString(r.account_id, r.accountId, r.stripe_account_id) || undefined,
      mode: pickString(r.mode, r.environment) || undefined,
    },
    r,
  );
}

export function normalizeCheckoutStatus(raw: unknown): CheckoutStatusView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      status: pickString(r.status, r.checkout_status, r.checkoutStatus) || undefined,
      paymentId: pickString(r.payment_id, r.paymentId) || undefined,
    },
    r,
  );
}

export function normalizePaymentStatus(raw: unknown): PaymentStatusView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      status: pickString(r.status, r.payment_status, r.paymentStatus) || undefined,
      paidAmount: pickNumber(r.paid_amount, r.paidAmount),
      outstandingAmount: pickNumber(r.outstanding_amount, r.outstandingAmount, r.balance_due),
    },
    r,
  );
}

export function normalizeOnlineRefund(raw: unknown): OnlineRefundSummary | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.refund_id, r.refundId);
  if (!id) return null;
  return withRaw(
    {
      id,
      status: pickString(r.status) || undefined,
      amount: pickNumber(r.amount),
      currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
    },
    r,
  );
}

export function normalizePaymentLink(raw: unknown): PaymentLinkSummary | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.link_id, r.linkId);
  if (!id) return null;
  return withRaw(
    {
      id,
      url: pickString(r.url, r.payment_url, r.paymentUrl, r.checkout_url) || undefined,
      status: pickString(r.status) || undefined,
      expiresAt: pickString(r.expires_at, r.expiresAt) || undefined,
    },
    r,
  );
}
