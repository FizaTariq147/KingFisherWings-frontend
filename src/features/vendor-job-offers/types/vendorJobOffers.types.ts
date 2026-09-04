import type { VendorPaginationMeta } from '@/features/vendor-shared/normalize';
import type {
  NegotiationPricing,
  NegotiationTimeline,
} from '@/features/quotations/types/quotationExtended.types';
import type { VendorJobOfferStatus } from '../api/vendorJobOffers.api';

export type { VendorJobOfferStatus };

export interface VendorQuoteLineDto {
  line_id?: string;
  description: string;
  quantity?: number;
  unit_price: number;
  amount?: number;
}

export interface PassJobToVendorDto {
  vendor_party_id: string;
  notes?: string;
  message?: string;
  currency_code?: string;
  /** Tenant seeded cost offer — sets cost_total / SENT. */
  proposed_total?: number;
  lines?: VendorQuoteLineDto[];
}

export interface ReviewVendorOfferDto {
  review_notes?: string;
}

export interface DisapproveVendorOfferDto {
  review_notes: string;
}

export interface VendorNegotiationAcceptDto {
  message?: string;
  comments?: string;
}

export interface VendorNegotiationRejectDto {
  message: string;
  /** true → DISAPPROVED; false → return toward VENDOR_REVIEW / continue. */
  terminal?: boolean;
}

export interface VendorCounterOfferDto {
  message: string;
  /** Updates cost_total immediately → NEGOTIATING. */
  proposed_total: number;
  proposed_lines?: VendorQuoteLineDto[];
}

export interface VendorReviseAndSendDto {
  message: string;
  proposed_total?: number;
  lines?: VendorQuoteLineDto[];
}

export interface VendorJobOfferPricingLine {
  id?: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  currencyCode?: string;
}

export interface VendorJobOffer {
  id: string;
  jobId: string;
  vendorPartyId?: string;
  vendorPartyName?: string;
  status: VendorJobOfferStatus | string;
  notes?: string;
  reviewNotes?: string;
  lines: VendorJobOfferPricingLine[];
  currencyCode?: string;
  totalAmount?: number;
  /** Job / offer cost total (jumps on vendor counter). */
  costTotal?: number;
  negotiationPricing?: NegotiationPricing;
  /** Set when backend (or frontend fulfill) created a vendor bill. */
  purchaseInvoiceId?: string;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
  pricedAt?: string;
  reviewedAt?: string;
}

export interface SubmitVendorJobPricingLineDto {
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
  currency_code?: string;
}

export interface SubmitVendorJobPricingDto {
  notes?: string;
  message?: string;
  proposed_total?: number;
  lines: SubmitVendorJobPricingLineDto[];
}

/** Vendor-portal job summary — never includes customer revenue / sell prices. */
export interface VendorPortalJobListItem {
  id: string;
  jobNumber?: string;
  status?: string;
  jobType?: string;
  offerStatus?: VendorJobOfferStatus | string;
  origin?: string;
  destination?: string;
  etd?: string;
  eta?: string;
  notes?: string;
  costTotal?: number;
  currencyCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorPortalJobDetail extends VendorPortalJobListItem {
  offerId?: string;
  pricingNotes?: string;
  lines: VendorJobOfferPricingLine[];
  totalAmount?: number;
  negotiationPricing?: NegotiationPricing;
}

export interface VendorPortalJobListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface VendorPortalJobListResult {
  items: VendorPortalJobListItem[];
  meta: VendorPaginationMeta;
}

export interface VendorJobPricingResult {
  jobId: string;
  offerId?: string;
  status?: VendorJobOfferStatus | string;
  notes?: string;
  lines: VendorJobOfferPricingLine[];
  currencyCode?: string;
  totalAmount?: number;
  costTotal?: number;
  negotiationPricing?: NegotiationPricing;
  updatedAt?: string;
}

export type VendorOfferNegotiationTimeline = NegotiationTimeline;
