export const PURCHASE_INVOICE_ROUTE_PREFIX = '/purchase-invoices';

export const PURCHASE_INVOICE_API = {
  list: '/purchase-invoices',
  create: '/purchase-invoices',
  byId: (id: string) => `/purchase-invoices/${encodeURIComponent(id)}`,
  post: (id: string) => `/purchase-invoices/${encodeURIComponent(id)}/post`,
  /** POST /purchase-invoices/from-job/:jobId — draft PI from job costing */
  fromJob: (jobId: string) =>
    `/purchase-invoices/from-job/${encodeURIComponent(jobId)}`,
  /** GET/POST admin remittance proofs for a vendor purchase invoice. */
  paymentProofs: (id: string) =>
    `/purchase-invoices/${encodeURIComponent(id)}/payment-proofs`,
} as const;
