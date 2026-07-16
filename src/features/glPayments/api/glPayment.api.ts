export const GL_PAYMENT_ROUTE_PREFIX = '/gl/payments';

export const GL_PAYMENT_API = {
  list: '/gl/payments',
  create: '/gl/payments',
  byId: (id: string) => `/gl/payments/${id}`,
  allocations: (id: string) => `/gl/payments/${id}/allocations`,
  allocationById: (id: string, allocationId: string) =>
    `/gl/payments/${id}/allocations/${allocationId}`,
  post: (id: string) => `/gl/payments/${id}/post`,
  cancel: (id: string) => `/gl/payments/${id}/cancel`,
} as const;
