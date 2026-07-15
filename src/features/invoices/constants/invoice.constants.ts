export const INVOICE_STATUSES = [
  'DRAFT',
  'POSTED',
  'SENT',
  'PARTIALLY_PAID',
  'PAID',
  'CANCELLED',
  'VOID',
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  VOID: 'Void',
};

export const INVOICE_TYPES = [
  'CUSTOMER_INVOICE',
  'PURCHASE_INVOICE',
  'CREDIT_NOTE',
  'DEBIT_NOTE',
] as const;

export type InvoiceType = (typeof INVOICE_TYPES)[number];

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  CUSTOMER_INVOICE: 'Customer invoice',
  PURCHASE_INVOICE: 'Purchase invoice',
  CREDIT_NOTE: 'Credit note',
  DEBIT_NOTE: 'Debit note',
};

export const DEFAULT_INVOICE_PAGE_SIZE = 20;
