import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorInvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export interface VendorInvoiceListItem {
  id: string;
  number: string;
  status?: string;
  currencyCode?: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount?: number;
  outstandingBalance?: number;
  reference?: string;
}

export interface VendorInvoiceLine {
  id: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface VendorInvoiceDetail extends VendorInvoiceListItem {
  subtotal?: number;
  taxTotal?: number;
  paidAmount?: number;
  remarks?: string;
  lines: VendorInvoiceLine[];
}

export interface VendorInvoiceSummary {
  total: number;
  outstanding: number;
  overdue: number;
  paid: number;
  byStatus: Record<string, number>;
}

export interface VendorInvoiceListResult {
  items: VendorInvoiceListItem[];
  meta: VendorPaginationMeta;
}

export interface VendorInvoiceSubmitDto {
  amount: string;
  invoice_date: string;
  reference?: string;
  file?: File;
}
