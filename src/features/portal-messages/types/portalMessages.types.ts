import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface PortalMessageListParams {
  page?: number;
  limit?: number;
}

export interface PortalMessageCreateDto {
  subject: string;
  body: string;
  job_id?: string;
  invoice_id?: string;
  file?: File;
}

export interface PortalMessageReplyDto {
  body: string;
  file?: File;
}

export interface PortalMessageReply {
  id: string;
  body: string;
  createdAt?: string;
  authorType?: string;
  authorName?: string;
}

export interface PortalMessage {
  id: string;
  subject: string;
  body?: string;
  createdAt?: string;
  readByStaff?: boolean;
  jobId?: string;
  invoiceId?: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  senderName?: string;
  senderEmail?: string;
  partyName?: string;
  replies?: PortalMessageReply[];
}

export interface PortalMessageListResult {
  items: PortalMessage[];
  meta: PortalPaginationMeta;
}
