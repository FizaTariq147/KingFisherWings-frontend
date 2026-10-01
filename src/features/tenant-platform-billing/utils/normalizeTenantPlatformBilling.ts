import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  PaymentStatusView,
  TenantBillingPlan,
  TenantPlatformInvoice,
  TenantPlatformListResult,
  TenantPlatformPayment,
  TenantSubscriptionView,
} from '../types/tenantPlatformBilling.types';

function withRaw<T extends object>(fields: T, raw: Record<string, unknown>): T & { raw: Record<string, unknown> } {
  return { ...fields, raw };
}

export function normalizeTenantBillingPlan(raw: unknown): TenantBillingPlan | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.plan_id, r.planId);
  if (!id) return null;
  return withRaw(
    {
      id,
      code: pickString(r.code) || undefined,
      name: pickString(r.name) || undefined,
      amount: pickNumber(r.amount),
      currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
      interval: pickString(r.interval) || undefined,
    },
    r,
  );
}

export function normalizeTenantBillingPlanList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): TenantPlatformListResult<TenantBillingPlan> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'plans', 'data']);
  const normalized = items.map(normalizeTenantBillingPlan).filter((x): x is TenantBillingPlan => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeTenantPlatformInvoice(raw: unknown): TenantPlatformInvoice | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return withRaw(
    {
      id,
      number: pickString(r.number, r.invoice_number, r.invoiceNumber) || undefined,
      status: pickString(r.status) || undefined,
      currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
      totalAmount: pickNumber(r.total_amount, r.totalAmount, r.amount),
      paidAmount: pickNumber(r.paid_amount, r.paidAmount),
      dueDate: pickString(r.due_date, r.dueDate) || undefined,
    },
    r,
  );
}

export function normalizeTenantPlatformInvoiceList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): TenantPlatformListResult<TenantPlatformInvoice> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'invoices', 'data']);
  const normalized = items
    .map(normalizeTenantPlatformInvoice)
    .filter((x): x is TenantPlatformInvoice => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeTenantPlatformPayment(raw: unknown): TenantPlatformPayment | null {
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
      invoiceId: pickString(r.invoice_id, r.invoiceId, r.platform_invoice_id) || undefined,
      method: pickString(r.payment_method, r.paymentMethod, r.method) || undefined,
    },
    r,
  );
}

export function normalizeTenantPlatformPaymentList(
  raw: unknown,
  params: { page?: number; limit?: number } = {},
): TenantPlatformListResult<TenantPlatformPayment> {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payments', 'data']);
  const normalized = items
    .map(normalizeTenantPlatformPayment)
    .filter((x): x is TenantPlatformPayment => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeTenantSubscription(raw: unknown): TenantSubscriptionView {
  const r = asRecord(raw) ?? {};
  return withRaw(
    {
      status: pickString(r.status, r.subscription_status) || undefined,
      planId: pickString(r.plan_id, r.planId, r.billing_plan_id) || undefined,
      planName: pickString(r.plan_name, r.planName, r.name) || undefined,
      currentPeriodEnd: pickString(r.current_period_end, r.currentPeriodEnd) || undefined,
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
