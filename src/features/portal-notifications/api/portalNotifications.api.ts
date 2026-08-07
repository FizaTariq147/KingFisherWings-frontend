export const PORTAL_NOTIFICATIONS_API = {
  list: '/portal/notifications',
  unreadCount: '/portal/notifications/unread-count',
  read: (id: string) => `/portal/notifications/${id}/read`,
  readAll: '/portal/notifications/read-all',
} as const;
