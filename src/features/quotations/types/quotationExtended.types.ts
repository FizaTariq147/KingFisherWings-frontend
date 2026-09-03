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

/** Line snapshot used in revise-and-send / counter-offer / negotiation_pricing. */
export interface NegotiationProposedLine {
  lineId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
}

/**
 * Shared negotiation pricing block returned on quotation detail + negotiation timeline.
 * Tenant offer updates revenue lines; customer counter is stored separately until accept.
 */
export interface NegotiationPricing {
  revenueTotal?: number;
  tenantProposedTotal?: number;
  customerProposedTotal?: number;
  customerProposedAt?: string;
  customerProposedLines?: NegotiationProposedLine[];
  /** Current official / tenant revenue line snapshot when API includes it */
  lines?: NegotiationProposedLine[];
  currencyCode?: string;
  raw?: Record<string, unknown>;
}

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
  /** Current pricing snapshot from GET .../negotiation */
  pricing?: NegotiationPricing;
  raw?: Record<string, unknown>;
}

export interface ReviseAndSendLineDto {
  line_id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  amount?: number;
}

export interface ReviseAndSendDto {
  message: string;
  /** Revised total offered to the customer — updates revenue lines + revenue_total */
  proposed_total?: number;
  /** Optional line-level updates applied with the revise */
  lines?: ReviseAndSendLineDto[];
}

export interface NegotiationRejectDto {
  message: string;
  terminal?: boolean;
}
