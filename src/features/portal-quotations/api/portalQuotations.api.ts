export const PORTAL_QUOTATIONS_API = {
  summary: '/portal/quotations/summary',
  list: '/portal/quotations',
  serviceCatalog: '/portal/quotations/service-catalog',
  estimate: '/portal/quotations/estimate',
  request: '/portal/quotations/request',
  detail: (id: string) => `/portal/quotations/${encodeURIComponent(id)}`,
  accept: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/accept`,
  reject: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/reject`,
  counterOffer: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/counter-offer`,
  negotiation: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/negotiation`,
  pdf: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/pdf`,
} as const;

export const PORTAL_QUOTATION_REJECT_REASONS = [
  'Competitor Rate',
  'No Space',
  'Cargo Type',
  'No Longer Required',
  'Booked Elsewhere',
  'Price Too High',
  'Other',
] as const;

export type PortalQuotationRejectReason = (typeof PORTAL_QUOTATION_REJECT_REASONS)[number];
