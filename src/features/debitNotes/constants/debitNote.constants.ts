export {
  INVOICE_STATUSES as DEBIT_NOTE_STATUSES,
  INVOICE_STATUS_LABELS as DEBIT_NOTE_STATUS_LABELS,
  INVOICE_TYPES as DEBIT_NOTE_INVOICE_TYPES,
  INVOICE_TYPE_LABELS as DEBIT_NOTE_INVOICE_TYPE_LABELS,
  type InvoiceStatus as DebitNoteStatus,
  type InvoiceType as DebitNoteInvoiceType,
} from '@/features/invoices/constants/invoice.constants';

export const DEFAULT_DEBIT_NOTE_PAGE_SIZE = 20;
