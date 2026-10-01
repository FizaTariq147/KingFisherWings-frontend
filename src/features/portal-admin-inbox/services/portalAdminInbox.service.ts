import { axiosInstance } from '@/lib/axios';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_ADMIN_INBOX_API } from '../api/portalAdminInbox.api';
import type {
  AdminCreditLimitRequest,
  AdminPortalDispute,
  AdminPortalMessage,
  AdminPortalMessageListParams,
  AdminPortalMessageListResult,
  AdminPortalMessageReplyDto,
  ReviewCreditLimitDto,
  ReviewDisputeDto,
} from '../types/portalAdminInbox.types';
import {
  normalizeAdminCreditRequests,
  normalizeAdminDispute,
  normalizeAdminDisputes,
  normalizeAdminMessage,
  normalizeAdminMessageList,
} from '../utils/normalizePortalAdminInbox';

/** Same request options as Credit requests / Messages (staff Bearer via axios interceptor). */
const staffGetConfig = { withCredentials: false as const };

export const portalAdminInboxService = {
  async listMessages(params: AdminPortalMessageListParams = {}): Promise<AdminPortalMessageListResult> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.messages, {
      params,
      ...staffGetConfig,
    });
    return normalizeAdminMessageList(res.data, params);
  },

  async getMessage(id: string): Promise<AdminPortalMessage> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.messageDetail(id), staffGetConfig);
    const item = normalizeAdminMessage(res.data?.data ?? res.data);
    if (!item) throw new Error('Message not found.');
    return item;
  },

  async markMessageRead(id: string): Promise<void> {
    await axiosInstance.post(PORTAL_ADMIN_INBOX_API.markMessageRead(id), undefined, staffGetConfig);
  },

  async downloadMessageAttachment(id: string, fallbackName = 'message-attachment'): Promise<void> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.messageAttachment(id), {
      ...staffGetConfig,
      responseType: 'blob',
    });
    const filename =
      filenameFromContentDisposition(
        typeof res.headers['content-disposition'] === 'string'
          ? res.headers['content-disposition']
          : undefined,
      ) || fallbackName;
    triggerBlobDownload(res.data as Blob, filename);
  },

  /** Read attachment text (JSON booking-form payload) without triggering a browser download. */
  async getMessageAttachmentText(id: string): Promise<string | null> {
    try {
      const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.messageAttachment(id), {
        ...staffGetConfig,
        responseType: 'blob',
      });
      const blob = res.data as Blob;
      if (!blob) return null;
      return await blob.text();
    } catch {
      return null;
    }
  },

  async replyToMessage(id: string, dto: AdminPortalMessageReplyDto): Promise<AdminPortalMessage> {
    const res = await axiosInstance.post(PORTAL_ADMIN_INBOX_API.messageReplies(id), dto, staffGetConfig);
    const item = normalizeAdminMessage(res.data?.data ?? res.data);
    if (item) return item;
    return this.getMessage(id);
  },

  async listDisputes(): Promise<AdminPortalDispute[]> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.disputes, staffGetConfig);
    return normalizeAdminDisputes(res.data);
  },

  async getDispute(id: string): Promise<AdminPortalDispute> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.disputeDetail(id), staffGetConfig);
    const item = normalizeAdminDispute(res.data?.data ?? res.data);
    if (!item) throw new Error('Dispute not found.');
    return item;
  },

  async reviewDispute(id: string, dto: ReviewDisputeDto): Promise<void> {
    await axiosInstance.patch(PORTAL_ADMIN_INBOX_API.reviewDispute(id), dto, staffGetConfig);
  },

  async listCreditRequests(): Promise<AdminCreditLimitRequest[]> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.creditRequests, staffGetConfig);
    return normalizeAdminCreditRequests(res.data);
  },

  async reviewCreditRequest(id: string, dto: ReviewCreditLimitDto): Promise<void> {
    await axiosInstance.patch(PORTAL_ADMIN_INBOX_API.reviewCreditRequest(id), dto, staffGetConfig);
  },

  /**
   * Find the latest customer portal booking-form submission (via portal message JSON payload).
   * Used so Ops admin/sales can prefill the Operations booking form.
   *
   * Air/NVOCC customers often submit before job_id is stamped on the message â€” we resolve the
   * linked quotation from the job first, then match by quotationId / quoteNumber / jobId.
   * List endpoints often omit/truncate body â€” hydrate detail for booking-form candidates.
   */
  async findCustomerPortalBookingForm(filter: {
    jobId?: string;
    quotationId?: string;
    quoteNumber?: string;
    jobTypePrefix?: string;
    jobNumber?: string;
    /** NVOCC booking id â€” required match path when job_id is not on the quote yet. */
    bookingId?: string;
  }): Promise<import('@/features/portal-quotations/utils/portalBookingFormStorage').PortalBookingFormMessagePayload | null> {
    const {
      parsePortalBookingFormMessagePayload,
      portalBookingFormPayloadMatches,
      PORTAL_BOOKING_FORM_JSON_START,
    } = await import('@/features/portal-quotations/utils/portalBookingFormStorage');
    const { getRememberedQuotationConverted, findRememberedQuotationIdForJob } = await import(
      '@/features/quotations/utils/quotationConvertedMemory'
    );
    const { readRememberedQuoteForBooking } = await import(
      '@/features/nvocc/utils/quoteBookingLink'
    );

    let quotationId = filter.quotationId?.trim() || '';
    let quoteNumber = filter.quoteNumber?.trim() || '';
    const jobId = filter.jobId?.trim() || '';
    const bookingId = filter.bookingId?.trim() || '';
    const jobNumber = filter.jobNumber?.trim() || '';
    const jobTypePrefix = filter.jobTypePrefix?.trim().toUpperCase() || '';

    let jobCustomerId = '';
    let jobTypeHint = '';

    // Booking â†’ remembered quote (NVOCC often has no job yet).
    if (bookingId && (!quotationId || !quoteNumber)) {
      const remembered = readRememberedQuoteForBooking(bookingId);
      if (remembered?.quotationId) quotationId = quotationId || remembered.quotationId;
      if (remembered?.quoteNumber) quoteNumber = quoteNumber || remembered.quoteNumber;
    }

    // Resolve quote from job so air submissions (quotationId-only payloads) can match.
    if (jobId && (!quotationId || !quoteNumber)) {
      try {
        const { quotationService } = await import(
          '@/features/quotations/services/quotation.service'
        );
        const rememberedQid = findRememberedQuotationIdForJob(jobId);
        const linked = await quotationService.findLinkedToJob(jobId, {
          quotationId: quotationId || rememberedQid || undefined,
          jobNumber: jobNumber || undefined,
          jobType: jobTypePrefix && jobTypePrefix !== 'AIR' ? jobTypePrefix : undefined,
        });
        if (linked) {
          quotationId = quotationId || linked.id;
          quoteNumber =
            quoteNumber ||
            linked.quotation_number ||
            linked.quote_no ||
            '';
        } else if (rememberedQid && !quotationId) {
          try {
            const remembered = await quotationService.getById(rememberedQid);
            quotationId = remembered.id;
            quoteNumber =
              quoteNumber ||
              remembered.quotation_number ||
              remembered.quote_no ||
              '';
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* continue with raw filter */
      }
    }

    if (jobId) {
      try {
        const { jobService } = await import('@/features/jobs/services/job.service');
        const job = await jobService.getById(jobId);
        jobCustomerId = job.shipper_id || job.billing_party_id || job.consignee_id || '';
        jobTypeHint = String(job.job_type ?? '').toUpperCase();
        if ((!quotationId || !quoteNumber) && job.job_type) {
          const { quotationService } = await import(
            '@/features/quotations/services/quotation.service'
          );
          const linked = await quotationService.findLinkedToJob(jobId, {
            quotationId: quotationId || undefined,
            jobNumber: jobNumber || job.job_number || undefined,
            jobType: job.job_type,
            customerId: jobCustomerId || undefined,
          });
          if (linked) {
            quotationId = quotationId || linked.id;
            quoteNumber =
              quoteNumber ||
              linked.quotation_number ||
              linked.quote_no ||
              '';
          }
        }
      } catch {
        /* optional enrichment */
      }
    }

    const resolvedFilter = {
      jobId: jobId || undefined,
      bookingId: bookingId || undefined,
      quotationId: quotationId || undefined,
      quoteNumber: quoteNumber || undefined,
    };

    type Payload = import('@/features/portal-quotations/utils/portalBookingFormStorage').PortalBookingFormMessagePayload;
    type Msg = import('../types/portalAdminInbox.types').AdminPortalMessage;

    const withIds = (payload: Payload): Payload => ({
      ...payload,
      ...(jobId && !payload.jobId ? { jobId } : {}),
      ...(bookingId && !payload.bookingId ? { bookingId } : {}),
      ...(quotationId && !payload.quotationId ? { quotationId } : {}),
      ...(quoteNumber && !payload.quoteNumber ? { quoteNumber } : {}),
    });

    const jobTypeCompatible = (payloadType?: string) => {
      if (!jobTypePrefix) return true;
      const pt = String(payloadType ?? '')
        .toUpperCase()
        .replace(/[\s-]+/g, '_');
      if (!pt) return true;
      if (pt.startsWith(jobTypePrefix)) return true;
      // NVOCC staff UI vs SEA_* quote types (and reverse).
      if (jobTypePrefix === 'NVOCC' && (pt.startsWith('SEA') || pt.startsWith('NVOCC'))) return true;
      if (jobTypePrefix === 'SEA' && (pt.startsWith('NVOCC') || pt.startsWith('SEA'))) return true;
      if (jobTypePrefix === 'AIR' && pt.startsWith('AIR')) return true;
      return false;
    };

    /** Prefer staff-readable form APIs when inbox bridge is empty / truncated. */
    const tryStaffFormPayload = async (): Promise<Payload | null> => {
      const { modeBookingFormIsEmpty } = await import(
        '@/features/jobs/utils/applyPortalPayloadToModeBookingForm'
      );

      if (bookingId) {
        try {
          const { nvoccBookingService } = await import(
            '@/features/nvocc/services/nvocc.service'
          );
          const form = await nvoccBookingService.getBookingForm(bookingId);
          if (!modeBookingFormIsEmpty(form) || form.mark_complete === true) {
            return withIds({
              v: 2,
              quotationId: quotationId || bookingId,
              quoteNumber: quoteNumber || undefined,
              jobType: jobTypeHint || jobTypePrefix || 'NVOCC_EXPORT',
              jobId: jobId || undefined,
              bookingId,
              submittedAt: new Date().toISOString(),
              mark_complete: form.mark_complete === true,
              date_of_request: form.date_of_request,
              voyage_ref: form.voyage_ref,
              client_booking_no: form.client_booking_no,
              gross_weight_kg: form.gross_weight_kg,
              net_weight_kg: form.net_weight_kg,
              pol: form.pol,
              pod: form.pod,
              shipper_owned_container: form.shipper_owned_container,
              is_dg: form.is_dg,
              teu_count: form.teu_count,
              containers: form.containers,
              service_scope: form.service_scope,
              origin_door_address: form.origin_door_address,
              dest_door_address: form.dest_door_address,
              commodity: form.commodity,
              hs_code: form.hs_code,
              final_use: form.final_use,
              activity_sector: form.activity_sector,
              insurance_details: form.insurance_details,
              lc_bank_details: form.lc_bank_details,
              attach_commercial_invoice: form.attach_commercial_invoice,
              attach_correspondence: form.attach_correspondence,
              attach_cod_form: form.attach_cod_form,
              attach_licence: form.attach_licence,
              booking_agent_line: form.booking_agent_line,
              agent_requester_name: form.agent_requester_name,
              sq_bl_booking_reference: form.sq_bl_booking_reference,
              request_details: form.request_details,
              consent_accepted: form.consent_accepted,
              parties: form.parties,
            });
          }
        } catch {
          /* continue */
        }
      }

      if (jobId && (jobTypePrefix === 'AIR' || jobTypeHint.startsWith('AIR'))) {
        try {
          const { jobService } = await import('@/features/jobs/services/job.service');
          const form = await jobService.getAirComplianceForm(jobId);
          if (!modeBookingFormIsEmpty(form) || form.mark_complete === true) {
            return withIds({
              v: 2,
              quotationId: quotationId || jobId,
              quoteNumber: quoteNumber || undefined,
              jobType: jobTypeHint || 'AIR_EXPORT',
              jobId,
              submittedAt: new Date().toISOString(),
              mark_complete: form.mark_complete === true,
              ...form,
              parties: form.parties,
            });
          }
        } catch {
          /* continue */
        }
      }

      return null;
    };

    const looksLikeBookingFormSubject = (subject?: string) =>
      /customer booking form/i.test(String(subject ?? ''));

    const textHasNeedle = (hay?: string, needle?: string) => {
      const n = String(needle ?? '').trim().toUpperCase();
      if (!n) return false;
      return String(hay ?? '')
        .toUpperCase()
        .includes(n);
    };

    const parsePayloadLoose = (raw?: string | null): Payload | null => {
      if (!raw) return null;
      const fromMarkers = parsePortalBookingFormMessagePayload(raw);
      if (fromMarkers) return fromMarkers;
      try {
        const parsed = JSON.parse(raw) as Payload;
        if (parsed && parsed.quotationId && (parsed.v === 1 || parsed.v === 2)) return parsed;
      } catch {
        /* not raw json */
      }
      return null;
    };

    const bodyNeedsHydrate = (msg: Msg) => {
      const body = msg.body ?? '';
      if (!body) return looksLikeBookingFormSubject(msg.subject) || Boolean(msg.hasAttachment);
      if (body.includes(PORTAL_BOOKING_FORM_JSON_START)) {
        return !parsePortalBookingFormMessagePayload(body);
      }
      return looksLikeBookingFormSubject(msg.subject);
    };

    const hydrateMessage = async (msg: Msg): Promise<Msg & { attachmentText?: string }> => {
      let next: Msg & { attachmentText?: string } = msg;
      if (bodyNeedsHydrate(msg)) {
        try {
          const full = await this.getMessage(msg.id);
          next = {
            ...msg,
            body: full.body || msg.body,
            jobId: full.jobId || msg.jobId,
            subject: full.subject || msg.subject,
            hasAttachment: full.hasAttachment ?? msg.hasAttachment,
          };
        } catch {
          /* keep list row */
        }
      }
      if (
        !parsePayloadLoose(next.body) &&
        (next.hasAttachment || looksLikeBookingFormSubject(next.subject))
      ) {
        const attachmentText = await this.getMessageAttachmentText(next.id);
        if (attachmentText) next = { ...next, attachmentText };
      }
      return next;
    };

    const collected: Msg[] = [];
    for (let page = 1; page <= 8; page += 1) {
      try {
        const list = await this.listMessages({ page, limit: 100 });
        collected.push(...list.items);
        const totalPages = list.meta?.totalPages;
        if (typeof totalPages === 'number' && page >= totalPages) break;
        if (list.items.length < 100) break;
      } catch {
        break;
      }
    }

    const scored: Array<{ score: number; at: string; payload: Payload }> = [];
    const seenPayloadKeys = new Set<string>();

    const pushScore = (score: number, at: string, payload: Payload) => {
      const key = `${payload.quotationId}:${payload.submittedAt || ''}:${payload.mark_complete ? 1 : 0}`;
      if (seenPayloadKeys.has(key) && score < 100) return;
      seenPayloadKeys.add(key);
      scored.push({ score, at, payload });
    };

    for (const rawMsg of collected) {
      const subjectTokens =
        textHasNeedle(rawMsg.subject, quotationId) ||
        textHasNeedle(rawMsg.subject, bookingId) ||
        textHasNeedle(rawMsg.subject, quoteNumber) ||
        textHasNeedle(rawMsg.subject, jobId) ||
        textHasNeedle(rawMsg.subject, `qid:${quotationId}`) ||
        textHasNeedle(rawMsg.subject, `bid:${bookingId}`);
      const msgJobMatch = Boolean(jobId && rawMsg.jobId && rawMsg.jobId === jobId);
      const msgBookingMatch = Boolean(
        bookingId && rawMsg.jobId && rawMsg.jobId === bookingId,
      );
      const subjectHint =
        looksLikeBookingFormSubject(rawMsg.subject) &&
        (subjectTokens ||
          textHasNeedle(rawMsg.subject, jobNumber));
      const bookingFormCandidate = looksLikeBookingFormSubject(rawMsg.subject);

      if (
        !msgJobMatch &&
        !msgBookingMatch &&
        !subjectHint &&
        !bookingFormCandidate &&
        !subjectTokens
      ) {
        const early = parsePayloadLoose(rawMsg.body);
        if (!early) continue;
      }

      const msg = await hydrateMessage(rawMsg);
      const payload =
        parsePayloadLoose(msg.body) || parsePayloadLoose(msg.attachmentText);
      if (!payload) {
        // Subject carries qid/bid even when body/attachment failed — still useful for soft path later.
        continue;
      }
      const at = msg.createdAt || payload.submittedAt || '';

      const hardIdMatch =
        msgJobMatch ||
        msgBookingMatch ||
        (jobId && payload.jobId === jobId) ||
        (bookingId &&
          (payload.bookingId === bookingId || payload.jobId === bookingId)) ||
        portalBookingFormPayloadMatches(payload, resolvedFilter) ||
        subjectTokens;

      // Never drop a hard id/subject match solely because jobType labels differ (NVOCC vs SEA).
      if (!hardIdMatch && jobTypePrefix && !jobTypeCompatible(payload.jobType)) {
        continue;
      }

      if (msgJobMatch || (jobId && payload.jobId === jobId)) {
        pushScore(100, at, withIds(payload));
        continue;
      }

      if (
        msgBookingMatch ||
        (bookingId &&
          (payload.bookingId === bookingId || payload.jobId === bookingId))
      ) {
        pushScore(100, at, withIds(payload));
        continue;
      }

      if (portalBookingFormPayloadMatches(payload, resolvedFilter)) {
        pushScore(100, at, withIds(payload));
        continue;
      }

      if (
        bookingId &&
        payload.mark_complete &&
        (textHasNeedle(msg.body, bookingId) ||
          textHasNeedle(msg.subject, bookingId) ||
          textHasNeedle(msg.attachmentText, bookingId))
      ) {
        pushScore(95, at, withIds({ ...payload, bookingId }));
        continue;
      }

      if (subjectHint && payload.mark_complete) {
        pushScore(80, at, withIds(payload));
      }
    }

    // Soft verify without requiring jobId (NVOCC pre-convert) or when quote link is weak.
    if (!scored.some((s) => s.score >= 90)) {
      const softCandidates: Array<{ msg: Msg; payload: Payload }> = [];
      for (const rawMsg of collected) {
        if (
          !looksLikeBookingFormSubject(rawMsg.subject) &&
          !rawMsg.body?.includes(PORTAL_BOOKING_FORM_JSON_START) &&
          !rawMsg.hasAttachment
        ) {
          continue;
        }
        const msg = await hydrateMessage(rawMsg);
        const payload =
          parsePayloadLoose(msg.body) || parsePayloadLoose(msg.attachmentText);
        if (!payload?.mark_complete || !payload.quotationId) continue;
        if (!jobTypeCompatible(payload.jobType)) continue;
        softCandidates.push({ msg, payload });
        if (softCandidates.length >= 40) break;
      }

      for (const { msg, payload } of softCandidates) {
        if (scored.some((s) => s.payload.quotationId === payload.quotationId && s.score >= 90)) {
          continue;
        }
        try {
          if (bookingId && (payload.bookingId === bookingId || payload.jobId === bookingId)) {
            pushScore(98, msg.createdAt || payload.submittedAt || '', withIds(payload));
            break;
          }

          if (jobId) {
            const remembered = getRememberedQuotationConverted(payload.quotationId);
            if (remembered?.jobId === jobId) {
              pushScore(95, msg.createdAt || payload.submittedAt || '', withIds(payload));
              break;
            }
          }

          const { quotationService } = await import(
            '@/features/quotations/services/quotation.service'
          );
          const q = await quotationService.getById(payload.quotationId);
          if (jobId && q.job_id === jobId) {
            pushScore(90, msg.createdAt || payload.submittedAt || '', withIds(payload));
            break;
          }

          if (quotationId && payload.quotationId === quotationId) {
            pushScore(92, msg.createdAt || payload.submittedAt || '', withIds(payload));
            break;
          }

          if (
            quoteNumber &&
            (payload.quoteNumber?.trim().toUpperCase() === quoteNumber.toUpperCase() ||
              textHasNeedle(msg.subject, quoteNumber) ||
              textHasNeedle(msg.body, quoteNumber))
          ) {
            pushScore(90, msg.createdAt || payload.submittedAt || '', withIds(payload));
            break;
          }

          const qCustomer = q.customer_id || '';
          const qType = String(q.job_type ?? payload.jobType ?? '')
            .toUpperCase()
            .replace(/[\s-]+/g, '_');
          const jType = (jobTypeHint || jobTypePrefix || '').toUpperCase();
          const sameFamily =
            Boolean(jType) &&
            Boolean(qType) &&
            (qType.startsWith(jType.split('_')[0] || jType) ||
              jType.startsWith(qType.split('_')[0] || qType) ||
              (jType.startsWith('NVOCC') && qType.startsWith('SEA')) ||
              (jType.startsWith('SEA') && qType.startsWith('NVOCC')));
          if (jobCustomerId && qCustomer && qCustomer === jobCustomerId && sameFamily) {
            pushScore(75, msg.createdAt || payload.submittedAt || '', withIds(payload));
            continue;
          }
        } catch {
          /* skip */
        }
      }
    }

    if (scored.length) {
      scored.sort((a, b) => b.score - a.score || String(b.at).localeCompare(String(a.at)));
      const best = scored[0]?.payload;
      if (best) return withIds(best);
    }

    // Inbox empty / unmatched — fall back to staff booking/compliance form APIs.
    return tryStaffFormPayload();
  },
};
