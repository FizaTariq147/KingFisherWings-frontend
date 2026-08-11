export const VENDOR_DISPUTES_API = {
  list: '/vendor/disputes',
  create: '/vendor/disputes',
  detail: (id: string) => `/vendor/disputes/${encodeURIComponent(id)}`,
} as const;

export const VENDOR_DISPUTE_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as const;
