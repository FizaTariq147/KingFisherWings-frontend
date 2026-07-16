export {
  INVOICE_STATUSES as PURCHASE_INVOICE_STATUSES,
  INVOICE_STATUS_LABELS as PURCHASE_INVOICE_STATUS_LABELS,
  INVOICE_TYPES as PURCHASE_INVOICE_TYPES,
  INVOICE_TYPE_LABELS as PURCHASE_INVOICE_TYPE_LABELS,
  type InvoiceStatus as PurchaseInvoiceStatus,
  type InvoiceType as PurchaseInvoiceType,
} from '@/features/invoices/constants/invoice.constants';

export const DEFAULT_PURCHASE_INVOICE_PAGE_SIZE = 20;
