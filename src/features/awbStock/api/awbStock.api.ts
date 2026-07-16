/** AWB Stock REST paths — Swagger tag "AWB Stock". */
export const AWB_STOCK_API = {
  batches: '/awb-stock/batches',
  batch: (id: string) => `/awb-stock/batches/${id}`,
  allocate: (id: string) => `/awb-stock/batches/${id}/allocate`,
  transferBranch: (id: string) => `/awb-stock/batches/${id}/transfer-branch`,
  allocations: '/awb-stock/allocations',
  markUsed: (id: string) => `/awb-stock/allocations/${id}/mark-used`,
  voidAllocation: (id: string) => `/awb-stock/allocations/${id}/void`,
  lowStockReport: '/awb-stock/reports/low-stock',
} as const;

export const AWB_STOCK_ROUTE_PREFIX = '/masters/awb-stock-master';
