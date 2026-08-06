export const PORTAL_SHIPMENTS_API = {
  summary: '/portal/shipments/summary',
  list: '/portal/shipments',
  lookup: '/portal/shipments/lookup',
  detail: (id: string) => `/portal/shipments/${id}`,
  milestones: (id: string) => `/portal/shipments/${id}/milestones`,
  documents: (id: string) => `/portal/shipments/${id}/documents`,
  downloadDocument: (id: string, docId: string) =>
    `/portal/shipments/${id}/documents/${docId}/download`,
} as const;

export const PORTAL_JOB_STATUSES = [
  'ENQUIRY',
  'QUOTATION',
  'BOOKING_CONFIRMED',
  'IN_PROGRESS',
  'DOCS_PENDING',
  'CUSTOMS_CLEARANCE',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD',
] as const;

export type PortalJobStatus = (typeof PORTAL_JOB_STATUSES)[number];
