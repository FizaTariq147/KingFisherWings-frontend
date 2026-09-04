import { JOB_API } from '@/features/jobs/api/job.api';

/**
 * Backend vendor pricing flow (docs):
 * Staff POST /jobs/:id/send-to-vendor → vendor GET /vendor/quotes → POST …/price
 * Staff POST /jobs/vendor-quotes/:quoteId/approve|disapprove
 *
 * Keep job-offers / pass-to-vendor as fallbacks for older builds.
 */
export const VENDOR_JOB_OFFERS_API = {
  /** Preferred */
  sendToVendor: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/send-to-vendor`,
  passToVendor: JOB_API.passToVendor,

  /** Staff list — prefer vendor-quotes, then job-offers */
  vendorOffers: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/vendor-quotes`,
  vendorOffersAlt: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/job-offers`,
  vendorOffersLegacy: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/vendor-offers`,

  staffOffer: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}`,
  staffNegotiation: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}/negotiation`,
  staffReviseAndSend: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/revise-and-send`,
  staffAcceptCounter: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/negotiation/accept`,
  staffRejectCounter: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/negotiation/reject`,

  /** Preferred staff final decision */
  approveOffer: (offerId: string) =>
    `/jobs/vendor-quotes/${encodeURIComponent(offerId)}/approve`,
  disapproveOffer: (offerId: string) =>
    `/jobs/vendor-quotes/${encodeURIComponent(offerId)}/disapprove`,
  approveOfferAlt: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}/approve`,
  disapproveOfferAlt: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/disapprove`,

  /** Preferred vendor inbox */
  vendorJobs: '/vendor/quotes',
  vendorJobsLegacy: '/vendor/job-offers',
  vendorJob: (id: string) => `/vendor/quotes/${encodeURIComponent(id)}`,
  vendorJobLegacy: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}`,
  vendorNegotiation: (id: string) => `/vendor/quotes/${encodeURIComponent(id)}/negotiation`,
  vendorNegotiationLegacy: (id: string) =>
    `/vendor/job-offers/${encodeURIComponent(id)}/negotiation`,
  vendorAccept: (id: string) => `/vendor/quotes/${encodeURIComponent(id)}/accept`,
  vendorAcceptLegacy: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}/accept`,
  vendorReject: (id: string) => `/vendor/quotes/${encodeURIComponent(id)}/reject`,
  vendorRejectLegacy: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}/reject`,
  vendorCounterOffer: (id: string) => `/vendor/quotes/${encodeURIComponent(id)}/counter-offer`,
  vendorCounterOfferLegacy: (id: string) =>
    `/vendor/job-offers/${encodeURIComponent(id)}/counter-offer`,
  vendorJobPrice: (id: string) => `/vendor/quotes/${encodeURIComponent(id)}/price`,
  vendorJobPriceLegacy: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}/price`,

  lookupsPorts: '/vendor/lookups/ports',
  lookupsAirports: '/vendor/lookups/airports',
} as const;

/** Negotiation statuses (primary) + legacy aliases still returned by older builds. */
export const VENDOR_JOB_OFFER_STATUSES = [
  'SENT',
  'NEGOTIATING',
  'VENDOR_REVIEW',
  'APPROVED',
  'DISAPPROVED',
  /** @deprecated legacy */
  'PENDING_VENDOR',
  'VENDOR_PRICED',
  'TENANT_APPROVED',
  'TENANT_DISAPPROVED',
] as const;

export type VendorJobOfferStatus = (typeof VENDOR_JOB_OFFER_STATUSES)[number];
