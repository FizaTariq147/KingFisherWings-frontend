import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorDisputeListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface VendorDisputeCreateDto {
  invoice_id: string;
  reason: string;
  description: string;
  file?: File;
}

export interface VendorDispute {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  reason?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  staffNotes?: string;
}

export interface VendorDisputeListResult {
  items: VendorDispute[];
  meta: VendorPaginationMeta;
}
