import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface PortalDocumentListParams {
  page?: number;
  limit?: number;
  source?: 'job' | 'invoice' | string;
  job_id?: string;
  portal_document_type?: string;
  order?: 'asc' | 'desc';
}

export interface PortalDocumentSummary {
  total: number;
  byType: Record<string, number>;
  raw?: Record<string, unknown>;
}

export interface PortalDocumentPermission {
  documentType: string;
  canView: boolean;
  canDownload: boolean;
}

export interface PortalDocumentItem {
  id: string;
  name: string;
  source?: string;
  documentType?: string;
  jobId?: string;
  invoiceId?: string;
  createdAt?: string;
  canDownload?: boolean;
  raw?: Record<string, unknown>;
}

export interface PortalDocumentListResult {
  items: PortalDocumentItem[];
  meta: PortalPaginationMeta;
}
