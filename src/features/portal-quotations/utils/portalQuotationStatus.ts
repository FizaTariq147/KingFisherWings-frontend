import {
  canPortalCustomerRespond as canRespondCanonical,
  coerceQuotationStatus,
  isCustomerApprovedStatus,
  isCustomerDisapprovedStatus,
} from '@/features/quotations/utils/quotationStatus';
import type { PortalQuotationDetail, PortalQuotationListItem } from '../types/portalQuotations.types';

export function normalizePortalQuoteStatus(status?: string): string {
  return coerceQuotationStatus(status || 'DRAFT');
}

/**
 * After a successful portal accept/reject, POST body (and sometimes immediate GET)
 * can still return the prior open status. Force the customer decision onto the
 * detail used for cache/UI so list + detail update immediately.
 */
export function applyPortalCustomerDecisionStatus(
  detail: PortalQuotationDetail,
  decision: 'accept' | 'reject',
): PortalQuotationDetail {
  const current = normalizePortalQuoteStatus(detail.status);
  if (decision === 'reject') {
    if (isCustomerApprovedStatus(current) || current === 'CONVERTED') return detail;
    return { ...detail, status: 'REJECTED' };
  }
  if (isCustomerDisapprovedStatus(current) || current === 'EXPIRED') return detail;
  return { ...detail, status: 'APPROVED' };
}

export function portalQuoteHasPricing(
  quote?: PortalQuotationListItem | PortalQuotationDetail,
): boolean {
  if (!quote) return false;
  const detail = quote as PortalQuotationDetail;
  if (detail.lines?.length) return true;
  return portalQuoteTotalAmount(quote) != null;
}

export function canPortalCustomerRespondToQuote(
  status?: string,
  quote?: PortalQuotationListItem | PortalQuotationDetail,
): boolean {
  const s = normalizePortalQuoteStatus(status);
  // Customer must not act on DRAFT / SUBMITTED / INTERNALLY_APPROVED enquiries.
  if (!canRespondCanonical(s)) return false;
  return true;
}

export function portalQuoteTotalAmount(
  item: PortalQuotationListItem | PortalQuotationDetail,
): number | undefined {
  const detail = item as PortalQuotationDetail;
  if (detail.lines?.length) {
    const sum = detail.lines.reduce((acc, line) => acc + (line.amount ?? 0), 0);
    if (sum > 0) return sum;
  }
  // Prefer header revenue_total when backend keeps negotiated total current (item 2).
  const raw = item.raw ?? {};
  const header =
    raw.revenue_total ??
    raw.revenueTotal ??
    raw.total_amount ??
    raw.totalAmount ??
    raw.grand_total ??
    raw.grandTotal ??
    raw.amount ??
    (item as PortalQuotationDetail).negotiationPricing?.revenueTotal ??
    (item as PortalQuotationDetail).negotiationPricing?.tenantProposedTotal;
  return typeof header === 'number' && Number.isFinite(header) ? header : undefined;
}

export function portalQuoteStatusMessage(
  status?: string,
  quote?: PortalQuotationListItem | PortalQuotationDetail,
): string | null {
  const s = normalizePortalQuoteStatus(status);
  if (canPortalCustomerRespondToQuote(status, quote)) {
    return 'Review the charges below and approve or reject this quotation.';
  }
  if (s === 'INTERNALLY_APPROVED') {
    return 'Pricing is approved internally but not sent yet. Refresh shortly or contact your forwarder.';
  }
  if (s === 'SUBMITTED' || s === 'DRAFT' || s === 'PENDING' || s === 'OPEN') {
    return 'Your forwarder is preparing this quotation. Approve and reject will be available once they send it.';
  }
  if (s === 'CUSTOMER_REVIEW') {
    return 'Your forwarder sent a revised quotation. Review the charges and approve, reject, or submit a counter-offer.';
  }
  if (s === 'NEGOTIATING') {
    const counter = quote
      ? (quote as PortalQuotationDetail).negotiationPricing?.customerProposedTotal
      : undefined;
    if (counter != null) {
      return `Your counter-offer (${counter}) is waiting for the forwarder. Approving now accepts their current offer, not your counter.`;
    }
    return 'Counter-offer submitted. Your forwarder will respond shortly. Approving now accepts their current offer, not your counter.';
  }
  if (isCustomerApprovedStatus(s) || s === 'CONVERTED' || s === 'ACCEPTED') {
    return 'You approved this quotation.';
  }
  if (isCustomerDisapprovedStatus(s) || s === 'REJECTED') {
    return 'This quotation was rejected.';
  }
  if (s === 'EXPIRED') {
    return 'This quotation has expired.';
  }
  return null;
}

export function canPortalCustomerCounterOffer(status?: string): boolean {
  const s = normalizePortalQuoteStatus(status);
  return s === 'SENT' || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING';
}

export function formatPortalQuotationActionError(raw: string): string {
  const trimmed = raw.trim();
  if (/only a sent quotation can be marked won/i.test(trimmed) || /only a sent quotation can be marked approved/i.test(trimmed)) {
    return 'This quotation is not ready for customer approval yet. Ask your forwarder to use Send to customer in ERP (status must be Sent), then try Approve again.';
  }
  if (/only a sent quotation/i.test(trimmed)) {
    return 'Approval is only allowed after your forwarder sends the quotation (status Sent). Contact them to click Send to customer.';
  }
  if (/missing required permission.*quotations\.negotiate/i.test(trimmed)) {
    return 'Staff account is missing quotations.negotiate. Super Admin must sync tenant permissions, then staff must sign out and back in.';
  }
  if (/counter.?offer|negotiat/i.test(trimmed) && /not (allowed|permitted)|invalid status|cannot/i.test(trimmed)) {
    return `${trimmed} Counter-offers are allowed when status is Sent, Customer Review, or Negotiating.`;
  }
  return trimmed;
}
