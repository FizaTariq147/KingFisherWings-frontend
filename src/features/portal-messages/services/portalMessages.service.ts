import { portalApiClient } from '@/lib/portalApiClient';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { postPortalWithOptionalFile } from '@/features/portal-shared/portalMultipart';
import { safeDownloadFilename, unwrapData } from '@/features/portal-shared/normalize';
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
    const res = await postPortalWithOptionalFile(
      PORTAL_MESSAGES_API.create,
      {
        subject: dto.subject,
        body: dto.body,
        job_id: dto.job_id,
        invoice_id: dto.invoice_id,
      },
      dto.file,
    );
    const item = normalizePortalMessage(unwrapData(res.data) ?? res.data);
    if (!item) throw new Error('Could not send message.');
    return item;
  },

  async reply(id: string, dto: PortalMessageReplyDto): Promise<PortalMessage> {
    const res = await postPortalWithOptionalFile(
      PORTAL_MESSAGES_API.replies(id),
      { body: dto.body },
      dto.file,
    );
    const item =
      normalizePortalMessageDetail(res.data) ??
      normalizePortalMessage(unwrapData(res.data) ?? res.data);
    if (item) return item;
    return this.getById(id);
  },

  async downloadAttachment(id: string, fallbackName = 'message-attachment'): Promise<void> {
    await downloadPortalBlob(
      PORTAL_MESSAGES_API.attachment(id),
      safeDownloadFilename(fallbackName, 'message-attachment'),
      { accept: 'application/octet-stream, */*' },
    );
  },
};
