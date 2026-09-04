import axios from 'axios';
import { axiosInstance } from '@/lib/axios';
import { VendorApiError, vendorApiClient } from '@/lib/vendorApiClient';
import { normalizeNegotiationTimeline } from '@/features/quotations/utils/normalizeQuotationExtended';
import { VENDOR_JOB_OFFERS_API } from '../api/vendorJobOffers.api';
import type {
  DisapproveVendorOfferDto,
  PassJobToVendorDto,
  ReviewVendorOfferDto,
  SubmitVendorJobPricingDto,
  VendorCounterOfferDto,
  VendorJobOffer,
  VendorJobPricingResult,
  VendorNegotiationAcceptDto,
  VendorNegotiationRejectDto,
  VendorOfferNegotiationTimeline,
  VendorPortalJobDetail,
  VendorPortalJobListParams,
  VendorPortalJobListResult,
  VendorReviseAndSendDto,
} from '../types/vendorJobOffers.types';
import {
  normalizeVendorJobOffer,
  normalizeVendorJobOfferList,
  normalizeVendorJobPricing,
  normalizeVendorPortalJobDetail,
  normalizeVendorPortalJobList,
} from '../utils/normalizeVendorJobOffers';
import { fulfillApprovedVendorOffer } from '../utils/fulfillApprovedVendorOffer';
import { coerceVendorOfferStatus } from '../utils/vendorOfferStatus';

function isNotFound(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    return status === 404 || status === 501;
  }
  if (err instanceof VendorApiError) {
    return err.status === 404 || err.status === 501;
  }
  return false;
}

function friendlyUnavailable(action: string): Error {
  return new Error(
    `${action} is not available yet (API returned 404). Deploy the vendor job-offers backend to enable this.`,
  );
}

function mapLines(lines?: PassJobToVendorDto['lines']) {
  if (!lines?.length) return undefined;
  return lines.map((line) => ({
    ...(line.line_id ? { line_id: line.line_id } : {}),
    description: line.description,
    quantity: line.quantity ?? 1,
    unit_price: line.unit_price,
    ...(line.amount != null ? { amount: line.amount } : {}),
  }));
}

/** Staff ERP — pass jobs, revise, accept/reject counters, approve/disapprove. */
export const staffVendorJobOffersService = {
  async passToVendor(jobId: string, dto: PassJobToVendorDto): Promise<VendorJobOffer | null> {
    try {
      const vendorId = dto.vendor_party_id.trim();
      const notes = dto.notes?.trim() || dto.message?.trim();
      const currency = dto.currency_code?.trim().toUpperCase();
      const body = {
        vendor_party_id: vendorId,
        vendor_id: vendorId,
        party_id: vendorId,
        job_id: jobId,
        ...(dto.proposed_total != null ? { proposed_total: dto.proposed_total } : {}),
        ...(mapLines(dto.lines) ? { lines: mapLines(dto.lines) } : {}),
        ...(notes ? { notes, staff_notes: notes, message: notes } : {}),
        ...(currency ? { currency_code: currency } : {}),
      };
      const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.passToVendor(jobId), body);
      return normalizeVendorJobOffer(res.data);
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Pass to vendor');
      throw err;
    }
  },

  async listOffers(jobId: string): Promise<VendorJobOffer[]> {
    const paths = [
      VENDOR_JOB_OFFERS_API.vendorOffers(jobId),
      VENDOR_JOB_OFFERS_API.vendorOffersAlt(jobId),
      VENDOR_JOB_OFFERS_API.vendorOffersLegacy(jobId),
    ];
    let lastErr: unknown;
    for (const path of paths) {
      try {
        const res = await axiosInstance.get(path);
        const offers = normalizeVendorJobOfferList(res.data);
        // If vendor already accepted (APPROVED) and no bill exists yet, best-effort create PI.
        return Promise.all(
          offers.map(async (offer) => {
            if (
              coerceVendorOfferStatus(offer.status) !== 'APPROVED' ||
              offer.purchaseInvoiceId ||
              offer.invoiceId
            ) {
              return offer;
            }
            const attemptKey = `kfw.vendorOfferPi.${offer.id}`;
            try {
              if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(attemptKey)) {
                return offer;
              }
              if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(attemptKey, '1');
            } catch {
              /* ignore storage errors */
            }
            return (await fulfillApprovedVendorOffer(offer)) ?? offer;
          }),
        );
      } catch (err) {
        lastErr = err;
        if (!isNotFound(err)) throw err;
      }
    }
    if (isNotFound(lastErr)) return [];
    throw lastErr;
  },

  async getNegotiation(offerId: string): Promise<VendorOfferNegotiationTimeline> {
    try {
      const res = await axiosInstance.get(VENDOR_JOB_OFFERS_API.staffNegotiation(offerId));
      return normalizeNegotiationTimeline(res.data);
    } catch (err) {
      if (isNotFound(err)) return { events: [] };
      throw err;
    }
  },

  async reviseAndSend(offerId: string, dto: VendorReviseAndSendDto): Promise<VendorJobOffer | null> {
    try {
      const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.staffReviseAndSend(offerId), {
        message: dto.message.trim(),
        ...(dto.proposed_total != null ? { proposed_total: dto.proposed_total } : {}),
        ...(mapLines(dto.lines) ? { lines: mapLines(dto.lines) } : {}),
      });
      return normalizeVendorJobOffer(res.data);
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Revise and send');
      throw err;
    }
  },

  async acceptCounter(
    offerId: string,
    dto: VendorNegotiationAcceptDto = {},
  ): Promise<VendorJobOffer | null> {
    try {
      const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.staffAcceptCounter(offerId), {
        ...(dto.message?.trim() ? { message: dto.message.trim() } : {}),
        ...(dto.comments?.trim() ? { comments: dto.comments.trim() } : {}),
      });
      const offer = normalizeVendorJobOffer(res.data);
      if (offer && coerceVendorOfferStatus(offer.status) === 'APPROVED') {
        return fulfillApprovedVendorOffer(offer);
      }
      return offer;
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Accept vendor counter');
      throw err;
    }
  },

  async rejectCounter(
    offerId: string,
    dto: VendorNegotiationRejectDto,
  ): Promise<VendorJobOffer | null> {
    try {
      const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.staffRejectCounter(offerId), {
        message: dto.message.trim(),
        ...(dto.terminal != null ? { terminal: dto.terminal } : {}),
      });
      return normalizeVendorJobOffer(res.data);
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Reject vendor counter');
      throw err;
    }
  },

  async approveOffer(
    _jobId: string,
    offerId: string,
    dto: ReviewVendorOfferDto = {},
  ): Promise<VendorJobOffer | null> {
    const body = {
      ...(dto.review_notes?.trim() ? { review_notes: dto.review_notes.trim() } : {}),
    };
    try {
      const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.approveOffer(offerId), body);
      const offer = normalizeVendorJobOffer(res.data);
      return fulfillApprovedVendorOffer(offer);
    } catch (err) {
      if (isNotFound(err)) {
        try {
          const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.approveOfferAlt(offerId), body);
          const offer = normalizeVendorJobOffer(res.data);
          return fulfillApprovedVendorOffer(offer);
        } catch (legacyErr) {
          if (isNotFound(legacyErr)) throw friendlyUnavailable('Approve vendor offer');
          throw legacyErr;
        }
      }
      throw err;
    }
  },

  async disapproveOffer(
    _jobId: string,
    offerId: string,
    dto: DisapproveVendorOfferDto,
  ): Promise<VendorJobOffer | null> {
    const body = { review_notes: dto.review_notes.trim() };
    try {
      const res = await axiosInstance.post(VENDOR_JOB_OFFERS_API.disapproveOffer(offerId), body);
      return normalizeVendorJobOffer(res.data);
    } catch (err) {
      if (isNotFound(err)) {
        try {
          const res = await axiosInstance.post(
            VENDOR_JOB_OFFERS_API.disapproveOfferAlt(offerId),
            body,
          );
          return normalizeVendorJobOffer(res.data);
        } catch (legacyErr) {
          if (isNotFound(legacyErr)) throw friendlyUnavailable('Disapprove vendor offer');
          throw legacyErr;
        }
      }
      throw err;
    }
  },
};

/** Vendor portal — job offers + cost negotiation (no customer revenue). */
export const vendorPortalJobsService = {
  async list(params: VendorPortalJobListParams = {}): Promise<VendorPortalJobListResult> {
    try {
      const res = await vendorApiClient.get(VENDOR_JOB_OFFERS_API.vendorJobs, { params });
      return normalizeVendorPortalJobList(res.data, params);
    } catch (err) {
      if (isNotFound(err)) {
        return {
          items: [],
          meta: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            total: 0,
            totalPages: 1,
          },
        };
      }
      throw err;
    }
  },

  async getById(id: string): Promise<VendorPortalJobDetail> {
    try {
      const res = await vendorApiClient.get(VENDOR_JOB_OFFERS_API.vendorJob(id));
      const detail = normalizeVendorPortalJobDetail(res.data);
      if (!detail) throw new VendorApiError('Job offer not found.', 404);
      return detail;
    } catch (err) {
      if (isNotFound(err)) {
        throw new VendorApiError(
          'Vendor job offer APIs are not available yet.',
          err instanceof VendorApiError ? err.status : 404,
        );
      }
      throw err;
    }
  },

  async getNegotiation(id: string): Promise<VendorOfferNegotiationTimeline> {
    try {
      const res = await vendorApiClient.get(VENDOR_JOB_OFFERS_API.vendorNegotiation(id));
      return normalizeNegotiationTimeline(res.data);
    } catch (err) {
      if (isNotFound(err)) return { events: [] };
      throw err;
    }
  },

  async getPricing(id: string): Promise<VendorJobPricingResult> {
    try {
      const detail = await this.getById(id);
      return {
        jobId: detail.id,
        offerId: detail.offerId || detail.id,
        status: detail.offerStatus,
        notes: detail.pricingNotes,
        lines: detail.lines,
        currencyCode: detail.currencyCode,
        totalAmount: detail.totalAmount ?? detail.costTotal,
        costTotal: detail.costTotal ?? detail.totalAmount,
        negotiationPricing: detail.negotiationPricing,
        updatedAt: detail.updatedAt,
      };
    } catch (err) {
      if (isNotFound(err)) {
        return { jobId: id, lines: [], status: 'SENT' };
      }
      throw err;
    }
  },

  async accept(id: string, dto: VendorNegotiationAcceptDto = {}): Promise<VendorPortalJobDetail> {
    try {
      const res = await vendorApiClient.post(VENDOR_JOB_OFFERS_API.vendorAccept(id), {
        ...(dto.message?.trim() ? { message: dto.message.trim() } : {}),
        ...(dto.comments?.trim() ? { comments: dto.comments.trim() } : {}),
      });
      return normalizeVendorPortalJobDetail(res.data) ?? (await this.getById(id));
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Accept cost offer');
      throw err;
    }
  },

  async reject(id: string, dto: VendorNegotiationRejectDto): Promise<VendorPortalJobDetail> {
    try {
      const res = await vendorApiClient.post(VENDOR_JOB_OFFERS_API.vendorReject(id), {
        message: dto.message.trim(),
        ...(dto.terminal != null ? { terminal: dto.terminal } : {}),
      });
      return normalizeVendorPortalJobDetail(res.data) ?? (await this.getById(id));
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Reject cost offer');
      throw err;
    }
  },

  async counterOffer(id: string, dto: VendorCounterOfferDto): Promise<VendorPortalJobDetail> {
    try {
      const res = await vendorApiClient.post(VENDOR_JOB_OFFERS_API.vendorCounterOffer(id), {
        message: dto.message.trim(),
        proposed_total: dto.proposed_total,
        ...(dto.proposed_lines?.length
          ? {
              proposed_lines: dto.proposed_lines.map((line) => ({
                description: line.description,
                quantity: line.quantity ?? 1,
                unit_price: line.unit_price,
                ...(line.amount != null ? { amount: line.amount } : {}),
              })),
            }
          : {}),
      });
      return normalizeVendorPortalJobDetail(res.data) ?? (await this.getById(id));
    } catch (err) {
      if (isNotFound(err)) throw friendlyUnavailable('Counter cost offer');
      throw err;
    }
  },

  /** Alias of counter-offer (legacy /price). */
  async submitPricing(id: string, dto: SubmitVendorJobPricingDto): Promise<VendorJobPricingResult> {
    try {
      const message = dto.message?.trim() || dto.notes?.trim() || 'Vendor pricing submitted';
      const proposedTotal =
        dto.proposed_total ??
        dto.lines.reduce((sum, line) => sum + (line.amount ?? line.quantity * line.unit_price), 0);
      const res = await vendorApiClient.post(VENDOR_JOB_OFFERS_API.vendorJobPrice(id), {
        lines: dto.lines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          ...(line.amount != null ? { amount: line.amount } : {}),
        })),
        proposed_total: proposedTotal,
        ...(dto.notes?.trim() ? { vendor_notes: dto.notes.trim() } : {}),
        message,
      });
      return normalizeVendorJobPricing(res.data, id);
    } catch (err) {
      if (isNotFound(err)) {
        // Prefer explicit counter-offer path.
        const detail = await this.counterOffer(id, {
          message: dto.message?.trim() || dto.notes?.trim() || 'Vendor counter',
          proposed_total:
            dto.proposed_total ??
            dto.lines.reduce((sum, line) => sum + (line.amount ?? line.quantity * line.unit_price), 0),
          proposed_lines: dto.lines.map((line) => ({
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            amount: line.amount,
          })),
        });
        return {
          jobId: detail.id,
          offerId: detail.offerId || detail.id,
          status: detail.offerStatus,
          notes: detail.pricingNotes,
          lines: detail.lines,
          currencyCode: detail.currencyCode,
          totalAmount: detail.totalAmount ?? detail.costTotal,
          costTotal: detail.costTotal ?? detail.totalAmount,
          negotiationPricing: detail.negotiationPricing,
          updatedAt: detail.updatedAt,
        };
      }
      throw err;
    }
  },
};
