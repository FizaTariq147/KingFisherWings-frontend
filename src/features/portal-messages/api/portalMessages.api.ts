export const PORTAL_MESSAGES_API = {
  list: '/portal/messages',
  create: '/portal/messages',
  detail: (id: string) => `/portal/messages/${encodeURIComponent(id)}`,
  replies: (id: string) => `/portal/messages/${encodeURIComponent(id)}/replies`,
  attachment: (id: string) => `/portal/messages/${encodeURIComponent(id)}/attachment`,
} as const;
