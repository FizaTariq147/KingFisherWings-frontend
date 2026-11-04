import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unread_only?: string | boolean;
  /**
   * Forward-compatible BE filters (ignored by older APIs).
   * Prefer server-side scoping when the backend supports these.
   */
  audience?: string;
  for_user_id?: string;
  role?: string;
  module?: string;
}

/** Optional BE targeting — preferred over client inference when present. */
export type NotificationTargeting = {
  audience?: string;
  recipientUserIds?: string[];
  roles?: string[];
  permissions?: string[];
  modules?: string[];
};

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
  /** BE targeting when present (audience / roles / permissions / modules / users). */
  targeting?: NotificationTargeting;
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
