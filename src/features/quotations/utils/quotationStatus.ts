import type { QuotationStatus } from '../constants/quotation.constants';

/**
 * Quotation status v2 (target backend migration):
 * - INTERNALLY_APPROVED = former staff APPROVED (may send to customer)
 * - APPROVED = former WON (customer accepted)
 * - REJECTED = customer rejected OR internal reject (both sides show Rejected)
 *   Legacy LOST / DISAPPROVED normalize to REJECTED.
 *
 * Live backend may still return WON/LOST/APPROVED(staff). We normalize into the
 * canonical model for UI gates, and keep raw aliases for API compatibility.
 */

let detectedStatusV2 = false;

/** Call when any response includes INTERNALLY_APPROVED or DISAPPROVED. */
export function markQuotationStatusV2Detected(raw?: string): void {
  const s = (raw || '').toUpperCase().replace(/\s+/g, '_');
  if (s === 'INTERNALLY_APPROVED' || s === 'DISAPPROVED') {
    detectedStatusV2 = true;
  }
}

export function isQuotationStatusV2(): boolean {
  return (
    detectedStatusV2 ||
    String(import.meta.env.VITE_QUOTATION_STATUS_V2 || '').toLowerCase() === 'true'
  );
}

export function normalizeQuotationStatusKey(value: unknown): string {
  return String(value ?? 'DRAFT')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

/**
 * Map API status → canonical UI status.
 * Legacy: APPROVED (staff) → INTERNALLY_APPROVED; WON → APPROVED; LOST/DISAPPROVED → REJECTED.
 */
export function coerceQuotationStatus(value: unknown): QuotationStatus {
  const raw = normalizeQuotationStatusKey(value);
  markQuotationStatusV2Detected(raw);

  if (raw === 'INTERNALLY_APPROVED') return 'INTERNALLY_APPROVED';
  // Customer reject and legacy lost/disapproved → Rejected on both portal and admin.
  if (raw === 'DISAPPROVED' || raw === 'LOST') return 'REJECTED';
  if (raw === 'WON') return 'APPROVED';
  if (raw === 'ACCEPTED') return 'APPROVED';

  if (raw === 'APPROVED') {
    // Ambiguous name: staff-internal on legacy API, customer-accepted on v2.
    return isQuotationStatusV2() ? 'APPROVED' : 'INTERNALLY_APPROVED';
  }

  const known: QuotationStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'INTERNALLY_APPROVED',
    'REJECTED',
    'SENT',
    'CUSTOMER_REVIEW',
    'NEGOTIATING',
    'APPROVED',
    'DISAPPROVED',
    'EXPIRED',
    'CONVERTED',
  ];
  return known.includes(raw as QuotationStatus) ? (raw as QuotationStatus) : 'DRAFT';
}

/** Statuses where staff may still edit charge lines / revise before customer close. */
export function isQuotationLinesEditable(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return (
    s === 'DRAFT' ||
    s === 'REJECTED' ||
    s === 'SUBMITTED' ||
    s === 'INTERNALLY_APPROVED' ||
    s === 'SENT' ||
    s === 'CUSTOMER_REVIEW' ||
    s === 'NEGOTIATING'
  );
}

export function isQuotationDraftEditable(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return s === 'DRAFT' || s === 'REJECTED';
}

/** Portal enquiry / early statuses — staff must not mark customer approve/reject. */
export function isQuotationPreCustomer(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return (
    s === 'DRAFT' ||
    s === 'SUBMITTED' ||
    s === 'INTERNALLY_APPROVED' ||
    s === 'REJECTED'
  );
}

export function canStaffInternallyApprove(status: string): boolean {
  return coerceQuotationStatus(status) === 'SUBMITTED';
}

export function canStaffSendToCustomer(status: string): boolean {
  return coerceQuotationStatus(status) === 'INTERNALLY_APPROVED';
}

/** Ops override: mark customer approved/disapproved after send (not on DRAFT enquiry). */
export function canStaffMarkCustomerDecision(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return s === 'SENT' || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING';
}

export function canConvertQuotationToJob(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return s === 'APPROVED';
}

export function isCustomerApprovedStatus(status: string): boolean {
  return coerceQuotationStatus(status) === 'APPROVED';
}

export function isCustomerDisapprovedStatus(status: string): boolean {
  // Customer reject is stored/shown as REJECTED on both portal and admin.
  const s = coerceQuotationStatus(status);
  return s === 'REJECTED' || s === 'DISAPPROVED';
}

export function isQuotationTerminalClosed(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return (
    s === 'APPROVED' ||
    s === 'REJECTED' ||
    s === 'DISAPPROVED' ||
    s === 'EXPIRED' ||
    s === 'CONVERTED'
  );
}

export function canArchiveQuotation(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return (
    s === 'APPROVED' ||
    s === 'REJECTED' ||
    s === 'DISAPPROVED' ||
    s === 'EXPIRED' ||
    s === 'CONVERTED'
  );
}

/** Portal customer may accept/reject / counter when quote is with them. */
export function canPortalCustomerRespond(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return s === 'SENT' || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING';
}
