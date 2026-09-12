export const VENDOR_INVOICES_API = {
  list: '/vendor/invoices',
  summary: '/vendor/invoices/summary',
  openItems: '/vendor/invoices/open-items',
  exportCsv: '/vendor/invoices/export.csv',
  submit: '/vendor/invoices/submit',
  detail: (id: string) => `/vendor/invoices/${encodeURIComponent(id)}`,
  pdf: (id: string) => `/vendor/invoices/${encodeURIComponent(id)}/pdf`,
  sendEmail: (id: string) => `/vendor/invoices/${encodeURIComponent(id)}/send-email`,
  paymentProofs: (id: string) => `/vendor/invoices/${encodeURIComponent(id)}/payment-proofs`,
  paymentProofSendEmail: (id: string, proofId: string) =>
    `/vendor/invoices/${encodeURIComponent(id)}/payment-proofs/${encodeURIComponent(proofId)}/send-email`,
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
