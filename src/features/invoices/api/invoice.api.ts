export const INVOICE_ROUTE_PREFIX = '/invoices';

export const INVOICE_API = {
  list: '/invoices',
  create: '/invoices',
  overdue: '/invoices/reports/overdue',
  fromJob: (jobId: string) => `/invoices/from-job/${jobId}`,
  byId: (id: string) => `/invoices/${id}`,
  lines: (id: string) => `/invoices/${id}/lines`,
  lineById: (id: string, lineId: string) => `/invoices/${id}/lines/${lineId}`,
  post: (id: string) => `/invoices/${id}/post`,
  send: (id: string) => `/invoices/${id}/send`,
  pdf: (id: string) => `/invoices/${id}/pdf`,
  /** Optional debug payload for FRESA invoice format packs (does not replace default PDF). */
  formatPayload: (id: string) => `/invoices/${id}/format-payload`,
  cancel: (id: string) => `/invoices/${id}/cancel`,
} as const;
