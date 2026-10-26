import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unread_only?: string | boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  isRead?: boolean;
  type?: string;
  kind?: string;
  /** API-resolved in-app path (prefer over client heuristics). */
  linkPath?: string | null;
  /** Legacy / alternate API-supplied path. */
  href?: string | null;
  entityType?: string;
  entityId?: string;
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
  enquiryId?: string;
  invoiceId?: string;
  raw?: Record<string, unknown>;
}

export interface NotificationListResult {
  items: AppNotification[];
  meta: PortalPaginationMeta;
}

/** POST /notifications/:id/open (and portal/vendor equivalents). */
export interface NotificationOpenResult {
  id: string;
  linkPath: string | null;
  entityType?: string;
  entityId?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
}
