export const PORTAL_NOTIFICATIONS_API = {
  list: '/portal/notifications',
  unreadCount: '/portal/notifications/unread-count',
  stream: '/portal/notifications/stream',
  read: (id: string) => `/portal/notifications/${encodeURIComponent(id)}/read`,
  readAll: '/portal/notifications/read-all',
} as const;
