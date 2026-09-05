export const VENDOR_NOTIFICATIONS_API = {
  list: '/vendor/notifications',
  unreadCount: '/vendor/notifications/unread-count',
  read: (id: string) => `/vendor/notifications/${encodeURIComponent(id)}/read`,
  readAll: '/vendor/notifications/read-all',
} as const;
