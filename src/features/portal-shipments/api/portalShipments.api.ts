export const PORTAL_SHIPMENTS_API = {
  summary: '/portal/shipments/summary',
  list: '/portal/shipments',
  lookup: '/portal/shipments/lookup',
  exportCsv: '/portal/shipments/export.csv',
  detail: (id: string) => `/portal/shipments/${encodeURIComponent(id)}`,
  milestones: (id: string) => `/portal/shipments/${encodeURIComponent(id)}/milestones`,
  documents: (id: string) => `/portal/shipments/${encodeURIComponent(id)}/documents`,
  downloadDocument: (id: string, docId: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}/download`,
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

export const PORTAL_JOB_TYPES = [
  'AIR_EXPORT',
  'AIR_IMPORT',
  'SEA_FCL_EXPORT',
  'SEA_FCL_IMPORT',
  'SEA_LCL_EXPORT',
  'SEA_LCL_IMPORT',
  'LAND',
  'COURIER',
  'CUSTOMS_CLEARANCE',
  'NVOCC_EXPORT',
  'NVOCC_IMPORT',
  'SERVICE_JOB',
  'WAREHOUSE',
] as const;
