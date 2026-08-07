import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalNotificationListParams { page?: number; limit?: number; unread_only?: string | boolean; }
export interface PortalNotification {
  id: string; title: string; body?: string; createdAt?: string; readAt?: string | null; isRead?: boolean; type?: string;
}
export interface PortalNotificationListResult { items: PortalNotification[]; meta: PortalPaginationMeta; }
