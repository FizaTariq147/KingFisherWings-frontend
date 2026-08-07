import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalMessageListParams { page?: number; limit?: number; }
export interface PortalMessageCreateDto { subject: string; body: string; job_id?: string; invoice_id?: string; }
export interface PortalMessage {
  id: string; subject: string; body?: string; createdAt?: string; readByStaff?: boolean;
  jobId?: string; invoiceId?: string;
}
export interface PortalMessageListResult { items: PortalMessage[]; meta: PortalPaginationMeta; }
