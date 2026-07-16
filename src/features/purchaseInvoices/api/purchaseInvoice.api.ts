export const PURCHASE_INVOICE_ROUTE_PREFIX = '/purchase-invoices';

export const PURCHASE_INVOICE_API = {
  list: '/purchase-invoices',
  create: '/purchase-invoices',
  byId: (id: string) => `/purchase-invoices/${id}`,
  post: (id: string) => `/purchase-invoices/${id}/post`,
} as const;
