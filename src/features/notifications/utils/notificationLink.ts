import type { JobType } from '@/features/jobs/constants/job.constants';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { safeInternalPath } from '@/lib/safeInternalPath';
import type { AppNotification } from '../types/notifications.types';
import {
  inferStaffNotificationPath,
  remapStaffNotificationPath,
} from './remapStaffNotificationPath';

const TYPE_ALIASES: Record<string, string> = {
  JOB: 'JOB',
  JOB_CREATED: 'JOB',
  JOB_UPDATED: 'JOB',
  JOB_MILESTONE: 'JOB',
  JOB_MILESTONE_UPDATED: 'JOB',
  DOCUMENT: 'JOB',
  DOCUMENT_READY: 'JOB',
  VENDOR_QUOTE: 'JOB',
  VENDOR_QUOTE_ACCEPTED: 'JOB',
  JOB_OFFER: 'JOB',
  SHIPMENT: 'SHIPMENT',
  QUOTATION: 'QUOTATION',
  QUOTE: 'QUOTATION',
  QUOTATION_SENT: 'QUOTATION',
  QUOTATION_ACCEPTED: 'QUOTATION',
  QUOTATION_EXPIRED: 'QUOTATION',
  ENQUIRY: 'ENQUIRY',
  CRM_ENQUIRY: 'ENQUIRY',
  INVOICE: 'INVOICE',
  INVOICE_OVERDUE: 'INVOICE',
  INVOICE_PAID: 'INVOICE',
  INVOICE_READY: 'INVOICE',
  PURCHASE_INVOICE: 'PURCHASE_INVOICE',
  PI: 'PURCHASE_INVOICE',
  OPEN_INVOICE: 'PURCHASE_INVOICE',
  PAYMENT_PROOF: 'PURCHASE_INVOICE',
  PAYMENT_REQUEST: 'PAYMENT_REQUEST',
  PAYMENT: 'PAYMENT_REQUEST',
  DISPUTE: 'DISPUTE',
  VENDOR_DISPUTE: 'DISPUTE',
  PARTY: 'PARTY',
  CUSTOMER: 'PARTY',
  HR: 'HR',
  LEAVE: 'HR',
  LEAVE_REQUEST: 'HR',
  TIMESHEET: 'TIMESHEET',
  TIMESHEETS: 'TIMESHEET',
  MISSING_TIMESHEET: 'TIMESHEET',
  EMPLOYEE: 'EMPLOYEE',
  REPORT: 'REPORT',
  SYSTEM: 'SYSTEM',
  WMS: 'WMS',
  WAREHOUSE: 'WMS',
  LOW_STOCK: 'LOW_STOCK',
  WMS_LOW_STOCK: 'LOW_STOCK',
  STOCK_ALERT: 'LOW_STOCK',
};

export function normalizeStaffNotificationType(type?: string): string {
  const raw = (type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return TYPE_ALIASES[raw] || raw;
}

export function staffNotificationTypeLabel(type?: string): string {
  switch (normalizeStaffNotificationType(type)) {
    case 'JOB':
      return 'Job';
    case 'SHIPMENT':
      return 'Shipment';
    case 'QUOTATION':
      return 'Quotation';
    case 'ENQUIRY':
      return 'Enquiry';
    case 'INVOICE':
      return 'Invoice';
    case 'PURCHASE_INVOICE':
      return 'Purchase invoice';
    case 'PAYMENT_REQUEST':
      return 'Payment request';
    case 'DISPUTE':
      return 'Dispute';
    case 'PARTY':
      return 'Party';
    case 'HR':
      return 'HR';
    case 'TIMESHEET':
      return 'Timesheet';
    case 'EMPLOYEE':
      return 'Employee';
    case 'REPORT':
      return 'Report';
    case 'SYSTEM':
      return 'System';
    case 'WMS':
      return 'Warehouse';
    case 'LOW_STOCK':
      return 'Low stock';
    default:
      return type ? type.replaceAll('_', ' ') : 'Alert';
  }
}

/** Staff/admin in-app paths only (not portal/vendor). */
function safeStaffHref(candidate: unknown): string | null {
  if (typeof candidate !== 'string' || !candidate.trim()) return null;
  const trimmed = candidate.trim();
  if (trimmed.startsWith('/portal') || trimmed.startsWith('/vendor')) return null;
  const remapped = remapStaffNotificationPath(trimmed) || trimmed;
  const safe = safeInternalPath(remapped, { prefix: '', fallback: '' });
  return safe || null;
}

function metaBag(n: AppNotification): Record<string, unknown> {
  const meta = asRecord(n.raw) ?? {};
  return asRecord(meta.payload) ?? asRecord(meta.meta) ?? asRecord(meta.data) ?? {};
}

/** Deep-link a staff notification / alert to the matching admin screen. */
export function notificationHref(n: AppNotification): string | null {
  const fromApi = safeStaffHref(n.linkPath) || safeStaffHref(n.href);
  if (fromApi) {
    // Prefer remapped real routes even when API path was "safe" but wrong.
    return remapStaffNotificationPath(fromApi) || fromApi;
  }

  const inferred = inferStaffNotificationPath({
    type: n.type,
    kind: n.kind,
    title: n.title,
    body: n.body,
  });
  if (inferred) return inferred;

  const type = normalizeStaffNotificationType(n.type || n.kind);
  const meta = asRecord(n.raw) ?? {};
  const nested = metaBag(n);

  const jobId = pickString(n.jobId, meta.job_id, meta.jobId, nested.job_id, nested.jobId);
  const jobType = pickString(
    meta.job_type,
    meta.jobType,
    nested.job_type,
    nested.jobType,
  );
  const shipmentId = pickString(
    n.shipmentId,
    meta.shipment_id,
    meta.shipmentId,
    nested.shipment_id,
    nested.shipmentId,
  );
  const quotationId = pickString(
    n.quotationId,
    meta.quotation_id,
    meta.quotationId,
    nested.quotation_id,
    nested.quotationId,
  );
  const enquiryId = pickString(
    n.enquiryId,
    meta.enquiry_id,
    meta.enquiryId,
    nested.enquiry_id,
    nested.enquiryId,
  );
  const invoiceId = pickString(
    n.invoiceId,
    meta.invoice_id,
    meta.invoiceId,
    nested.invoice_id,
    nested.invoiceId,
  );
  const purchaseInvoiceId = pickString(
    meta.purchase_invoice_id,
    meta.purchaseInvoiceId,
    nested.purchase_invoice_id,
    nested.purchaseInvoiceId,
  );
  const paymentRequestId = pickString(
    meta.payment_request_id,
    meta.paymentRequestId,
    nested.payment_request_id,
    nested.paymentRequestId,
  );
  const partyId = pickString(
    meta.party_id,
    meta.partyId,
    meta.customer_id,
    meta.customerId,
    nested.party_id,
    nested.partyId,
  );
  const employeeId = pickString(
    meta.employee_id,
    meta.employeeId,
    nested.employee_id,
    nested.employeeId,
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
    meta.resourceId,
    nested.entity_id,
    nested.entityId,
  );

  const jobPath = (id: string) =>
    jobDetailPath({
      id,
      job_type: (jobType || 'AIR_EXPORT') as JobType,
    });

  if (type === 'JOB') {
    const id = jobId || entityId;
    return id ? jobPath(id) : '/jobs/air-export';
  }
  if (type === 'SHIPMENT') {
    const id = shipmentId || entityId;
    return id ? `/operations/shipments/${id}` : '/operations/shipments';
  }
  if (type === 'QUOTATION') {
    const id = quotationId || entityId;
    return id ? `/quotations/${id}` : '/quotations/all';
  }
  if (type === 'ENQUIRY') {
    const id = enquiryId || entityId;
    return id ? `/sales/enquiries/${id}` : '/sales/enquiries';
  }
  if (type === 'INVOICE') {
    const id = invoiceId || entityId;
    return id ? `/invoices/${id}` : '/invoices';
  }
  if (type === 'PURCHASE_INVOICE') {
    const id = purchaseInvoiceId || invoiceId || entityId;
    return id ? `/purchase-invoices/${id}` : '/purchase-invoices';
  }
  if (type === 'PAYMENT_REQUEST') {
    const id = paymentRequestId || entityId;
    return id ? `/payment-requests/${id}` : '/payment-requests';
  }
  if (type === 'DISPUTE') return '/vendor-admin/disputes';
  if (type === 'PARTY') {
    const id = partyId || entityId;
    return id ? `/parties/${id}` : '/parties';
  }
  if (type === 'EMPLOYEE') {
    const id = employeeId || entityId;
    return id ? `/hr/employee-master/${id}` : '/hr/employee-master';
  }
  if (type === 'TIMESHEET') return '/hr/timesheets';
  if (type === 'LOW_STOCK') return '/warehouse/stock?tab=low-stock';
  if (type === 'WMS') return '/warehouse/stock';
  if (type === 'HR') {
    if (employeeId) return `/hr/employee-master/${employeeId}`;
    const hrInferred = inferStaffNotificationPath({
      type: n.type,
      kind: n.kind,
      title: n.title,
      body: n.body,
    });
    if (hrInferred) return hrInferred;
    return '/hr/leave-request';
  }
  if (type === 'REPORT') return '/reports';

  if (entityType.includes('JOB') && entityId) return jobPath(entityId);
  if (entityType.includes('SHIPMENT') && entityId) return `/operations/shipments/${entityId}`;
  if (entityType.includes('QUOTATION') && entityId) return `/quotations/${entityId}`;
  if (entityType.includes('ENQUIRY') && entityId) return `/sales/enquiries/${entityId}`;
  if (entityType.includes('PURCHASE') && entityId) return `/purchase-invoices/${entityId}`;
  if (entityType.includes('INVOICE') && entityId) return `/invoices/${entityId}`;
  if (entityType.includes('PARTY') && entityId) return `/parties/${entityId}`;
  if (entityType.includes('PAYMENT') && entityId) return `/payment-requests/${entityId}`;

  if (jobId) return jobPath(jobId);
  if (shipmentId) return `/operations/shipments/${shipmentId}`;
  if (quotationId) return `/quotations/${quotationId}`;
  if (enquiryId) return `/sales/enquiries/${enquiryId}`;
  if (purchaseInvoiceId) return `/purchase-invoices/${purchaseInvoiceId}`;
  if (invoiceId) return `/invoices/${invoiceId}`;
  if (paymentRequestId) return `/payment-requests/${paymentRequestId}`;
  if (partyId) return `/parties/${partyId}`;
  if (employeeId) return `/hr/employee-master/${employeeId}`;

  return null;
}
