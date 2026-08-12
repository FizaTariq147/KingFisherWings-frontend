export const VENDOR_INVOICES_API = {
  list: '/vendor/invoices',
  summary: '/vendor/invoices/summary',
  exportCsv: '/vendor/invoices/export.csv',
  submit: '/vendor/invoices/submit',
  detail: (id: string) => `/vendor/invoices/${encodeURIComponent(id)}`,
  pdf: (id: string) => `/vendor/invoices/${encodeURIComponent(id)}/pdf`,
} as const;

export const VENDOR_INVOICE_STATUSES = [
  'DRAFT',
  'POSTED',
  'APPROVED',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
] as const;
