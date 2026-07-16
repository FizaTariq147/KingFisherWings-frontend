export const QUOTATION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'SENT',
  'WON',
  'LOST',
  'EXPIRED',
  'CONVERTED',
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

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

export const INCOTERMS = [
  'EXW',
  'FCA',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
] as const;

export type Incoterm = (typeof INCOTERMS)[number];

export const LOST_REASONS = [
  'Competitor Rate',
  'No Space',
  'Cargo Type',
  'No Longer Required',
  'Booked Elsewhere',
  'Price Too High',
  'Other',
] as const;

export type LostReason = (typeof LOST_REASONS)[number];

export const PDF_MODES = ['CUSTOMER', 'INTERNAL'] as const;
export type PdfMode = (typeof PDF_MODES)[number];

export const DEFAULT_QUOTATION_PAGE_SIZE = 20;

export const QUOTATION_CREATE_DRAFT_KEY = 'quotation-create-draft';

export const JOB_TYPE_LABELS: Record<JobType, string> = {
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

export const STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SENT: 'Sent',
  WON: 'Won',
  LOST: 'Lost',
  EXPIRED: 'Expired',
  CONVERTED: 'Converted',
};

/** Statuses treated as “pending” for dashboard widgets. */
export const PENDING_QUOTATION_STATUSES: QuotationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'SENT',
];
