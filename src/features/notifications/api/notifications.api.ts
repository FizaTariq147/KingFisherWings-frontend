export const NOTIFICATIONS_API = {
  list: '/notifications',
  unreadCount: '/notifications/unread-count',
  read: (id: string) => `/notifications/${id}/read`,
  readAll: '/notifications/read-all',
} as const;
