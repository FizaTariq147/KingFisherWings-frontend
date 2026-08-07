import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalDisputeListParams { page?: number; limit?: number; status?: string; }
export interface PortalDisputeCreateDto { invoice_id: string; reason: string; description: string; }
export interface PortalDispute {
  id: string; invoiceId?: string; invoiceNumber?: string; reason?: string; description?: string;
  status?: string; createdAt?: string; staffNotes?: string;
}
export interface PortalDisputeListResult { items: PortalDispute[]; meta: PortalPaginationMeta; }
