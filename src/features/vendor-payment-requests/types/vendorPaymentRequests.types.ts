import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorPaymentRequestListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface VendorPaymentRequest {
  id: string;
  number?: string;
  status?: string;
  requestedAt?: string;
  amount?: number;
  currencyCode?: string;
  notes?: string;
  paymentId?: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface VendorPaymentRequestListResult {
  items: VendorPaymentRequest[];
  meta: VendorPaginationMeta;
}
