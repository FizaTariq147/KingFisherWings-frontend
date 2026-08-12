import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface AdminPortalMessageListParams {
  page?: number; limit?: number; party_id?: string; unread_only?: string | boolean;
}
export interface AdminPortalMessage {
  id: string;
  subject: string;
  body?: string;
  partyId?: string;
  partyName?: string;
  createdAt?: string;
  isRead?: boolean;
  senderEmail?: string;
  hasAttachment?: boolean;
  replies?: AdminPortalMessageReply[];
}
export interface AdminPortalMessageReply {
  id: string;
  body: string;
  createdAt?: string;
  authorType?: string;
  authorName?: string;
}
export interface AdminPortalMessageListResult {
  items: AdminPortalMessage[];
  meta: PortalPaginationMeta;
}
export interface AdminPortalMessageReplyDto {
  body: string;
}

export interface AdminPortalDispute {
  id: string; invoiceId?: string; invoiceNumber?: string; partyId?: string; partyName?: string;
  reason?: string; description?: string; status?: string; createdAt?: string; staffNotes?: string;
}
export interface ReviewDisputeDto { status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED'; staff_notes?: string; }

export interface AdminCreditLimitRequest {
  id: string; partyId?: string; partyName?: string; requestedLimit?: number; justification?: string;
  status?: string; createdAt?: string; reviewNotes?: string; approvedLimit?: number;
}
export interface ReviewCreditLimitDto {
  status: 'APPROVED' | 'REJECTED'; review_notes?: string; approved_limit?: number;
}
