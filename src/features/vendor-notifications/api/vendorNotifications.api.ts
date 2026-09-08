/**
 * Live Swagger (kingfisherwings-backend) has NO `/vendor/notifications*` routes.
 * Vendor Alerts are composed from these existing endpoints:
 * - GET /vendor/quotes
 * - GET /vendor/disputes
 * - GET /vendor/payment-requests
 * - GET /vendor/invoices/open-items
 *
 * Optional: set VITE_VENDOR_NOTIFICATIONS_API=true if a notifications API is deployed later.
 */
export const VENDOR_NOTIFICATIONS_API = {
  list: '/vendor/notifications',
  unreadCount: '/vendor/notifications/unread-count',
  read: (id: string) => `/vendor/notifications/${encodeURIComponent(id)}/read`,
  readAll: '/vendor/notifications/read-all',
} as const;

export const VENDOR_ALERT_SOURCE_APIS = [
  '/vendor/quotes',
  '/vendor/disputes',
  '/vendor/payment-requests',
  '/vendor/invoices/open-items',
] as const;

export function vendorNotificationsApiEnabled(): boolean {
  return String(import.meta.env.VITE_VENDOR_NOTIFICATIONS_API || '').toLowerCase() === 'true';
}
