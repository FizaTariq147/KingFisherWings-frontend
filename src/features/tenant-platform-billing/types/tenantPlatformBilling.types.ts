import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
import type {
  CancelSubscriptionDto,
  ChangeSubscriptionPlanDto,
  StartCheckoutDto,
} from '@/features/platform-billing/types/platformBilling.types';

export type { CancelSubscriptionDto, ChangeSubscriptionPlanDto, StartCheckoutDto };

export interface TenantPlatformBillingListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export interface TenantBillingPlan {
  id: string;
  code?: string;
  name?: string;
  amount?: number;
  currencyCode?: string;
  interval?: string;
  raw: Record<string, unknown>;
}

export interface TenantPlatformInvoice {
  id: string;
  number?: string;
  status?: string;
  currencyCode?: string;
  totalAmount?: number;
  paidAmount?: number;
  dueDate?: string;
  raw: Record<string, unknown>;
}

export interface TenantPlatformPayment {
  id: string;
  status?: string;
  amount?: number;
  currencyCode?: string;
  invoiceId?: string;
  method?: string;
  raw: Record<string, unknown>;
}

export interface TenantSubscriptionView {
  status?: string;
  planId?: string;
  planName?: string;
  currentPeriodEnd?: string;
  raw: Record<string, unknown>;
}

export interface TenantPlatformListResult<T> {
  items: T[];
  meta: PortalPaginationMeta;
}

export interface PaymentStatusView {
  status?: string;
  paidAmount?: number;
  outstandingAmount?: number;
  raw: Record<string, unknown>;
}

export interface UploadTenantPlatformPaymentProofInput {
  file: File;
  fields?: Record<string, string>;
}
