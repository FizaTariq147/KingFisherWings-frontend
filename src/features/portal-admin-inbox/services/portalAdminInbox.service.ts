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
   * Air/NVOCC customers often submit before job_id is stamped on the message — we resolve the
   * linked quotation from the job first, then match by quotationId / quoteNumber / jobId.
   */
  async findCustomerPortalBookingForm(filter: {
    jobId?: string;
    quotationId?: string;
    quoteNumber?: string;
    jobTypePrefix?: string;
    jobNumber?: string;
  }): Promise<import('@/features/portal-quotations/utils/portalBookingFormStorage').PortalBookingFormMessagePayload | null> {
    const {
      parsePortalBookingFormMessagePayload,
      portalBookingFormPayloadMatches,
    } = await import('@/features/portal-quotations/utils/portalBookingFormStorage');

    let quotationId = filter.quotationId?.trim() || '';
    let quoteNumber = filter.quoteNumber?.trim() || '';
    const jobId = filter.jobId?.trim() || '';
    const jobNumber = filter.jobNumber?.trim() || '';

    // Resolve quote from job so air submissions (quotationId-only payloads) can match.
    if (jobId && (!quotationId || !quoteNumber)) {
      try {
        const { quotationService } = await import(
          '@/features/quotations/services/quotation.service'
        );
        const linked = await quotationService.findLinkedToJob(jobId, {
          quotationId: quotationId || undefined,
          jobNumber: jobNumber || undefined,
        });
        if (linked) {
          quotationId = quotationId || linked.id;
          quoteNumber =
            quoteNumber ||
            linked.quotation_number ||
            linked.quote_no ||
            '';
        }
      } catch {
        /* continue with raw filter */
      }
    }

    const resolvedFilter = {
      jobId: jobId || undefined,
      quotationId: quotationId || undefined,
      quoteNumber: quoteNumber || undefined,
    };

    const list = await this.listMessages({ page: 1, limit: 100 });
    type Payload = import('@/features/portal-quotations/utils/portalBookingFormStorage').PortalBookingFormMessagePayload;
    const scored: Array<{ score: number; at: string; payload: Payload }> = [];

    for (const msg of list.items) {
      const payload = parsePortalBookingFormMessagePayload(msg.body);
      if (!payload) continue;
      const at = msg.createdAt || payload.submittedAt || '';

      if (portalBookingFormPayloadMatches(payload, resolvedFilter)) {
        scored.push({ score: 100, at, payload });
        continue;
      }

      // Subject often embeds quote number: "[Customer booking form] Q-123 — …"
      if (quoteNumber) {
        const subj = String(msg.subject ?? '').toUpperCase();
        if (subj.includes(quoteNumber.toUpperCase()) && payload.mark_complete) {
          scored.push({ score: 80, at, payload });
        }
      }
    }

    // Soft verify: completed payloads whose quotation points at this job (covers air
    // submissions that only stamped quotationId, not jobId, on the message).
    const softCandidates = list.items
      .map((msg) => {
        const payload = parsePortalBookingFormMessagePayload(msg.body);
        if (!payload?.mark_complete || !payload.quotationId) return null;
        if (
          filter.jobTypePrefix &&
          !String(payload.jobType ?? '')
            .toUpperCase()
            .startsWith(filter.jobTypePrefix.toUpperCase())
        ) {
          return null;
        }
        return { msg, payload };
      })
      .filter(Boolean)
      .slice(0, 15) as Array<{
      msg: (typeof list.items)[number];
      payload: Payload;
    }>;

    if (jobId && softCandidates.length && !scored.some((s) => s.score >= 90)) {
      for (const { msg, payload } of softCandidates) {
        if (scored.some((s) => s.payload.quotationId === payload.quotationId && s.score >= 90)) {
          continue;
        }
        try {
          const { quotationService } = await import(
            '@/features/quotations/services/quotation.service'
          );
          const q = await quotationService.getById(payload.quotationId);
          if (q.job_id === jobId) {
            scored.push({
              score: 90,
              at: msg.createdAt || payload.submittedAt || '',
              payload: { ...payload, jobId },
            });
            break;
          }
        } catch {
          /* skip */
        }
      }
    }

    if (!scored.length) return null;
    scored.sort((a, b) => b.score - a.score || String(b.at).localeCompare(String(a.at)));
    const best = scored[0]?.payload ?? null;
    if (best && jobId && !best.jobId) {
      return { ...best, jobId };
    }
    return best;
  },
};
