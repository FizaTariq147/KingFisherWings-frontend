export const NOTIFICATIONS_API = {
  list: '/notifications',
  unreadCount: '/notifications/unread-count',
  read: (id: string) => `/notifications/${id}/read`,
  /** Mark read + return deep-link payload (`link_path`). */
  open: (id: string) => `/notifications/${id}/open`,
  readAll: '/notifications/read-all',
} as const;
