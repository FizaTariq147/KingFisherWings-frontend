export const JOB_TYPES = [
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

export type JobType = (typeof JOB_TYPES)[number];

/**
 * Primary create-job types shown in the UI (matches legacy Create Job wizard).
 * API still accepts LAND / COURIER; those are not in the wizard radio grid.
 */
export const JOB_TYPE_WIZARD_OPTIONS: JobType[] = [
  'AIR_EXPORT',
  'AIR_IMPORT',
  'CUSTOMS_CLEARANCE',
  'SEA_FCL_EXPORT',
  'SEA_FCL_IMPORT',
  'SEA_LCL_EXPORT',
  'SEA_LCL_IMPORT',
  'NVOCC_EXPORT',
  'NVOCC_IMPORT',
  'SERVICE_JOB',
  'WAREHOUSE',
];

export const JOB_STATUSES = [
  'ENQUIRY',
  'QUOTATION',
  'BOOKING_CONFIRMED',
  'IN_PROGRESS',
  'DOCS_PENDING',
  'CUSTOMS_CLEARANCE',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const CONTAINER_STATUSES = [
  'EMPTY',
  'STUFFED',
  'GATED_IN',
  'LOADED',
  'IN_TRANSIT',
  'DISCHARGED',
  'RETURNED',
] as const;

export type ContainerStatus = (typeof CONTAINER_STATUSES)[number];

export const JOB_DOCUMENT_TYPES = [
  'HAWB',
  'MAWB',
  'HBL',
  'MBL',
  'HBL_EXPRESS_RELEASE',
  'FIATA_BL',
  'RIDER_BL',
  'SWITCH_BL',
  'PROXY_BL',
  'BACK_TO_BACK_BL',
  'SURRENDER_NOTICE',
  'STUFFING_REPORT',
  'SAILING_CONFIRMATION',
  'TRANSHIPMENT_CONFIRMATION',
  'BOOKING_CONFIRMATION',
  'CARGO_MANIFEST',
  'PACKING_LIST',
  'COMMERCIAL_INVOICE',
  'CERTIFICATE_OF_ORIGIN',
  'DELIVERY_ORDER',
  'ARRIVAL_NOTICE',
  'PRE_ALERT',
  'CUSTOMS_ENTRY',
  'VGM',
  'SHIPPING_INSTRUCTION',
  'FREIGHT_MANIFEST',
  'JOB_CARD',
  'JOB_PNL',
  'PROFORMA_INVOICE',
  'PRE_CAN',
  'CAN',
  'EXCHANGE_LETTER',
  'UNDERTAKE_LETTER',
  'TRANSPORT_REQUEST',
  'SHIPPING_ADVICE',
  'PROOF_OF_DELIVERY',
  'E_AWB',
  'BARCODE_LABEL',
  'CONSIGNEE_LABEL',
  'JOB_COSTING',
  'FREIGHT_CERTIFICATE',
  'OTHER',
] as const;

export const CUSTOMS_STATUSES = [
  'PENDING',
  'FILED',
  'QUERY',
  'CLEARED',
  'RELEASED',
] as const;

export type CustomsStatus = (typeof CUSTOMS_STATUSES)[number];

export type JobDocumentType = (typeof JOB_DOCUMENT_TYPES)[number];

export const DEFAULT_JOB_PAGE_SIZE = 20;

export type JobSegmentKey = 'air-export' | 'sea-export' | 'sea-import';

export const JOB_SEGMENTS: Record<
  JobSegmentKey,
  {
    label: string;
    routePrefix: string;
    permission: 'menu_jobs_air_export' | 'menu_jobs_sea_export' | 'menu_jobs_sea_import';
    jobTypes: JobType[];
    defaultCreateType: JobType;
  }
> = {
  'air-export': {
    label: 'Air Export',
    routePrefix: '/jobs/air-export',
    permission: 'menu_jobs_air_export',
    jobTypes: ['AIR_EXPORT', 'AIR_IMPORT'],
    defaultCreateType: 'AIR_EXPORT',
  },
  'sea-export': {
    label: 'Sea Export',
    routePrefix: '/jobs/sea-export',
    permission: 'menu_jobs_sea_export',
    jobTypes: ['SEA_FCL_EXPORT', 'SEA_LCL_EXPORT', 'NVOCC_EXPORT'],
    defaultCreateType: 'SEA_FCL_EXPORT',
  },
  'sea-import': {
    label: 'Sea Import',
    routePrefix: '/jobs/sea-import',
    permission: 'menu_jobs_sea_import',
    jobTypes: ['SEA_FCL_IMPORT', 'SEA_LCL_IMPORT', 'NVOCC_IMPORT'],
    defaultCreateType: 'SEA_FCL_IMPORT',
  },
};

/** Display labels aligned with the Create Job wizard UI. */
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  AIR_EXPORT: 'AIR EXPORT',
  AIR_IMPORT: 'AIR IMPORT',
  SEA_FCL_EXPORT: 'FCL EXPORT',
  SEA_FCL_IMPORT: 'FCL IMPORT',
  SEA_LCL_EXPORT: 'LCL EXPORT',
  SEA_LCL_IMPORT: 'LCL IMPORT',
  LAND: 'LAND',
  COURIER: 'COURIER',
  CUSTOMS_CLEARANCE: 'CUSTOMS CLEARANCE',
  NVOCC_EXPORT: 'NVOCC EXPORT',
  NVOCC_IMPORT: 'NVOCC IMPORT',
  SERVICE_JOB: 'SERVICE JOB',
  WAREHOUSE: 'WAREHOUSE',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  ENQUIRY: 'Enquiry',
  QUOTATION: 'Quotation',
  BOOKING_CONFIRMED: 'Booking Confirmed',
  IN_PROGRESS: 'In Progress',
  DOCS_PENDING: 'Docs Pending',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  ON_HOLD: 'On Hold',
};
