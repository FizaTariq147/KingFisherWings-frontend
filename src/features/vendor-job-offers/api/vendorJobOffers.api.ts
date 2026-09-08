import { JOB_API } from '@/features/jobs/api/job.api';

/**
 * Backend vendor pricing flow (docs):
 * Staff POST /jobs/:id/send-to-vendor { vendor_party_id, proposed_total? } →
 * vendor GET /vendor/quotes (sees cost_total) → POST …/price / accept / counter
 * Staff negotiate via /job-offers/:id/revise-and-send + negotiation/accept|reject
 * Staff POST /jobs/job-offers/:quoteId/approve|disapprove (and vendor-quotes aliases)
 */
export const VENDOR_JOB_OFFERS_API = {
  /** Preferred */
  sendToVendor: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/send-to-vendor`,
  passToVendor: JOB_API.passToVendor,

  /**
   * Staff list — prefer Swagger primary `/jobs/:id/job-offers`, then vendor-quotes aliases.
   */
  vendorOffers: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/job-offers`,
  vendorOffersAlt: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/vendor-quotes`,
  vendorOffersLegacy: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/vendor-offers`,

  staffOffer: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}`,
  staffNegotiation: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}/negotiation`,
  staffReviseAndSend: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/revise-and-send`,
  staffAcceptCounter: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/negotiation/accept`,
  staffRejectCounter: (offerId: string) =>
    `/job-offers/${encodeURIComponent(offerId)}/negotiation/reject`,

  /** Staff final decision — try all live Swagger aliases */
  approveOffer: (offerId: string) =>
    `/jobs/job-offers/${encodeURIComponent(offerId)}/approve`,
  approveOfferVendorQuotes: (offerId: string) =>
    `/jobs/vendor-quotes/${encodeURIComponent(offerId)}/approve`,
  approveOfferAlt: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}/approve`,
  disapproveOffer: (offerId: string) =>
    `/jobs/job-offers/${encodeURIComponent(offerId)}/disapprove`,
  disapproveOfferVendorQuotes: (offerId: string) =>
    `/jobs/vendor-quotes/${encodeURIComponent(offerId)}/disapprove`,
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
