import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorCreditNoteListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface VendorCreditNoteListItem {
  id: string;
  number: string;
  status?: string;
  creditDate?: string;
  amount?: number;
  currencyCode?: string;
  reference?: string;
}

export interface VendorCreditNoteListResult {
  items: VendorCreditNoteListItem[];
  meta: VendorPaginationMeta;
}
