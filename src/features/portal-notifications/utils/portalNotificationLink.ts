import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { safeInternalPath } from '@/lib/safeInternalPath';
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
  INVOICE_OVERDUE: 'INVOICE',
  MESSAGE: 'MESSAGE',
  DISPUTE: 'DISPUTE',
  SHIPMENT: 'JOB_MILESTONE_UPDATED',
  JOB: 'JOB_MILESTONE_UPDATED',
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

/** Map BE audience paths onto FE portal routes when they differ. */
function rewritePortalPath(path: string): string {
  if (path.startsWith('/portal/quotations/')) {
    return path.replace('/portal/quotations/', '/portal/quotes/');
  }
  if (path === '/portal/quotations') return '/portal/quotes';
  return path;
}

/** Allow only in-app `/portal/...` paths from API-supplied hrefs. */
function safePortalHref(candidate: unknown): string | null {
  if (typeof candidate !== 'string' || !candidate.trim()) return null;
  const safe = safeInternalPath(candidate, { prefix: '/portal', fallback: '' });
  return safe ? rewritePortalPath(safe) : null;
}

/** Deep-link a portal notification to the matching customer page. */
export function portalNotificationHref(n: PortalNotification): string | null {
  const fromApi = safePortalHref(n.linkPath) || safePortalHref(n.href);
  if (fromApi) return fromApi;

  const type = normalizeNotificationType(n.type || n.kind);
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
    nested.quotationId,
  );
  const entityType = pickString(
    meta.entity_type,
    meta.entityType,
    nested.entity_type,
    nested.entityType,
  ).toUpperCase();
  const entityId = pickString(
    n.entityId,
    meta.entity_id,
    meta.entityId,
    meta.resource_id,
    nested.entity_id,
    nested.entityId,
  );

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
