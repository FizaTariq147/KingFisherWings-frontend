export const VENDOR_ADMIN_DISPUTES_API = {
  list: '/vendor-admin/disputes',
  detail: (id: string) => `/vendor-admin/disputes/${encodeURIComponent(id)}`,
  review: (id: string) => `/vendor-admin/disputes/${encodeURIComponent(id)}`,
} as const;
