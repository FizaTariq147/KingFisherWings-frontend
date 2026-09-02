import type { JobType } from '../constants/quotation.constants';

export type ServiceCatalogPricingBasis =
  | 'FLAT'
  | 'PER_KG'
  | 'PER_CBM'
  | 'PER_PIECE'
  | 'PER_CONTAINER';

export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  jobType: JobType | string;
  chargeCodeId?: string;
  pricingBasis: ServiceCatalogPricingBasis | string;
  unitPrice: number;
  currencyCode: string;
  minCharge?: number;
  isPortalVisible: boolean;
  isActive: boolean;
  sortOrder?: number;
  raw?: Record<string, unknown>;
}

export interface ServiceCatalogListParams {
  portal_visible?: boolean;
  active_only?: boolean;
  job_type?: string;
}

export interface CreateServiceCatalogItemDto {
  code: string;
  name: string;
  job_type: string;
  charge_code_id?: string;
  pricing_basis?: ServiceCatalogPricingBasis | string;
  unit_price: number;
  currency_code: string;
  min_charge?: number;
  is_portal_visible?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export type UpdateServiceCatalogItemDto = Partial<CreateServiceCatalogItemDto>;

export interface NegotiationEvent {
  id: string;
  eventType?: string;
  actor?: string;
  message?: string;
  proposedTotal?: number;
  status?: string;
  createdAt?: string;
  raw?: Record<string, unknown>;
}

export interface NegotiationTimeline {
  events: NegotiationEvent[];
  round?: number;
  raw?: Record<string, unknown>;
}

export interface ReviseAndSendDto {
  message: string;
}

export interface NegotiationRejectDto {
  message: string;
  terminal?: boolean;
}
