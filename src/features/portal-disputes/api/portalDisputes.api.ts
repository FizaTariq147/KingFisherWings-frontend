export const PORTAL_DISPUTES_API = {
  list: '/portal/disputes',
  create: '/portal/disputes',
  detail: (id: string) => `/portal/disputes/${encodeURIComponent(id)}`,
  attachment: (id: string) => `/portal/disputes/${encodeURIComponent(id)}/attachment`,
} as const;
export const PORTAL_DISPUTE_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as const;
