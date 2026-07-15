export {
  INVOICE_STATUSES as CREDIT_NOTE_STATUSES,
  INVOICE_STATUS_LABELS as CREDIT_NOTE_STATUS_LABELS,
  INVOICE_TYPES as CREDIT_NOTE_INVOICE_TYPES,
  INVOICE_TYPE_LABELS as CREDIT_NOTE_INVOICE_TYPE_LABELS,
  type InvoiceStatus as CreditNoteStatus,
  type InvoiceType as CreditNoteInvoiceType,
} from '@/features/invoices/constants/invoice.constants';

export const DEFAULT_CREDIT_NOTE_PAGE_SIZE = 20;
