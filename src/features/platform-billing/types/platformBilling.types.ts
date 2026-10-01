import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

/** Billing intervals accepted by CreateBillingPlanDto — kept as suggestions only. */
export const BILLING_INTERVALS = ['MONTH', 'YEAR'] as const;
export type BillingInterval = string;

export interface CreateBillingPlanDto {
  code: string;
  name: string;
  description?: string;
  /** Tenant subscription tier code from API (dynamic — not a fixed FE enum). */
  subscription_plan: string;
  amount: number;
  currency_code: string;
  interval: BillingInterval;
  stripe_price_id?: string;
  sync_to_stripe?: boolean;
  max_users?: number;
  max_branches?: number;
  max_storage_gb?: number;
}

export interface UpdateBillingPlanDto {
  name?: string;
  description?: string;
  stripe_price_id?: string;
  is_active?: boolean;
  max_users?: number;
  max_branches?: number;
  max_storage_gb?: number;
}

export interface UpdatePaymentGatewaySettingsDto {
  is_enabled?: boolean;
  use_platform_account?: boolean;
  secret_key?: string;
  publishable_key?: string;
  webhook_secret?: string;
  allow_partial_payments?: boolean;
  bank_account_id?: string;
  fee_gl_account_id?: string;
  statement_descriptor?: string;
}

export interface StartCheckoutDto {
  amount?: number;
}

export interface CreatePaymentLinkDto {
  expires_in_days?: number;
  email_to?: string;
  message?: string;
}

export interface RefundPaymentDto {
  amount?: number;
  reason?: string;
}

export interface CreatePlatformInvoiceLineDto {
  description: string;
  quantity?: number;
  unit_price?: number;
  amount?: number;
  [key: string]: unknown;
}

export interface CreatePlatformInvoiceDto {
  tenant_id: string;
  currency_code?: string;
  lines: CreatePlatformInvoiceLineDto[];
  discount_amount?: number;
  tax_rate?: number;
  due_date?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface SendPlatformInvoiceDto {
  deliver_email?: boolean;
  to_email?: string;
  message?: string;
  include_payment_link?: boolean;
}

export interface UpdatePlatformInvoiceDto {
  currency_code?: string;
  lines?: CreatePlatformInvoiceLineDto[];
  discount_amount?: number;
  tax_rate?: number;
  due_date?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface ChangeSubscriptionPlanDto {
  plan_id: string;
  [key: string]: unknown;
}

export interface CancelSubscriptionDto {
  at_period_end?: boolean;
  reason?: string;
  [key: string]: unknown;
}

export interface VerifyPlatformPaymentDto {
  notes?: string;
  [key: string]: unknown;
}

export interface RejectPlatformPaymentDto {
  reason?: string;
  [key: string]: unknown;
}

export interface ManualPlatformPaymentDto {
  amount: number;
  currency_code?: string;
  payment_method?: string;
  reference?: string;
  paid_at?: string;
  [key: string]: unknown;
}

export interface BillingPlan {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  subscriptionPlan?: string;
  amount?: number;
  currencyCode?: string;
  interval?: string;
  stripePriceId?: string;
  isActive?: boolean;
  maxUsers?: number;
  maxBranches?: number;
  maxStorageGb?: number;
  raw: Record<string, unknown>;
}

export interface PlatformInvoiceSummary {
  id: string;
  number?: string;
  status?: string;
  tenantId?: string;
  tenantName?: string;
  currencyCode?: string;
  totalAmount?: number;
  paidAmount?: number;
  dueDate?: string;
  raw: Record<string, unknown>;
}

export interface PlatformPaymentSummary {
  id: string;
  status?: string;
  amount?: number;
  currencyCode?: string;
  tenantId?: string;
  invoiceId?: string;
  method?: string;
  raw: Record<string, unknown>;
}

export interface PlatformBillingListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tenant_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface PlatformBillingListResult<T> {
  items: T[];
  meta: PortalPaginationMeta;
}

export interface TenantSubscriptionView {
  tenantId?: string;
  status?: string;
  planId?: string;
  planName?: string;
  currentPeriodEnd?: string;
  raw: Record<string, unknown>;
}

export interface PaymentGatewaySettingsView {
  tenantId?: string;
  isEnabled?: boolean;
  usePlatformAccount?: boolean;
  publishableKey?: string;
  allowPartialPayments?: boolean;
  raw: Record<string, unknown>;
}

export interface StripeStatusView {
  connected?: boolean;
  accountId?: string;
  mode?: string;
  raw: Record<string, unknown>;
}

export interface WebhookEventSummary {
  id: string;
  type?: string;
  status?: string;
  createdAt?: string;
  raw: Record<string, unknown>;
}

export interface PaymentStatusView {
  status?: string;
  paidAmount?: number;
  outstandingAmount?: number;
  raw: Record<string, unknown>;
}
