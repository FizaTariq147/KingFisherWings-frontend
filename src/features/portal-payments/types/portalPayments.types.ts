import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalPaymentListParams {
  page?: number; limit?: number; from_date?: string; to_date?: string; search?: string;
}
export interface PortalPaymentListItem {
  id: string; reference?: string; paymentDate?: string; amount?: number;
  currencyCode?: string; method?: string; status?: string; direction?: string;
}
export interface PortalPaymentListResult { items: PortalPaymentListItem[]; meta: PortalPaginationMeta; }
