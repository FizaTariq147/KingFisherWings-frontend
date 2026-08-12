export const PORTAL_DOCUMENTS_API = {
  summary: '/portal/documents/summary',
  permissions: '/portal/documents/permissions',
  list: '/portal/documents',
  downloadInvoice: (invoiceId: string) =>
    `/portal/documents/invoices/${encodeURIComponent(invoiceId)}/download`,
  downloadJobDoc: (jobId: string, docId: string) =>
    `/portal/documents/jobs/${encodeURIComponent(jobId)}/${encodeURIComponent(docId)}/download`,
} as const;
