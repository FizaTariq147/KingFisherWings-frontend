import type { OpsEntityType } from '../types/opsActivity.types';

export type OpsLifecycleLinks = {
  enquiryId?: string | null;
  quotationId?: string | null;
  shipmentId?: string | null;
  jobId?: string | null;
  invoiceId?: string | null;
  purchaseInvoiceId?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function mapEntityType(raw: string): OpsEntityType | null {
  const n = raw.trim().toUpperCase().replace(/-/g, '_');
  if (n === 'ENQUIRY' || n === 'ENQUIRIES') return 'ENQUIRY';
  if (n === 'QUOTATION' || n === 'QUOTE') return 'QUOTATION';
  if (n === 'SHIPMENT') return 'SHIPMENT';
  if (n === 'JOB') return 'JOB';
  if (n === 'INVOICE' || n === 'SALES_INVOICE' || n === 'AR_INVOICE') return 'INVOICE';
  if (
    n === 'PURCHASE_INVOICE' ||
    n === 'PURCHASE' ||
    n === 'PI' ||
    n === 'AP_INVOICE'
  ) {
    return 'PURCHASE_INVOICE';
  }
  return null;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function uuidOrNull(value: unknown): string | null {
  const s = String(value ?? '').trim();
  return s && isUuidLike(s) ? s : null;
}

/** Normalize lifecycle ids from detail pages (ignores empty / non-UUID). */
export function buildOpsLifecycleLinks(
  links?: OpsLifecycleLinks | null,
): OpsLifecycleLinks {
  return {
    enquiryId: uuidOrNull(links?.enquiryId),
    quotationId: uuidOrNull(links?.quotationId),
    shipmentId: uuidOrNull(links?.shipmentId),
    jobId: uuidOrNull(links?.jobId),
    invoiceId: uuidOrNull(links?.invoiceId),
    purchaseInvoiceId: uuidOrNull(links?.purchaseInvoiceId),
  };
}

export function opsLifecycleHostLabel(host: {
  entityType: OpsEntityType;
  entityId: string;
}): string {
  switch (host.entityType) {
    case 'ENQUIRY':
      return 'Enquiry';
    case 'QUOTATION':
      return 'Quotation';
    case 'SHIPMENT':
      return 'Shipment';
    case 'INVOICE':
      return 'Invoice';
    case 'PURCHASE_INVOICE':
      return 'Purchase invoice';
    case 'JOB':
    default:
      return 'Job';
  }
}

/**
 * Resolve which /ops/:entityType/:entityId host to use so continuum stays
 * synced across Enquiry → Quotation → Shipment → Job.
 *
 * Priority:
 * 1. Explicit sync root from detail `ops_continuum.root_entity_*` only
 *    (plain entity_type/entity_id often means "this page", not the shared root)
 * 2. Earliest lifecycle entity that exists (Enquiry → Quotation → Shipment → Job)
 * 3. Current page entity
 */
export function resolveOpsContinuumEntity(opts: {
  entityType: OpsEntityType;
  entityId: string;
  opsContinuum?: Record<string, unknown> | null;
  links?: OpsLifecycleLinks | null;
}): { entityType: OpsEntityType; entityId: string } {
  const continuum = asRecord(opts.opsContinuum);
  if (continuum) {
    const rootTypeRaw = String(
      continuum.root_entity_type ?? continuum.rootEntityType ?? '',
    ).trim();
    const rootId = String(
      continuum.root_entity_id ?? continuum.rootEntityId ?? '',
    ).trim();
    const mapped = rootTypeRaw ? mapEntityType(rootTypeRaw) : null;
    if (mapped && isUuidLike(rootId)) {
      return { entityType: mapped, entityId: rootId };
    }
  }

  const links = buildOpsLifecycleLinks(opts.links);
  if (links.enquiryId) {
    return { entityType: 'ENQUIRY', entityId: links.enquiryId };
  }
  if (links.quotationId) {
    return { entityType: 'QUOTATION', entityId: links.quotationId };
  }
  if (links.shipmentId) {
    return { entityType: 'SHIPMENT', entityId: links.shipmentId };
  }
  if (links.jobId) {
    return { entityType: 'JOB', entityId: links.jobId };
  }
  if (links.invoiceId) {
    return { entityType: 'INVOICE', entityId: links.invoiceId };
  }
  if (links.purchaseInvoiceId) {
    return { entityType: 'PURCHASE_INVOICE', entityId: links.purchaseInvoiceId };
  }

  const currentId = uuidOrNull(opts.entityId) ?? String(opts.entityId ?? '').trim();
  return { entityType: opts.entityType, entityId: currentId };
}
