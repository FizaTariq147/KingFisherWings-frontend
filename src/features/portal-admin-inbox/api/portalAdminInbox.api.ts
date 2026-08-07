export const PORTAL_ADMIN_INBOX_API = {
  messages: '/portal-admin/messages',
  markMessageRead: (id: string) => `/portal-admin/messages/${id}/read`,
  disputes: '/portal-admin/disputes',
  reviewDispute: (id: string) => `/portal-admin/disputes/${id}`,
  creditRequests: '/portal-admin/credit-limit-requests',
  reviewCreditRequest: (id: string) => `/portal-admin/credit-limit-requests/${id}`,
} as const;
