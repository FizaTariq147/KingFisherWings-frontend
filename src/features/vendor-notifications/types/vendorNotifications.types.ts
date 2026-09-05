import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';

export interface VendorNotificationListParams {
  page?: number;
  limit?: number;
  unread_only?: string | boolean;
}

export type VendorAlertKind = 'JOB_OFFER' | 'DISPUTE' | 'PAYMENT_REQUEST' | 'SYSTEM';

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
  /** True when alerts were built from jobs/disputes because /vendor/notifications is unavailable. */
  sourcedFromAggregate?: boolean;
}
