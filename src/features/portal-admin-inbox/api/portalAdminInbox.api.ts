export const PORTAL_ADMIN_INBOX_API = {
  messages: '/portal-admin/messages',
  messageDetail: (id: string) => `/portal-admin/messages/${id}`,
  markMessageRead: (id: string) => `/portal-admin/messages/${id}/read`,
  messageReplies: (id: string) => `/portal-admin/messages/${id}/replies`,
  disputes: '/portal-admin/disputes',
  disputeDetail: (id: string) => `/portal-admin/disputes/${id}`,
  reviewDispute: (id: string) => `/portal-admin/disputes/${id}`,
  creditRequests: '/portal-admin/credit-limit-requests',
  reviewCreditRequest: (id: string) => `/portal-admin/credit-limit-requests/${id}`,
} as const;
