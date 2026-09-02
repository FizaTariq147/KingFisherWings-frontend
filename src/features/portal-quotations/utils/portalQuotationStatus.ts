import type { PortalQuotationDetail, PortalQuotationListItem } from '../types/portalQuotations.types';

export function normalizePortalQuoteStatus(status?: string): string {
  return (status || '').trim().toUpperCase().replace(/\s+/g, '_');
}

/** Customer may approve/reject once staff has priced the quote or sent it for review. */
export const PORTAL_QUOTE_RESPOND_STATUSES = new Set([
  'APPROVED',
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
]);

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
  if (!PORTAL_QUOTE_RESPOND_STATUSES.has(s)) return false;
  if (s === 'APPROVED') return portalQuoteHasPricing(quote);
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
  const raw = item.raw ?? {};
  const total =
    raw.total_amount ?? raw.totalAmount ?? raw.grand_total ?? raw.grandTotal ?? raw.amount;
  return typeof total === 'number' && Number.isFinite(total) ? total : undefined;
}

export function portalQuoteStatusMessage(
  status?: string,
  quote?: PortalQuotationListItem | PortalQuotationDetail,
): string | null {
  const s = normalizePortalQuoteStatus(status);
  if (canPortalCustomerRespondToQuote(status, quote)) {
    return 'Review the charges below and approve or reject this quotation.';
  }
  if (s === 'APPROVED') {
    return 'Pricing is approved but charge lines are not visible yet. Refresh shortly or contact your forwarder.';
  }
  if (s === 'SUBMITTED' || s === 'DRAFT' || s === 'PENDING' || s === 'OPEN') {
    return 'Your forwarder is preparing this quotation. Approve and reject will be available once pricing is ready.';
  }
  if (s === 'CUSTOMER_REVIEW') {
    return 'Your forwarder sent a revised quotation. Review the charges and approve, reject, or submit a counter-offer.';
  }
  if (s === 'NEGOTIATING') {
    return 'Counter-offer submitted. Your forwarder will respond shortly. You can still approve the current quote.';
  }
  if (s === 'WON' || s === 'CONVERTED' || s === 'ACCEPTED') {
    return 'You approved this quotation.';
  }
  if (s === 'LOST' || s === 'REJECTED') {
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
  if (/only a sent quotation can be marked won/i.test(trimmed)) {
    return 'This quotation is not ready for customer approval yet. Ask your forwarder to use Send to customer in ERP (status must be Sent), then try Approve again.';
  }
  if (/only a sent quotation/i.test(trimmed)) {
    return 'Approval is only allowed after your forwarder sends the quotation (status Sent). Contact them to click Send to customer.';
  }
  return trimmed;
}
