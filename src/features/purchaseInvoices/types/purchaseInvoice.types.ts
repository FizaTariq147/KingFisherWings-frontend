import type {
  PurchaseInvoiceStatus,
  PurchaseInvoiceType,
} from '../constants/purchaseInvoice.constants';
import type {
  CreatePurchaseInvoiceFormValues,
  CreatePurchaseInvoiceLineFormValues,
  UpdatePurchaseInvoiceFormValues,
} from '../schemas/purchaseInvoice.schema';

export type {
  CreatePurchaseInvoiceFormValues,
  CreatePurchaseInvoiceLineFormValues,
  UpdatePurchaseInvoiceFormValues,
} from '../schemas/purchaseInvoice.schema';

export interface PurchaseInvoiceLine {
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

export interface PurchaseInvoice {
  id: string;
  invoice_number?: string;
  status: PurchaseInvoiceStatus;
  invoice_type?: PurchaseInvoiceType | string;
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
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  lines?: PurchaseInvoiceLine[];
}

export type CreatePurchaseInvoiceDto = CreatePurchaseInvoiceFormValues;
export type UpdatePurchaseInvoiceDto = UpdatePurchaseInvoiceFormValues;
export type CreatePurchaseInvoiceLineDto = CreatePurchaseInvoiceLineFormValues;

export interface PurchaseInvoiceListParams {
  page?: number;
  limit?: number;
  status?: PurchaseInvoiceStatus;
  invoice_type?: PurchaseInvoiceType;
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

export interface PurchaseInvoiceListResult {
  purchaseInvoices: PurchaseInvoice[];
  meta: PaginationMeta;
}
