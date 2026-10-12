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
 * - GET `/shipments/:id/detail/:tab` — lazy tab payload
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
  edi: (id: string, action: string) => `/shipments/${id}/edi/${encodeURIComponent(action)}`,
  kpi: (id: string) => `/shipments/${id}/kpi`,
  tracking: (id: string) => `/shipments/${id}/tracking`,
  routingLegs: (id: string) => `/shipments/${id}/routing-legs`,
  routingLegById: (id: string, legId: string) => `/shipments/${id}/routing-legs/${legId}`,
  charges: (id: string) => `/shipments/${id}/charges`,
  getCharges: (id: string) => `/shipments/${id}/get-charges`,
  copyCharges: (id: string) => `/shipments/${id}/copy-charges`,
  documentBookingConfirmation: (id: string) =>
    `/shipments/${id}/documents/booking-confirmation`,
  documentHbl: (id: string) => `/shipments/${id}/documents/hbl`,
  billsOfLading: (id: string) => `/shipments/${id}/bills-of-lading`,
  awb: (id: string) => `/shipments/${id}/awb`,
} as const;

/** Fresa “Show All” — aggregates every other tab (+ related read APIs) on one page. */
export const SHIPMENT_SHOW_ALL_TAB = 'show-all' as const;

/** Alternate backend keys for the Show All tab. */
export const SHIPMENT_SHOW_ALL_TAB_ALIASES = [
  SHIPMENT_SHOW_ALL_TAB,
  'show_all',
  'showAll',
  'ShowAll',
] as const;

/** Known Fresa shipment detail tab keys (backend may return a subset). */
export const SHIPMENT_DETAIL_TABS = [
  SHIPMENT_SHOW_ALL_TAB,
  'information',
  'organization',
  'dimensions',
  'planned-containers',
  'actual-containers',
  'exchange-rate',
  'costing',
  'department',
  'shipping-bill',
  'routing',
  'customs',
] as const;

export type ShipmentDetailTabKey = (typeof SHIPMENT_DETAIL_TABS)[number];

export function isShipmentShowAllTab(key: string): boolean {
  const k = key.trim().toLowerCase().replace(/_/g, '-');
  return k === 'show-all' || k === 'showall';
}
