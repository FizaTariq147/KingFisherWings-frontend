export const PORTAL_QUOTATIONS_API = {
  summary: '/portal/quotations/summary',
  list: '/portal/quotations',
  request: '/portal/quotations/request',
  detail: (id: string) => `/portal/quotations/${encodeURIComponent(id)}`,
  accept: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/accept`,
  reject: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/reject`,
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
