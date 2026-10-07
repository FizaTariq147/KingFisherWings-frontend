export const PURCHASE_INVOICE_ROUTE_PREFIX = '/purchase-invoices';

export const PURCHASE_INVOICE_API = {
  list: '/purchase-invoices',
  create: '/purchase-invoices',
  byId: (id: string) => `/purchase-invoices/${encodeURIComponent(id)}`,
  post: (id: string) => `/purchase-invoices/${encodeURIComponent(id)}/post`,
  /** GET/POST admin remittance proofs for a vendor purchase invoice. */
  paymentProofs: (id: string) =>
    `/purchase-invoices/${encodeURIComponent(id)}/payment-proofs`,
} as const;
