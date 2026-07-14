export const ZIP_DISTANCE_API = {
  list: '/quotations/zip-distances',
  byId: (id: string) => `/quotations/zip-distances/${id}`,
} as const;

export const ZIP_DISTANCE_ROUTE_PREFIX = '/quotations/zip-distance-master';
