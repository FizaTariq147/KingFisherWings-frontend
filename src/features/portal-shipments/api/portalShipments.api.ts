export const PORTAL_SHIPMENTS_API = {
  summary: '/portal/shipments/summary',
  list: '/portal/shipments',
  lookup: '/portal/shipments/lookup',
  exportCsv: '/portal/shipments/export.csv',
  /** GET /portal/jobs/:id/costing — customer portal job costing view */
  jobCosting: (id: string) => `/portal/jobs/${encodeURIComponent(id)}/costing`,
  detail: (id: string) => `/portal/shipments/${encodeURIComponent(id)}`,
  /** GET /portal/shipments/:id/tracking — full track & trace (status + history) */
  tracking: (id: string) => `/portal/shipments/${encodeURIComponent(id)}/tracking`,
  milestones: (id: string) => `/portal/shipments/${encodeURIComponent(id)}/milestones`,
  documents: (id: string) => `/portal/shipments/${encodeURIComponent(id)}/documents`,
  downloadDocument: (id: string, docId: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}/download`,
  containerRequests: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/container-requests`,
  confirmPick: (id: string, lineId: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/containers/${encodeURIComponent(lineId)}/confirm-pick`,
  confirmPortToken: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/port-token/confirm`,
  requestDraftBl: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/request-draft-bl`,
  uldRequests: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/uld-requests`,
  confirmUldDropoff: (id: string, lineId: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/uld-lines/${encodeURIComponent(lineId)}/confirm-dropoff`,
  requestDraftHawb: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/request-draft-hawb`,
  requestDeliveryOrder: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/request-delivery-order`,
  /** Shared commercial — air compliance booking form (same fields as NVOCC). */
  accept: (id: string) => `/portal/shipments/${encodeURIComponent(id)}/accept`,
  complianceForm: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/compliance-form`,
  complianceFormSubmit: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/compliance-form/submit`,
  complianceDocument: (id: string, kind: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/compliance-form/documents/${encodeURIComponent(kind)}`,
  /** Mode booking-form document attach (sea/land/etc.). */
  bookingFormDocument: (id: string, kind: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/booking-form/documents/${encodeURIComponent(kind)}`,
  acknowledgement: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/acknowledgement`,
  acknowledgementSignature: (id: string) =>
    `/portal/shipments/${encodeURIComponent(id)}/acknowledgement/signature`,
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
  'ROAD_FREIGHT',
  'COURIER',
  'CUSTOMS_CLEARANCE',
  'NVOCC_EXPORT',
  'NVOCC_IMPORT',
  'SERVICE_JOB',
  'WAREHOUSE',
] as const;
