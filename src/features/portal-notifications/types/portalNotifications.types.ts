import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalNotificationListParams { page?: number; limit?: number; unread_only?: string | boolean; }
export interface PortalNotification {
  id: string;
  title: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  isRead?: boolean;
  type?: string;
  kind?: string;
  /** API-resolved portal path (prefer over client heuristics). */
  linkPath?: string | null;
  /** Legacy / alternate API-supplied path. */
  href?: string | null;
  entityType?: string;
  jobId?: string;
  invoiceId?: string;
  quotationId?: string;
  entityId?: string;
  raw?: Record<string, unknown>;
}
export interface PortalNotificationListResult { items: PortalNotification[]; meta: PortalPaginationMeta; }

export interface PortalNotificationOpenResult {
  id: string;
  linkPath: string | null;
  entityType?: string;
  entityId?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
}
