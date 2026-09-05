import { asRecord, pickString } from '@/features/vendor-shared/normalize';
import type { VendorNotification } from '../types/vendorNotifications.types';

const TYPE_ALIASES: Record<string, string> = {
  JOB_OFFER: 'JOB_OFFER',
  JOB: 'JOB_OFFER',
  QUOTE: 'JOB_OFFER',
  VENDOR_QUOTE: 'JOB_OFFER',
  DISPUTE: 'DISPUTE',
  PAYMENT_REQUEST: 'PAYMENT_REQUEST',
  PAYMENT: 'PAYMENT_REQUEST',
  INVOICE: 'INVOICE',
  SYSTEM: 'SYSTEM',
};

export function normalizeVendorAlertType(type?: string): string {
  const raw = (type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return TYPE_ALIASES[raw] || raw;
}

export function vendorNotificationTypeLabel(type?: string): string {
  switch (normalizeVendorAlertType(type)) {
    case 'JOB_OFFER':
      return 'Job offer';
    case 'DISPUTE':
      return 'Dispute';
    case 'PAYMENT_REQUEST':
      return 'Payment request';
    case 'INVOICE':
      return 'Invoice';
    case 'SYSTEM':
      return 'System';
    default:
      return type ? type.replaceAll('_', ' ') : 'Alert';
  }
}

/** Deep-link a vendor notification / alert to the matching portal page. */
export function vendorNotificationHref(n: VendorNotification): string | null {
  if (n.href) return n.href;
  const type = normalizeVendorAlertType(n.type || n.kind);
  const meta = asRecord(n.raw) ?? {};
  const nested = asRecord(meta.payload) ?? asRecord(meta.meta) ?? asRecord(meta.data) ?? {};

  const jobId = pickString(n.jobId, meta.job_id, meta.jobId, nested.job_id, nested.jobId);
  const offerId = pickString(
    n.entityId,
    meta.offer_id,
    meta.offerId,
    meta.quote_id,
    meta.quoteId,
    nested.offer_id,
  );
  const invoiceId = pickString(
    n.invoiceId,
    meta.invoice_id,
    meta.invoiceId,
    nested.invoice_id,
    nested.invoiceId,
  );
  const disputeId = pickString(meta.dispute_id, meta.disputeId, nested.dispute_id, n.entityId);
  const paymentRequestId = pickString(
    meta.payment_request_id,
    meta.paymentRequestId,
    nested.payment_request_id,
    n.entityId,
  );

  if (type === 'JOB_OFFER') {
    const id = jobId || offerId;
    return id ? `/vendor/jobs/${id}` : '/vendor/jobs';
  }
  if (type === 'DISPUTE') {
    return disputeId ? `/vendor/disputes` : '/vendor/disputes';
  }
  if (type === 'PAYMENT_REQUEST') {
    return paymentRequestId
      ? `/vendor/payment-requests/${paymentRequestId}`
      : '/vendor/payment-requests';
  }
  if (type === 'INVOICE') {
    return invoiceId ? `/vendor/invoices/${invoiceId}` : '/vendor/invoices';
  }
  if (jobId) return `/vendor/jobs/${jobId}`;
  if (invoiceId) return `/vendor/invoices/${invoiceId}`;
  return null;
}
