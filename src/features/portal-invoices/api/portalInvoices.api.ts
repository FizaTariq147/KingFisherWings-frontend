export const PORTAL_INVOICES_API = {
  summary: '/portal/invoices/summary',
  list: '/portal/invoices',
  openItems: '/portal/invoices/open-items',
  exportCsv: '/portal/invoices/export.csv',
  detail: (id: string) => `/portal/invoices/${encodeURIComponent(id)}`,
  pdf: (id: string) => `/portal/invoices/${encodeURIComponent(id)}/pdf`,
  paymentProofs: (id: string) => `/portal/invoices/${encodeURIComponent(id)}/payment-proofs`,
  pay: (id: string) => `/portal/invoices/${encodeURIComponent(id)}/pay`,
  checkout: (id: string) => `/portal/invoices/${encodeURIComponent(id)}/checkout`,
  paymentStatus: (id: string) => `/portal/invoices/${encodeURIComponent(id)}/payment-status`,
  proofFile: (invoiceId: string, proofId: string) =>
    `/portal/invoices/${encodeURIComponent(invoiceId)}/payment-proofs/${encodeURIComponent(proofId)}/file`,
} as const;

/** Stripe config for portal online pay lives under portal payments. */
export const PORTAL_INVOICE_PAYMENTS_API = {
  stripeConfig: '/portal/payments/stripe/config',
} as const;
