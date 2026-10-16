import type { OpsEntityType } from '../types/opsActivity.types';

export type OpsLifecycleLinks = {
  enquiryId?: string | null;
  quotationId?: string | null;
  shipmentId?: string | null;
  jobId?: string | null;
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
  return null;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/**
 * Resolve which /ops/:entityType/:entityId host to use so continuum stays
 * synced across Enquiry → Quotation → Shipment → Job.
 *
 * Priority:
 * 1. Explicit root from detail `ops_continuum` payload
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
      continuum.root_entity_type ??
        continuum.rootEntityType ??
        continuum.entity_type ??
        continuum.entityType ??
        '',
    ).trim();
    const rootId = String(
      continuum.root_entity_id ??
        continuum.rootEntityId ??
        continuum.entity_id ??
        continuum.entityId ??
        '',
    ).trim();
    const mapped = rootTypeRaw ? mapEntityType(rootTypeRaw) : null;
    if (mapped && isUuidLike(rootId)) {
      return { entityType: mapped, entityId: rootId };
    }
  }

  const links = opts.links;
  if (links?.enquiryId && isUuidLike(String(links.enquiryId))) {
    return { entityType: 'ENQUIRY', entityId: String(links.enquiryId) };
  }
  if (links?.quotationId && isUuidLike(String(links.quotationId))) {
    return { entityType: 'QUOTATION', entityId: String(links.quotationId) };
  }
  if (links?.shipmentId && isUuidLike(String(links.shipmentId))) {
    return { entityType: 'SHIPMENT', entityId: String(links.shipmentId) };
  }
  if (links?.jobId && isUuidLike(String(links.jobId))) {
    return { entityType: 'JOB', entityId: String(links.jobId) };
  }

  return { entityType: opts.entityType, entityId: opts.entityId };
}
