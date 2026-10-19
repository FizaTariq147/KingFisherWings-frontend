export const PORTAL_QUOTATIONS_API = {
  summary: '/portal/quotations/summary',
  list: '/portal/quotations',
  serviceCatalog: '/portal/quotations/service-catalog',
  costingOptions: '/portal/quotations/costing-options',
  estimate: '/portal/quotations/estimate',
  request: '/portal/quotations/request',
  detail: (id: string) => `/portal/quotations/${encodeURIComponent(id)}`,
  accept: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/accept`,
  reject: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/reject`,
  counterOffer: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/counter-offer`,
  negotiation: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/negotiation`,
  pdf: (id: string) => `/portal/quotations/${encodeURIComponent(id)}/pdf`,
  /**
   * Staff continuum owns job creation (Generate Shipment → Generate Job).
   * Portal customers must not call this — accept only sets APPROVED.
   */
  convertToJob: (id: string) =>
    `/portal/quotations/${encodeURIComponent(id)}/convert-to-job`,
  bookingForm: (id: string) =>
    `/portal/quotations/${encodeURIComponent(id)}/booking-form`,
  bookingFormComplete: (id: string) =>
    `/portal/quotations/${encodeURIComponent(id)}/booking-form/complete`,
  /** Mode booking docs (sea/land/etc.) — uploader_side=CUSTOMER. */
  bookingFormDocument: (id: string, kind: string) =>
    `/portal/quotations/${encodeURIComponent(id)}/booking-form/documents/${encodeURIComponent(kind)}`,
} as const;

/** Portal — NVOCC Compliance Booking Form (customer 8-step). Air uses PORTAL_SHIPMENTS_API. */
export const PORTAL_BOOKINGS_API = {
  accept: (id: string) => `/portal/bookings/${encodeURIComponent(id)}/accept`,
  complianceForm: (id: string) =>
    `/portal/bookings/${encodeURIComponent(id)}/compliance-form`,
  complianceFormSubmit: (id: string) =>
    `/portal/bookings/${encodeURIComponent(id)}/compliance-form/submit`,
  complianceDocument: (id: string, kind: string) =>
    `/portal/bookings/${encodeURIComponent(id)}/compliance-form/documents/${encodeURIComponent(kind)}`,
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
