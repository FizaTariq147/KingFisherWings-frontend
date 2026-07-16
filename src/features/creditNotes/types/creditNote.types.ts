import type {
  CreditNoteInvoiceType,
  CreditNoteStatus,
} from '../constants/creditNote.constants';
import type {
  CreateCreditNoteFormValues,
  CreateCreditNoteLineFormValues,
} from '../schemas/creditNote.schema';

export type {
  CreateCreditNoteFormValues,
  CreateCreditNoteLineFormValues,
} from '../schemas/creditNote.schema';

export interface CreditNoteLine {
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

export interface CreditNote {
  id: string;
  invoice_number?: string;
  credit_note_number?: string;
  status: CreditNoteStatus;
  invoice_type?: CreditNoteInvoiceType | string;
  credited_invoice_id?: string;
  party_id?: string;
  party_name?: string;
  company_id?: string;
  job_id?: string;
  branch_id?: string;
  department_id?: string;
  currency_code?: string;
  exchange_rate?: number;
  vat_rate?: number;
  invoice_date?: string;
  due_date?: string;
  remarks?: string;
  subtotal?: number;
  tax_total?: number;
  total_amount?: number;
  paid_amount?: number;
  outstanding_balance?: number;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  lines?: CreditNoteLine[];
}

export type CreateCreditNoteDto = CreateCreditNoteFormValues;
export type CreateCreditNoteLineDto = CreateCreditNoteLineFormValues;

export interface CreditNoteListParams {
  page?: number;
  limit?: number;
  status?: CreditNoteStatus;
  invoice_type?: CreditNoteInvoiceType;
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

export interface CreditNoteListResult {
  creditNotes: CreditNote[];
  meta: PaginationMeta;
}
