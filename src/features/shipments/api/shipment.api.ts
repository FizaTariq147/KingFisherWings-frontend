/** Operations continuum shipments list/detail. */
export const SHIPMENT_ROUTE_PREFIX = '/operations/shipments';
export const SHIPMENT_CREATE_PATH = `${SHIPMENT_ROUTE_PREFIX}/new`;

/**
 * Customer Service — same GET/POST /shipments APIs, separate create entry
 * (direct booking without requiring Party→Enquiry→Quotation first).
 */
export const CS_SHIPMENT_ROUTE_PREFIX = '/customer-service/shipments';
export const CS_SHIPMENT_CREATE_PATH = `${CS_SHIPMENT_ROUTE_PREFIX}/new`;

/** Resolve list/create/detail paths from the current URL. */
export function shipmentPathsForLocation(pathname: string): {
  list: string;
  create: string;
  detail: (id: string) => string;
} {
  const isCs = pathname.startsWith(CS_SHIPMENT_ROUTE_PREFIX);
  const list = isCs ? CS_SHIPMENT_ROUTE_PREFIX : SHIPMENT_ROUTE_PREFIX;
  return {
    list,
    create: `${list}/new`,
    detail: (id: string) => `${list}/${id}`,
  };
}

/**
 * Staff Shipments domain — OpenAPI (kingfisherwings-backend):
 * - GET/POST `/shipments` — list & create
 * - GET `/shipments/:id` — basic detail
 * - GET `/shipments/:id/detail` — Fresa header, tabs, actions (detail page)
 * - GET `/shipments/:id/detail/:tab` — lazy tab payload (tab keys come from detail.tabs)
 * Frontend routes: `/operations/shipments` and `/customer-service/shipments`.
 */
export const SHIPMENT_API = {
  list: '/shipments',
  create: '/shipments',
  byId: (id: string) => `/shipments/${id}`,
  detail: (id: string) => `/shipments/${id}/detail`,
  detailTab: (id: string, tab: string) => `/shipments/${id}/detail/${encodeURIComponent(tab)}`,
  bookingForm: (id: string) => `/shipments/${id}/booking-form`,
  bookingFormComplete: (id: string) => `/shipments/${id}/booking-form/complete`,
  changeStatus: (id: string) => `/shipments/${id}/change-status`,
  changeBlStatus: (id: string) => `/shipments/${id}/change-bl-status`,
  changeDepartment: (id: string) => `/shipments/${id}/department`,
  generateJob: (id: string) => `/shipments/${id}/generate-job`,
  copy: (id: string) => `/shipments/${id}/copy`,
  split: (id: string) => `/shipments/${id}/split`,
  merge: (id: string) => `/shipments/${id}/merge`,
  switchBl: (id: string) => `/shipments/${id}/switch-bl`,
  createSubmaster: (id: string) => `/shipments/${id}/create-submaster`,
  /** Legacy action-style EDI (kept for older backends). Prefer typed EDI below. */
  edi: (id: string, action: string) => `/shipments/${id}/edi/${encodeURIComponent(action)}`,
  /** GET /shipments/:id/edi/types · POST generate · GET submissions · GET download (PDF stream) */
  ediTypes: (id: string) => `/shipments/${id}/edi/types`,
  ediGenerate: (id: string) => `/shipments/${id}/edi/generate`,
  ediSubmissions: (id: string) => `/shipments/${id}/edi/submissions`,
  /** Bearer PDF attachment — not an S3 URL. */
  ediSubmissionDownload: (id: string, submissionId: string) =>
    `/shipments/${id}/edi/submissions/${encodeURIComponent(submissionId)}/download`,
  kpi: (id: string) => `/shipments/${id}/kpi`,
  tracking: (id: string) => `/shipments/${id}/tracking`,
  routingLegs: (id: string) => `/shipments/${id}/routing-legs`,
  routingLegById: (id: string, legId: string) => `/shipments/${id}/routing-legs/${legId}`,
  charges: (id: string) => `/shipments/${id}/charges`,
  charge: (id: string, chargeId: string) =>
    `/shipments/${id}/charges/${encodeURIComponent(chargeId)}`,
  chargesComposite: (id: string) => `/shipments/${id}/charges/composite`,
  getCharges: (id: string) => `/shipments/${id}/get-charges`,
  copyCharges: (id: string) => `/shipments/${id}/copy-charges`,
  dimensions: (id: string) => `/shipments/${id}/dimensions`,
  customsRefs: (id: string) => `/shipments/${id}/customs-refs`,
  exchangeRates: (id: string) => `/shipments/${id}/exchange-rates`,
  organizations: (id: string) => `/shipments/${id}/organizations`,
  documentBookingConfirmation: (id: string) =>
    `/shipments/${id}/documents/booking-confirmation`,
  documentHbl: (id: string) => `/shipments/${id}/documents/hbl`,
  billsOfLading: (id: string) => `/shipments/${id}/bills-of-lading`,
  awb: (id: string) => `/shipments/${id}/awb`,
} as const;

/** True when the API tab key is the Show All aggregate tab. */
export function isShipmentShowAllTab(key: string): boolean {
  const k = key.trim().toLowerCase().replace(/-/g, '_');
  return k === 'show_all' || k === 'showall';
}

/**
 * Exact path segment for GET /shipments/:id/detail/:tab.
 * Uses the key from GET /shipments/:id/detail `tabs` as-is (trimmed only).
 */
export function toApiShipmentDetailTabKey(tab: string): string {
  return tab.trim();
}

/** Display label: prefer API label; continuum Party for organization; else humanize key. */
export function shipmentDetailTabLabel(key: string, apiLabel?: string): string {
  const fromApi = apiLabel?.trim();
  if (fromApi && !isShipmentShowAllTab(fromApi)) {
    const lower = fromApi.toLowerCase();
    if (lower === 'organization' || lower === 'organisation') return 'Party';
    return fromApi;
  }
  if (isShipmentShowAllTab(key)) return 'Show All';
  const norm = key.trim().toLowerCase().replace(/-/g, '_');
  if (norm === 'organization' || norm === 'organisation') return 'Party';
  if (norm === 'info' || norm === 'information') return 'Info';
  if (norm === 'section_files' || norm === 'sectionfiles') return 'Section files';
  return key
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
