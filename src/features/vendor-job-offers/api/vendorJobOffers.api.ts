import { JOB_API } from '@/features/jobs/api/job.api';

/**
 * Live OpenAPI vendor cost negotiation:
 * Admin pass (seeded cost) → SENT
 * Vendor accept / reject / counter → APPROVED / DISAPPROVED / NEGOTIATING (cost_total jumps)
 * Admin revise-and-send → VENDOR_REVIEW
 * Either side accept / reject → APPROVED / DISAPPROVED
 */
export const VENDOR_JOB_OFFERS_API = {
  passToVendor: JOB_API.passToVendor,
  /** Prefer job-scoped job-offers; fall back to vendor-quotes. */
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
  approveOffer: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}/approve`,
  disapproveOffer: (offerId: string) => `/job-offers/${encodeURIComponent(offerId)}/disapprove`,
  approveOfferAlt: (offerId: string) =>
    `/jobs/vendor-quotes/${encodeURIComponent(offerId)}/approve`,
  disapproveOfferAlt: (offerId: string) =>
    `/jobs/vendor-quotes/${encodeURIComponent(offerId)}/disapprove`,

  vendorJobs: '/vendor/job-offers',
  vendorJob: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}`,
  vendorNegotiation: (id: string) =>
    `/vendor/job-offers/${encodeURIComponent(id)}/negotiation`,
  vendorAccept: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}/accept`,
  vendorReject: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}/reject`,
  vendorCounterOffer: (id: string) =>
    `/vendor/job-offers/${encodeURIComponent(id)}/counter-offer`,
  vendorJobPrice: (id: string) => `/vendor/job-offers/${encodeURIComponent(id)}/price`,
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
