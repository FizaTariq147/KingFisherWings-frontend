import type { InvoiceStatus, InvoiceType } from '../constants/invoice.constants';
import type {
  CreateInvoiceFormValues,
  CreateInvoiceLineFormValues,
  SendInvoiceEmailFormValues,
  UpdateInvoiceFormValues,
  UpdateInvoiceLineFormValues,
} from '../schemas/invoice.schema';

export type {
  CreateInvoiceFormValues,
  CreateInvoiceLineFormValues,
  SendInvoiceEmailFormValues,
  UpdateInvoiceFormValues,
  UpdateInvoiceLineFormValues,
} from '../schemas/invoice.schema';

export interface InvoiceLine {
  id: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  charge_code_id?: string;
  charge_code?: string;
  tax_rate_id?: string;
  is_taxable?: boolean;
  sort_order?: number;
  tax_amount?: number;
  line_total?: number;
}

export interface Invoice {
  id: string;
  invoice_number?: string;
  status: InvoiceStatus;
  invoice_type?: InvoiceType | string;
  party_id: string;
  party_name?: string;
  company_id?: string;
  job_id?: string;
  branch_id?: string;
  department_id?: string;
  currency_code: string;
  exchange_rate?: number;
  vat_rate?: number;
  invoice_date?: string;
  due_date?: string;
  lpo_number?: string;
  remarks?: string;
  internal_notes?: string;
  subtotal?: number;
  tax_total?: number;
  total_amount?: number;
  paid_amount?: number;
  outstanding_balance?: number;
  pdf_url?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  lines?: InvoiceLine[];
}

export type CreateInvoiceDto = CreateInvoiceFormValues;
export type UpdateInvoiceDto = UpdateInvoiceFormValues;
export type CreateInvoiceLineDto = CreateInvoiceLineFormValues;
export type UpdateInvoiceLineDto = UpdateInvoiceLineFormValues;
export type SendInvoiceEmailDto = SendInvoiceEmailFormValues;

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  invoice_type?: InvoiceType;
  party_id?: string;
  job_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvoiceListResult {
  invoices: Invoice[];
  meta: PaginationMeta;
}

export interface InvoicePdfInfo {
  pdf_url?: string;
  customer_pdf_url?: string;
  [key: string]: unknown;
}
