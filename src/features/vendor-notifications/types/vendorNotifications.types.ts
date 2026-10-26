import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorNotificationListParams {
  page?: number;
  limit?: number;
  unread_only?: string | boolean;
}

export type VendorAlertKind =
  | 'JOB_OFFER'
  | 'DISPUTE'
  | 'PAYMENT_REQUEST'
  | 'OPEN_INVOICE'
  | 'SYSTEM';

export interface VendorNotification {
  id: string;
  title: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  isRead?: boolean;
  type?: string;
  kind?: VendorAlertKind;
  /** API-resolved vendor path (prefer over client heuristics). */
  linkPath?: string | null;
  href?: string | null;
  entityType?: string;
  jobId?: string;
  invoiceId?: string;
  entityId?: string;
  raw?: Record<string, unknown>;
}

export interface VendorNotificationListResult {
  items: VendorNotification[];
  meta: VendorPaginationMeta;
  /** True when alerts were composed from quotes/disputes/PRs/open invoices. */
  sourcedFromAggregate?: boolean;
}

export interface VendorNotificationOpenResult {
  id: string;
  linkPath: string | null;
  entityType?: string;
  entityId?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
}
