import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
import type { PortalInvoiceStatus } from '../api/portalInvoices.api';

export interface PortalInvoiceListParams {
  page?: number; limit?: number; status?: PortalInvoiceStatus | string;
  job_id?: string; search?: string; from_date?: string; to_date?: string;
}
export interface PortalInvoiceSummary {
  total: number; outstanding: number; overdue: number; paid: number;
  byStatus: Record<string, number>;
}
export interface PortalInvoiceLine {
  id: string; description: string; quantity?: number; unitPrice?: number; lineTotal?: number;
}
export interface PortalInvoiceListItem {
  id: string; number: string; status?: string; currencyCode?: string;
  invoiceDate?: string; dueDate?: string; totalAmount?: number;
  outstandingBalance?: number; jobId?: string;
}
export interface PortalInvoiceDetail extends PortalInvoiceListItem {
  subtotal?: number; taxTotal?: number; paidAmount?: number; remarks?: string;
  lines: PortalInvoiceLine[];
}
export interface PortalInvoiceListResult { items: PortalInvoiceListItem[]; meta: PortalPaginationMeta; }

