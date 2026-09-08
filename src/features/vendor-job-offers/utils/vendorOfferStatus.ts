import type { QuotationStatus } from '@/features/quotations/constants/quotation.constants';
import type { VendorJobOfferStatus } from '../api/vendorJobOffers.api';

/**
 * Map API / legacy statuses into the negotiation model:
 * SENT → NEGOTIATING ↔ VENDOR_REVIEW → APPROVED | DISAPPROVED
 *
 * Both admin (revise / accept-counter) and vendor (accept / reject / counter)
 * stay active until APPROVED or DISAPPROVED.
 */
export function coerceVendorOfferStatus(value: unknown): VendorJobOfferStatus | string {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (!raw) return 'SENT';

  if (raw === 'PENDING_VENDOR' || raw === 'OPEN' || raw === 'PASSED') return 'SENT';
  if (
    raw === 'VENDOR_PRICED' ||
    raw === 'COUNTERED' ||
    raw === 'CUSTOMER_REVIEW' ||
    raw === 'COUNTER_OFFER'
  ) {
    return 'NEGOTIATING';
  }
  if (raw === 'TENANT_REVIEW' || raw === 'REVIEW' || raw === 'REVISED') return 'VENDOR_REVIEW';
  if (raw === 'TENANT_APPROVED' || raw === 'WON' || raw === 'ACCEPTED') return 'APPROVED';
  if (raw === 'TENANT_DISAPPROVED' || raw === 'REJECTED' || raw === 'LOST') return 'DISAPPROVED';

  return raw;
}

export function vendorOfferStatusLabel(status?: string): string {
  const s = coerceVendorOfferStatus(status);
  return String(s).replaceAll('_', ' ');
}

export function isVendorOfferTerminal(status?: string): boolean {
  const s = coerceVendorOfferStatus(status);
  return s === 'APPROVED' || s === 'DISAPPROVED';
}

/** Vendor may accept / reject / counter the tenant cost offer while negotiation is open. */
export function canVendorRespondToOffer(status?: string): boolean {
  const s = coerceVendorOfferStatus(status);
  return s === 'SENT' || s === 'VENDOR_REVIEW' || s === 'NEGOTIATING';
}

/** Staff may revise-and-send whenever the offer is still open. */
export function canStaffReviseVendorOffer(status?: string): boolean {
  const s = coerceVendorOfferStatus(status);
  return s === 'SENT' || s === 'NEGOTIATING' || s === 'VENDOR_REVIEW';
}

/** Staff may accept / reject a pending vendor counter. */
export function canStaffRespondToVendorCounter(status?: string): boolean {
  const s = coerceVendorOfferStatus(status);
  return s === 'NEGOTIATING' || s === 'VENDOR_PRICED';
}

export function canStaffApproveVendorOffer(status?: string): boolean {
  const s = coerceVendorOfferStatus(status);
  return s === 'NEGOTIATING' || s === 'VENDOR_REVIEW' || s === 'VENDOR_PRICED';
}

/** For reuse of quotation NegotiationPricingCard copy on cost offers. */
export type VendorNegotiationSideLabels = {
  tenantLabel: string;
  counterLabel: string;
};

export const VENDOR_COST_NEGOTIATION_LABELS: VendorNegotiationSideLabels = {
  tenantLabel: 'Tenant cost offer',
  counterLabel: 'Vendor counter',
};

/** QuotationStatus-compatible closed checks for shared settlement helpers. */
export function vendorStatusAsQuotationLike(status?: string): QuotationStatus | string {
  const s = coerceVendorOfferStatus(status);
  if (s === 'APPROVED') return 'APPROVED';
  if (s === 'DISAPPROVED') return 'DISAPPROVED';
  if (s === 'VENDOR_REVIEW') return 'CUSTOMER_REVIEW';
  if (s === 'NEGOTIATING') return 'NEGOTIATING';
  if (s === 'SENT') return 'SENT';
  return s;
}
