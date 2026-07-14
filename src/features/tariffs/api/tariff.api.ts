export const TARIFF_API = {
  list: '/quotations/tariffs',
  byId: (id: string) => `/quotations/tariffs/${id}`,
} as const;

export const TARIFF_ROUTE_PREFIX = '/quotations/tariff-master';
