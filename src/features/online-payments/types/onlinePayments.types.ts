import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
import type {
  CreatePaymentLinkDto,
  RefundPaymentDto,
  StartCheckoutDto,
  UpdatePaymentGatewaySettingsDto,
} from '@/features/platform-billing/types/platformBilling.types';

export type { CreatePaymentLinkDto, RefundPaymentDto, StartCheckoutDto, UpdatePaymentGatewaySettingsDto };

export interface OnlinePaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  customer_id?: string;
  vendor_id?: string;
  invoice_id?: string;
}

export interface OnlinePaymentSummary {
  id: string;
  status?: string;
  amount?: number;
  currencyCode?: string;
  invoiceId?: string;
  customerId?: string;
  vendorId?: string;
  method?: string;
  checkoutUrl?: string;
  raw: Record<string, unknown>;
}

export interface OnlinePaymentListResult {
  items: OnlinePaymentSummary[];
  meta: PortalPaginationMeta;
}

export interface StripeSettingsView {
  isEnabled?: boolean;
  publishableKey?: string;
  webhookConfigured?: boolean;
  raw: Record<string, unknown>;
}

export interface StripeConfigView {
  mode?: string;
  publishableKey?: string;
  raw: Record<string, unknown>;
}

export interface StripeStatusView {
  connected?: boolean;
  accountId?: string;
  mode?: string;
  raw: Record<string, unknown>;
}

export interface CheckoutStatusView {
  status?: string;
  paymentId?: string;
  raw: Record<string, unknown>;
}

export interface PaymentStatusView {
  status?: string;
  paidAmount?: number;
  outstandingAmount?: number;
  raw: Record<string, unknown>;
}

export interface OnlineRefundSummary {
  id: string;
  status?: string;
  amount?: number;
  currencyCode?: string;
  raw: Record<string, unknown>;
}

export interface PaymentLinkSummary {
  id: string;
  url?: string;
  status?: string;
  expiresAt?: string;
  raw: Record<string, unknown>;
}
