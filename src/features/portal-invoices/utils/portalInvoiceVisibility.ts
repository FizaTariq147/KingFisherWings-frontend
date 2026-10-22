/**
 * Customer portal should only surface invoices the API has made visible after Post
 * (POSTED / SENT / paid states). Drafts and "created" rows stay staff-side.
 * Empty/unknown status is kept — party scoping is owned by `/portal/invoices`.
 */
const HIDDEN_ON_CUSTOMER_PORTAL = new Set(['DRAFT', 'CREATED']);

export function isCustomerPortalVisibleInvoiceStatus(status?: string | null): boolean {
  const s = String(status || '').trim().toUpperCase();
  if (!s) return true;
  return !HIDDEN_ON_CUSTOMER_PORTAL.has(s);
}

/** Prefs must not lock the list to draft-only (posted invoices would look missing). */
export function isUsableCustomerPortalInvoiceStatusFilter(status?: string | null): boolean {
  const s = String(status || '').trim();
  if (!s) return false;
  return isCustomerPortalVisibleInvoiceStatus(s);
}
