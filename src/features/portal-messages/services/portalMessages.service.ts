import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_MESSAGES_API } from '../api/portalMessages.api';
import type {
  PortalMessage,
  PortalMessageCreateDto,
  PortalMessageListParams,
  PortalMessageListResult,
  PortalMessageReplyDto,
} from '../types/portalMessages.types';
import {
  normalizePortalMessage,
  normalizePortalMessageDetail,
  normalizePortalMessageList,
} from '../utils/normalizePortalMessages';

export const portalMessagesService = {
  async list(params: PortalMessageListParams = {}): Promise<PortalMessageListResult> {
    const res = await portalApiClient.get(PORTAL_MESSAGES_API.list, { params });
    return normalizePortalMessageList(res.data, params);
  },

  async getById(id: string): Promise<PortalMessage> {
    const res = await portalApiClient.get(PORTAL_MESSAGES_API.detail(id));
    const item = normalizePortalMessageDetail(res.data);
    if (!item) throw new Error('Message not found.');
    return item;
  },

  async create(dto: PortalMessageCreateDto): Promise<PortalMessage> {
    const res = await portalApiClient.post(PORTAL_MESSAGES_API.create, dto);
    const item = normalizePortalMessage(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not send message.');
    return item;
  },

  async reply(id: string, dto: PortalMessageReplyDto): Promise<PortalMessage> {
    const res = await portalApiClient.post(PORTAL_MESSAGES_API.replies(id), dto);
    const item = normalizePortalMessageDetail(res.data) ?? normalizePortalMessage(res.data?.data ?? res.data);
    if (item) return item;
    return this.getById(id);
  },

  async downloadAttachment(id: string, fallbackName = 'message-attachment'): Promise<void> {
    const res = await portalApiClient.get(PORTAL_MESSAGES_API.attachment(id), {
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
};
