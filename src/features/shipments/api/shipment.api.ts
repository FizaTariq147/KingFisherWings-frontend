export const SHIPMENT_ROUTE_PREFIX = '/operations/shipments';

/** Staff Shipments domain — matches backend /shipments (OpenAPI). */
export const SHIPMENT_API = {
  list: '/shipments',
  create: '/shipments',
  byId: (id: string) => `/shipments/${id}`,
  detail: (id: string) => `/shipments/${id}/detail`,
  detailTab: (id: string, tab: string) => `/shipments/${id}/detail/${encodeURIComponent(tab)}`,
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
  billsOfLading: (id: string) => `/shipments/${id}/bills-of-lading`,
  awb: (id: string) => `/shipments/${id}/awb`,
} as const;

/** Known Fresa shipment detail tab keys (backend may return a subset). */
export const SHIPMENT_DETAIL_TABS = [
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
