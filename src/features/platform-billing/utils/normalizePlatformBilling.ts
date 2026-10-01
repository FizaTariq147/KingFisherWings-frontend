import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  BillingPlan,
  PaymentGatewaySettingsView,
  PaymentStatusView,
  PlatformBillingListResult,
  PlatformInvoiceSummary,
  PlatformPaymentSummary,
  StripeStatusView,
  TenantSubscriptionView,
  WebhookEventSummary,
} from '../types/platformBilling.types';

function withRaw<T extends object>(fields: T, raw: Record<string, unknown>): T & { raw: Record<string, unknown> } {
  return { ...fields, raw };
}

export function normalizeBillingPlan(raw: unknown): BillingPlan | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return withRaw(
    {
      id,
      code: pickString(r.code) || undefined,
      name: pickString(r.name) || undefined,
      description: pickString(r.description) || undefined,
      subscriptionPlan: pickString(r.subscription_plan, r.subscriptionPlan, r.plan) || undefined,
      amount: pickNumber(r.amount),
      currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
      interval: pickString(r.interval, r.billing_interval, r.billingInterval) || undefined,
      stripePriceId: pickString(r.stripe_price_id, r.stripePriceId) || undefined,
      isActive: pickBoolean(r.is_active ?? r.isActive),
      maxUsers: pickNumber(r.max_users, r.maxUsers),
      maxBranches: pickNumber(r.max_branches, r.maxBranches),
      maxStorageGb: pickNumber(r.max_storage_gb, r.maxStorageGb),
    },
    r,
  );
}

export function normalizeBillingPlanList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): PlatformBillingListResult<BillingPlan> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'plans', 'data']);
  const normalized = items.map(normalizeBillingPlan).filter((x): x is BillingPlan => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizePlatformInvoice(raw: unknown): PlatformInvoiceSummary | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  const tenant = asRecord(r.tenant) ?? asRecord(r.Tenant) ?? {};
  return withRaw(
    {
      id,
      number: pickString(r.number, r.invoice_number, r.invoiceNumber) || undefined,
      status: pickString(r.status) || undefined,
      tenantId: pickString(r.tenant_id, r.tenantId, tenant.id) || undefined,
      tenantName:
        pickString(
          r.tenant_name,
          r.tenantName,
          r.tenant_display_name,
          r.tenantDisplayName,
          tenant.display_name,
          tenant.displayName,
          tenant.name,
          tenant.code,
        ) || undefined,
      currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
      totalAmount: pickNumber(r.total_amount, r.totalAmount, r.amount),
      paidAmount: pickNumber(r.paid_amount, r.paidAmount),
      dueDate: pickString(r.due_date, r.dueDate) || undefined,
    },
    r,
  );
}

export function normalizePlatformInvoiceList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): PlatformBillingListResult<PlatformInvoiceSummary> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'invoices', 'data']);
  const normalized = items.map(normalizePlatformInvoice).filter((x): x is PlatformInvoiceSummary => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizePlatformPayment(raw: unknown): PlatformPaymentSummary | null {
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
      tenantId: pickString(r.tenant_id, r.tenantId) || undefined,
      invoiceId: pickString(r.invoice_id, r.invoiceId, r.platform_invoice_id) || undefined,
      method: pickString(r.payment_method, r.paymentMethod, r.method) || undefined,
    },
    r,
  );
}

export function normalizePlatformPaymentList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): PlatformBillingListResult<PlatformPaymentSummary> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payments', 'data']);
  const normalized = items.map(normalizePlatformPayment).filter((x): x is PlatformPaymentSummary => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeTenantSubscription(raw: unknown, tenantId?: string): TenantSubscriptionView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      tenantId: pickString(r.tenant_id, r.tenantId, tenantId) || undefined,
      status: pickString(r.status, r.subscription_status) || undefined,
      planId: pickString(r.plan_id, r.planId, r.billing_plan_id) || undefined,
      planName: pickString(r.plan_name, r.planName, r.name) || undefined,
      currentPeriodEnd: pickString(r.current_period_end, r.currentPeriodEnd) || undefined,
    },
    r,
  );
}

export function normalizePaymentGatewaySettings(raw: unknown, tenantId?: string): PaymentGatewaySettingsView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      tenantId: pickString(r.tenant_id, r.tenantId, tenantId) || undefined,
      isEnabled: pickBoolean(r.is_enabled ?? r.isEnabled),
      usePlatformAccount: pickBoolean(r.use_platform_account ?? r.usePlatformAccount),
      publishableKey: pickString(r.publishable_key, r.publishableKey) || undefined,
      allowPartialPayments: pickBoolean(r.allow_partial_payments ?? r.allowPartialPayments),
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

export function normalizeWebhookEvent(raw: unknown): WebhookEventSummary | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.event_id, r.eventId);
  if (!id) return null;
  return withRaw(
    {
      id,
      type: pickString(r.type, r.event_type, r.eventType) || undefined,
      status: pickString(r.status, r.processing_status) || undefined,
      createdAt: pickString(r.created_at, r.createdAt) || undefined,
    },
    r,
  );
}

export function normalizeWebhookEventList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): PlatformBillingListResult<WebhookEventSummary> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'events', 'webhook_events', 'data']);
  const normalized = items.map(normalizeWebhookEvent).filter((x): x is WebhookEventSummary => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
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
