import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface NotificationListParams { page?: number; limit?: number; unread_only?: string | boolean; }
export interface AppNotification {
  id: string; title: string; body?: string; createdAt?: string; readAt?: string | null; isRead?: boolean; type?: string;
}
export interface NotificationListResult { items: AppNotification[]; meta: PortalPaginationMeta; }
