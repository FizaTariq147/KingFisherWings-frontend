export const TARIFF_SERVICE_TYPES = [
  'AIR_EXPORT',
  'AIR_IMPORT',
  'SEA_FCL_EXPORT',
  'SEA_FCL_IMPORT',
  'SEA_LCL_EXPORT',
  'SEA_LCL_IMPORT',
  'LAND',
  'COURIER',
  'CUSTOMS_CLEARANCE',
  'NVOCC_EXPORT',
  'NVOCC_IMPORT',
  'SERVICE_JOB',
  'WAREHOUSE',
] as const;

export type TariffServiceType = (typeof TARIFF_SERVICE_TYPES)[number];

export const TARIFF_SERVICE_TYPE_LABELS: Record<TariffServiceType, string> = {
  AIR_EXPORT: 'Air Export',
  AIR_IMPORT: 'Air Import',
  SEA_FCL_EXPORT: 'Sea FCL Export',
  SEA_FCL_IMPORT: 'Sea FCL Import',
  SEA_LCL_EXPORT: 'Sea LCL Export',
  SEA_LCL_IMPORT: 'Sea LCL Import',
  LAND: 'Land',
  COURIER: 'Courier',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  NVOCC_EXPORT: 'NVOCC Export',
  NVOCC_IMPORT: 'NVOCC Import',
  SERVICE_JOB: 'Service Job',
  WAREHOUSE: 'Warehouse',
};

export const DEFAULT_TARIFF_PAGE_SIZE = 20;
