import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_MESSAGES_API } from '../api/portalMessages.api';
import type { PortalMessage, PortalMessageCreateDto, PortalMessageListParams, PortalMessageListResult } from '../types/portalMessages.types';
import { normalizePortalMessage, normalizePortalMessageList } from '../utils/normalizePortalMessages';

export const portalMessagesService = {
  async list(params: PortalMessageListParams = {}): Promise<PortalMessageListResult> {
    const res = await portalApiClient.get(PORTAL_MESSAGES_API.list, { params });
    return normalizePortalMessageList(res.data, params);
  },
  async create(dto: PortalMessageCreateDto): Promise<PortalMessage> {
    const res = await portalApiClient.post(PORTAL_MESSAGES_API.create, dto);
    const item = normalizePortalMessage(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not send message.');
    return item;
  },
};
