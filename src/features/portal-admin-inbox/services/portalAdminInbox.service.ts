import { axiosInstance } from '@/lib/axios';
import { PORTAL_ADMIN_INBOX_API } from '../api/portalAdminInbox.api';
import type {
  AdminCreditLimitRequest,
  AdminPortalDispute,
  AdminPortalMessageListParams,
  AdminPortalMessageListResult,
  ReviewCreditLimitDto,
  ReviewDisputeDto,
} from '../types/portalAdminInbox.types';
import {
  normalizeAdminCreditRequests,
  normalizeAdminDisputes,
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

  async markMessageRead(id: string): Promise<void> {
    await axiosInstance.post(PORTAL_ADMIN_INBOX_API.markMessageRead(id), undefined, staffGetConfig);
  },

  /** Identical pattern to listCreditRequests — path only differs. */
  async listDisputes(): Promise<AdminPortalDispute[]> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.disputes, staffGetConfig);
    return normalizeAdminDisputes(res.data);
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
