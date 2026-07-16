export const BANK_RECON_ROUTE_PREFIX = '/gl/bank-reconciliations';

export const BANK_RECON_API = {
  transfers: '/gl/bank-transfers',
  list: '/gl/bank-reconciliations',
  create: '/gl/bank-reconciliations',
  byId: (id: string) => `/gl/bank-reconciliations/${id}`,
  unmatched: (id: string) => `/gl/bank-reconciliations/${id}/unmatched`,
  lines: (id: string) => `/gl/bank-reconciliations/${id}/lines`,
  lineById: (id: string, lineId: string) =>
    `/gl/bank-reconciliations/${id}/lines/${lineId}`,
  complete: (id: string) => `/gl/bank-reconciliations/${id}/complete`,
} as const;
