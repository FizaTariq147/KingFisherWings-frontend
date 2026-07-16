export const VOUCHER_ROUTE_PREFIX = '/gl/vouchers';

export const VOUCHER_API = {
  list: '/gl/vouchers',
  create: '/gl/vouchers',
  byId: (id: string) => `/gl/vouchers/${id}`,
  lines: (id: string) => `/gl/vouchers/${id}/lines`,
  lineById: (id: string, lineId: string) => `/gl/vouchers/${id}/lines/${lineId}`,
  post: (id: string) => `/gl/vouchers/${id}/post`,
  reverse: (id: string) => `/gl/vouchers/${id}/reverse`,
} as const;
