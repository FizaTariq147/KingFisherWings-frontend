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

export interface CreditNoteActions {
  can_edit?: boolean;
  can_download?: boolean;
}

export interface CreditNote {
  id: string;
  invoice_number?: string;
  credit_note_number?: string;
  status: CreditNoteStatus;
  invoice_type?: CreditNoteInvoiceType | string;
  credited_invoice_id?: string;
  /** Human invoice number for the credited customer invoice (not a UUID). */
  credited_invoice_number?: string;
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
  actions?: CreditNoteActions;
  pdf_url?: string;
}

/** PATCH /credit-notes/:id — header fields while DRAFT. */
export type UpdateCreditNoteDto = Partial<
  Pick<
    CreateCreditNoteFormValues,
    'credited_invoice_id' | 'job_id' | 'party_id' | 'currency_code' | 'description' | 'remarks'
  >
>;

export type CreateCreditNoteDto = CreateCreditNoteFormValues;
export type CreateCreditNoteLineDto = CreateCreditNoteLineFormValues;

export interface CreditNotePdfInfo {
  pdf_url?: string;
  customer_pdf_url?: string;
}

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
