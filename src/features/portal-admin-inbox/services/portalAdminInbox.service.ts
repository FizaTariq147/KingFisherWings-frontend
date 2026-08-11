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
};
