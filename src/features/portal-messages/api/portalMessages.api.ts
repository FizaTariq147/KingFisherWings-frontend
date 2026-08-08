export const PORTAL_MESSAGES_API = {
  list: '/portal/messages',
  create: '/portal/messages',
  detail: (id: string) => `/portal/messages/${id}`,
  replies: (id: string) => `/portal/messages/${id}/replies`,
  attachment: (id: string) => `/portal/messages/${id}/attachment`,
} as const;
