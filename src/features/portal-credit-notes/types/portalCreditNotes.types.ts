import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface PortalCreditNoteListParams {
  page?: number; limit?: number; status?: string; job_id?: string;
  search?: string; from_date?: string; to_date?: string;
}
export interface PortalCreditNoteLine {
  id: string; description: string; quantity?: number; unitPrice?: number; lineTotal?: number;
}
export interface PortalCreditNoteListItem {
  id: string;
  number: string;
  status?: string;
  currencyCode?: string;
  creditDate?: string;
  totalAmount?: number;
  creditedInvoiceId?: string;
  creditedInvoiceNumber?: string;
  kind?: 'credit' | 'debit';
}
export interface PortalCreditNoteDetail extends PortalCreditNoteListItem {
  remarks?: string; lines: PortalCreditNoteLine[];
}
export interface PortalCreditNoteListResult { items: PortalCreditNoteListItem[]; meta: PortalPaginationMeta; }

