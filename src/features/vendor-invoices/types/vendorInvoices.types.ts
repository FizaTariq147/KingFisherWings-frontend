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
  paidAmount?: number;
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
  remarks?: string;
  pdfUrl?: string;
  partyName?: string;
  partyEmail?: string;
  partyPhone?: string;
  vatRate?: number;
  lines: VendorInvoiceLine[];
}

export interface VendorInvoiceSummary {
  /** Invoice count (not a money total). */
  total: number;
  /** Total outstanding / balance due across invoices (money). */
  outstanding: number;
  /** Overdue amount when API provides it; otherwise overdue count. */
  overdue: number;
  /** Total paid amount across invoices (money). */
  paid: number;
  /** Count of PAID invoices when API provides it separately. */
  paidCount?: number;
  currencyCode?: string;
  byStatus: Record<string, number>;
  /** True when `paid` came from an explicit amount field on the summary payload. */
  paidFromApiAmount?: boolean;
}

export interface VendorInvoiceListResult {
  items: VendorInvoiceListItem[];
  meta: VendorPaginationMeta;
}

export interface VendorInvoiceSubmitDto {
  currency_code: string;
  total_amount: number;
  invoice_date?: string;
  due_date?: string;
  reference?: string;
  remarks?: string;
  file?: File;
}

/** GET /vendor/invoices/{id}/payment-status */
export interface VendorInvoicePaymentStatus {
  status?: string;
  paidAmount?: number;
  outstandingAmount?: number;
  raw?: Record<string, unknown>;
}
