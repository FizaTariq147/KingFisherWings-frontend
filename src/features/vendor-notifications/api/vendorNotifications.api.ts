/**
 * Dedicated vendor notifications API (list / unread / read / open).
 * Aggregate alerts (quotes, disputes, PRs, open invoices) remain as fallback
 * when the dedicated routes are missing (404/501/405).
 *
 * Set VITE_VENDOR_NOTIFICATIONS_API=false to force aggregate-only mode.
 */
export const VENDOR_NOTIFICATIONS_API = {
  list: '/vendor/notifications',
  unreadCount: '/vendor/notifications/unread-count',
  read: (id: string) => `/vendor/notifications/${encodeURIComponent(id)}/read`,
  open: (id: string) => `/vendor/notifications/${encodeURIComponent(id)}/open`,
  readAll: '/vendor/notifications/read-all',
} as const;

export const VENDOR_ALERT_SOURCE_APIS = [
  '/vendor/quotes',
  '/vendor/disputes',
  '/vendor/payment-requests',
  '/vendor/invoices/open-items',
] as const;

/** Prefer dedicated `/vendor/notifications*` unless explicitly disabled. */
export function vendorNotificationsApiEnabled(): boolean {
  const flag = String(import.meta.env.VITE_VENDOR_NOTIFICATIONS_API || 'true').toLowerCase();
  return flag !== 'false' && flag !== '0' && flag !== 'off';
}
