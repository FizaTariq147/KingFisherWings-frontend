import { API_ENUMS } from '@/lib/api/apiSchema.generated';

export const QUOTATION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'INTERNALLY_APPROVED',
  /** Rejected — customer reject or internal reject (both UIs show Rejected). */
  'REJECTED',
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
  /** Customer accepted (replaces WON). */
  'APPROVED',
  /** @deprecated Prefer REJECTED; coerced to REJECTED. */
  'DISAPPROVED',
  'EXPIRED',
  'CONVERTED',
  /** @deprecated Legacy API aliases — normalized in coerceQuotationStatus. */
  'WON',
  'LOST',
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

/** Statuses shown in list filters (hide deprecated aliases). */
export const QUOTATION_STATUS_FILTERS = [
  'DRAFT',
  'SUBMITTED',
  'INTERNALLY_APPROVED',
  'REJECTED',
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
  'APPROVED',
  'EXPIRED',
  'CONVERTED',
] as const satisfies readonly QuotationStatus[];

// Request enums come from the OpenAPI spec — regenerate with `npm run gen:api-schema`.
export const JOB_TYPES = API_ENUMS.CreateQuotationDto.job_type;

export type JobType = (typeof JOB_TYPES)[number];

export const INCOTERMS = API_ENUMS.CreateQuotationDto.incoterm;

export type Incoterm = (typeof INCOTERMS)[number];

export const LOST_REASONS = API_ENUMS.PortalQuotationRejectDto.reason;

export type LostReason = (typeof LOST_REASONS)[number];

/** Alias for customer reject reasons (same catalog). */
export const DISAPPROVE_REASONS = LOST_REASONS;
export type DisapproveReason = LostReason;

export const PDF_MODES = API_ENUMS.GenerateQuotationPdfDto.mode;
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
  ROAD_FREIGHT: 'Road Freight',
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
  INTERNALLY_APPROVED: 'Internally approved',
  REJECTED: 'Rejected',
  SENT: 'Sent',
  CUSTOMER_REVIEW: 'Customer review',
  NEGOTIATING: 'Negotiating',
  APPROVED: 'Approved',
  DISAPPROVED: 'Rejected',
  EXPIRED: 'Expired',
  CONVERTED: 'Converted',
  WON: 'Approved',
  LOST: 'Rejected',
};

/** Statuses treated as “pending” for dashboard widgets. */
export const PENDING_QUOTATION_STATUSES: QuotationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'INTERNALLY_APPROVED',
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
];
