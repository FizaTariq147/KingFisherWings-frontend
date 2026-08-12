export const PORTAL_INVOICES_API = {
  summary: '/portal/invoices/summary',
  list: '/portal/invoices',
  exportCsv: '/portal/invoices/export.csv',
  detail: (id: string) => `/portal/invoices/${encodeURIComponent(id)}`,
  pdf: (id: string) => `/portal/invoices/${encodeURIComponent(id)}/pdf`,
} as const;

export const PORTAL_INVOICE_STATUSES = [
  'DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID',
] as const;
export type PortalInvoiceStatus = (typeof PORTAL_INVOICE_STATUSES)[number];
