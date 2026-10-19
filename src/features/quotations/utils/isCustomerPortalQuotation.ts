import type { Quotation } from '../types/quotation.types';

/**
 * True when the quotation originated from the customer portal
 * (portal book estimate / costing metadata), not a staff-created quote.
 */
export function isCustomerPortalQuotation(
  quote: Pick<
    Quotation,
    'portal_estimate_snapshot' | 'portal_costing' | 'pricing_source'
  > | null | undefined,
): boolean {
  if (!quote) return false;

  const snap = quote.portal_estimate_snapshot;
  if (
    snap &&
    (snap.estimated_total != null ||
      Boolean(snap.currency_code?.trim()) ||
      Boolean(snap.captured_at?.trim()))
  ) {
    return true;
  }

  if (quote.portal_costing && Object.keys(quote.portal_costing).length > 0) {
    return true;
  }

  const source = String(quote.pricing_source ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (
    source.includes('portal') ||
    source === 'customer_portal' ||
    source === 'online_quote' ||
    source === 'online' ||
    source === 'customer_request' ||
    source === 'portal_request' ||
    source.includes('customer')
  ) {
    return true;
  }

  return false;
}
