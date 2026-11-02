export const PORTAL_CREDIT_NOTES_API = {
  list: '/portal/credit-notes',
  detail: (id: string) => `/portal/credit-notes/${encodeURIComponent(id)}`,
  pdf: (id: string) => `/portal/credit-notes/${encodeURIComponent(id)}/pdf`,
} as const;

/**
 * Portal Debit Notes — list/detail + create (job-ledger advance / charges) + pay.
 * Create accepts JSON or multipart with optional attachment (same pattern as disputes).
 */
export const PORTAL_DEBIT_NOTES_API = {
  list: '/portal/debit-notes',
  create: '/portal/debit-notes',
  detail: (id: string) => `/portal/debit-notes/${encodeURIComponent(id)}`,
  attachment: (id: string) =>
    `/portal/debit-notes/${encodeURIComponent(id)}/attachment`,
  pay: (id: string) => `/portal/debit-notes/${encodeURIComponent(id)}/pay`,
  payments: (id: string) =>
    `/portal/debit-notes/${encodeURIComponent(id)}/payments`,
  paymentStatus: (id: string) =>
    `/portal/debit-notes/${encodeURIComponent(id)}/payment-status`,
} as const;
