import type {
  DebitNoteInvoiceType,
  DebitNoteStatus,
} from '../constants/debitNote.constants';
import type {
  CreateDebitNoteFormValues,
  CreateDebitNoteLineFormValues,
} from '../schemas/debitNote.schema';

export type {
  CreateDebitNoteFormValues,
  CreateDebitNoteLineFormValues,
} from '../schemas/debitNote.schema';

export interface DebitNoteLine {
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

export interface DebitNoteActions {
  can_edit?: boolean;
  can_download?: boolean;
}

export interface DebitNote {
  id: string;
  invoice_number?: string;
  debit_note_number?: string;
  status: DebitNoteStatus;
  invoice_type?: DebitNoteInvoiceType | string;
  /** Original customer invoice being debited (API field name). */
  credited_invoice_id?: string;
  /** Human invoice number for the debited customer invoice (not a UUID). */
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
  lines?: DebitNoteLine[];
  /** Customer / staff payment-proof file on the debit note itself. */
  has_attachment?: boolean;
  attachment_name?: string;
  actions?: DebitNoteActions;
  pdf_url?: string;
}

/** PATCH /debit-notes/:id — header fields while DRAFT. */
export type UpdateDebitNoteDto = Partial<
  Pick<
    CreateDebitNoteFormValues,
    'credited_invoice_id' | 'job_id' | 'party_id' | 'currency_code' | 'description' | 'remarks'
  >
>;

export type CreateDebitNoteDto = CreateDebitNoteFormValues;
export type CreateDebitNoteLineDto = CreateDebitNoteLineFormValues;

export interface DebitNotePdfInfo {
  pdf_url?: string;
  customer_pdf_url?: string;
}

export interface DebitNoteListParams {
  page?: number;
  limit?: number;
  status?: DebitNoteStatus;
  invoice_type?: DebitNoteInvoiceType;
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

export interface DebitNoteListResult {
  debitNotes: DebitNote[];
  meta: PaginationMeta;
}
