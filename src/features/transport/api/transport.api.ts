export const TRANSPORT_API = {
  list: '/transport-requests',
  byId: (id: string) => `/transport-requests/${encodeURIComponent(id)}`,
  assign: (id: string) => `/transport-requests/${encodeURIComponent(id)}/assign`,
  confirmPickup: (id: string) =>
    `/transport-requests/${encodeURIComponent(id)}/confirm-pickup`,
  inTransit: (id: string) => `/transport-requests/${encodeURIComponent(id)}/in-transit`,
  delivered: (id: string) => `/transport-requests/${encodeURIComponent(id)}/delivered`,
  cancel: (id: string) => `/transport-requests/${encodeURIComponent(id)}/cancel`,
  recordCost: (id: string) => `/transport-requests/${encodeURIComponent(id)}/record-cost`,
  pdf: (id: string) =>
    `/transport-requests/${encodeURIComponent(id)}/documents/transport-request`,
} as const;
