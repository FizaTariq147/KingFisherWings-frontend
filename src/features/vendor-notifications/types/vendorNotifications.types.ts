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
  href?: string | null;
  jobId?: string;
  invoiceId?: string;
  entityId?: string;
  raw?: Record<string, unknown>;
}

export interface VendorNotificationListResult {
  items: VendorNotification[];
  meta: VendorPaginationMeta;
  /**
   * Always true on current backend — alerts are composed from quotes / disputes /
   * payment-requests / open invoices (no dedicated notifications API in Swagger).
   */
  sourcedFromAggregate?: boolean;
}
