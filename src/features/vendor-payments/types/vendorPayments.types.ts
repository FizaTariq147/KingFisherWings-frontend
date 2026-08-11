import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorPaymentListParams {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface VendorPaymentListItem {
  id: string;
  reference?: string;
  paymentDate?: string;
  amount?: number;
  unallocatedAmount?: number;
  currencyCode?: string;
  method?: string;
  status?: string;
}

export interface VendorPaymentListResult {
  items: VendorPaymentListItem[];
  meta: VendorPaginationMeta;
}
