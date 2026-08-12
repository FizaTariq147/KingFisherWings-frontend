import { asRecord, pickString } from '@/features/portal-shared/normalize';
import type { PortalNotification } from '../types/portalNotifications.types';

const TYPE_ALIASES: Record<string, string> = {
  DOCUMENT_READY: 'DOCUMENT_READY',
  DOCUMENT: 'DOCUMENT_READY',
  JOB_MILESTONE_UPDATED: 'JOB_MILESTONE_UPDATED',
  MILESTONE: 'JOB_MILESTONE_UPDATED',
  QUOTATION_SENT: 'QUOTATION',
  QUOTATION_ACCEPTED: 'QUOTATION',
  QUOTATION: 'QUOTATION',
  INVOICE: 'INVOICE',
  INVOICE_READY: 'INVOICE',
  MESSAGE: 'MESSAGE',
  DISPUTE: 'DISPUTE',
};

export function normalizeNotificationType(type?: string): string {
  const raw = (type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return TYPE_ALIASES[raw] || raw;
}

export function notificationTypeLabel(type?: string): string {
  switch (normalizeNotificationType(type)) {
    case 'DOCUMENT_READY':
      return 'Document ready';
    case 'JOB_MILESTONE_UPDATED':
      return 'Milestone';
    case 'QUOTATION':
      return 'Quotation';
    case 'INVOICE':
      return 'Invoice';
    case 'MESSAGE':
      return 'Message';
    case 'DISPUTE':
      return 'Dispute';
    default:
      return type ? type.replaceAll('_', ' ') : 'Alert';
  }
}

/** Deep-link a portal notification to the matching customer page. */
export function portalNotificationHref(n: PortalNotification): string | null {
  const type = normalizeNotificationType(n.type);
  const meta = asRecord(n.raw) ?? {};
  const nested = asRecord(meta.payload) ?? asRecord(meta.meta) ?? asRecord(meta.data) ?? {};

  const jobId = pickString(n.jobId, meta.job_id, meta.jobId, nested.job_id, nested.jobId);
  const invoiceId = pickString(
    n.invoiceId,
    meta.invoice_id,
    meta.invoiceId,
    nested.invoice_id,
    nested.invoiceId,
  );
  const quotationId = pickString(
    n.quotationId,
    meta.quotation_id,
    meta.quotationId,
    nested.quotation_id,
  );
  const entityType = pickString(meta.entity_type, meta.entityType, nested.entity_type).toUpperCase();
  const entityId = pickString(n.entityId, meta.entity_id, meta.entityId, nested.entity_id);

  if (type === 'DOCUMENT_READY') {
    if (jobId) return `/portal/shipments/${jobId}`;
    if (invoiceId) return `/portal/invoices/${invoiceId}`;
    if (entityType.includes('JOB') && entityId) return `/portal/shipments/${entityId}`;
    if (entityType.includes('INVOICE') && entityId) return `/portal/invoices/${entityId}`;
    return '/portal/documents';
  }
  if (type === 'JOB_MILESTONE_UPDATED') {
    return jobId || entityId ? `/portal/shipments/${jobId || entityId}` : '/portal/shipments';
  }
  if (type === 'QUOTATION') {
    return quotationId || entityId ? `/portal/quotes/${quotationId || entityId}` : '/portal/quotes';
  }
  if (type === 'INVOICE') {
    return invoiceId || entityId ? `/portal/invoices/${invoiceId || entityId}` : '/portal/invoices';
  }
  if (type === 'MESSAGE') return '/portal/messages';
  if (type === 'DISPUTE') return '/portal/disputes';
  if (jobId) return `/portal/shipments/${jobId}`;
  if (invoiceId) return `/portal/invoices/${invoiceId}`;
  if (quotationId) return `/portal/quotes/${quotationId}`;
  return null;
}
