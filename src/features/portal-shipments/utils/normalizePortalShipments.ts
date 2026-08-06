import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  PortalMilestone,
  PortalShipmentDetail,
  PortalShipmentDocument,
  PortalShipmentListItem,
  PortalShipmentListResult,
  PortalShipmentSummary,
} from '../types/portalShipments.types';

function routeLabel(record: Record<string, unknown>, side: 'origin' | 'dest'): string {
  const nested =
    asRecord(record[side]) ||
    asRecord(record[`${side}_port`]) ||
    asRecord(record[side === 'dest' ? 'destination' : 'origin_port']);
  return (
    pickString(
      record[`${side}_name`],
      record[side === 'dest' ? 'destination' : 'origin'],
      nested?.name,
      nested?.code,
      nested?.city,
    ) || ''
  );
}

const TERMINAL_SHIPMENT_STATUSES = new Set([
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'CANCELED',
  'CLOSED',
]);

function sumByStatus(byStatus: Record<string, number>, predicate: (status: string) => boolean) {
  return Object.entries(byStatus).reduce((sum, [status, count]) => {
    return predicate(status.toUpperCase()) ? sum + count : sum;
  }, 0);
}

export function normalizeShipmentSummary(raw: unknown): PortalShipmentSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byStatusRaw = asRecord(data.by_status) ?? asRecord(data.byStatus) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [k, v] of Object.entries(byStatusRaw)) {
    const n = pickNumber(v);
    if (n !== undefined) byStatus[k] = n;
  }

  const byStatusTotal = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  const deliveredFromStatus = sumByStatus(byStatus, (s) => s === 'DELIVERED' || s === 'COMPLETED');
  const onHoldFromStatus = sumByStatus(byStatus, (s) => s === 'ON_HOLD' || s === 'HOLD');
  const activeFromStatus = sumByStatus(byStatus, (s) => !TERMINAL_SHIPMENT_STATUSES.has(s));

  return {
    total: pickNumber(data.total, data.total_shipments, data.count) ?? byStatusTotal,
    active: pickNumber(data.active, data.in_progress, data.inProgress) ?? activeFromStatus,
    delivered: pickNumber(data.delivered, data.completed) ?? deliveredFromStatus,
    onHold: pickNumber(data.on_hold, data.onHold) ?? onHoldFromStatus,
    byStatus,
    raw: data,
  };
}

export function normalizeShipmentListItem(raw: unknown): PortalShipmentListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.job_id, record.jobId);
  if (!id) return null;

  const origin = routeLabel(record, 'origin');
  const destination = routeLabel(record, 'dest');

  return {
    id,
    reference:
      pickString(
        record.reference,
        record.job_number,
        record.jobNumber,
        record.hawb_number,
        record.mawb_number,
        record.hbl_number,
        record.mbl_number,
        record.number,
      ) || id,
    jobType: pickString(record.job_type, record.jobType) || undefined,
    status: pickString(record.status, record.job_status) || undefined,
    origin: origin || undefined,
    destination: destination || undefined,
    etd: pickString(record.etd, record.etd_date) || undefined,
    eta: pickString(record.eta, record.eta_date) || undefined,
    updatedAt: pickString(record.updated_at, record.updatedAt) || undefined,
    raw: record,
  };
}

export function normalizeShipmentList(raw: unknown, params: { page?: number; limit?: number }): PortalShipmentListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'shipments', 'jobs', 'data']);
  const normalized = items
    .map(normalizeShipmentListItem)
    .filter((s): s is PortalShipmentListItem => Boolean(s));
  return {
    items: normalized,
    meta: normalizeMeta(meta, normalized.length, params),
  };
}

export function normalizeMilestone(raw: unknown): PortalMilestone | null {
  const record = asRecord(raw);
  if (!record) return null;
  const label =
    pickString(record.label, record.name, record.title, record.code, record.milestone) || '';
  const id = pickString(record.id, record.code, label);
  if (!id && !label) return null;
  return {
    id: id || label,
    code: pickString(record.code) || undefined,
    label: label || id,
    status: pickString(record.status) || undefined,
    occurredAt:
      pickString(record.occurred_at, record.occurredAt, record.event_at, record.timestamp, record.date) ||
      undefined,
    location: pickString(record.location, record.place) || undefined,
    notes: pickString(record.notes, record.remark, record.description) || undefined,
  };
}

export function normalizeMilestones(raw: unknown): PortalMilestone[] {
  const data = unwrapData(raw);
  const list = Array.isArray(data)
    ? data
    : (asRecord(data)?.milestones as unknown[]) ||
      (asRecord(data)?.items as unknown[]) ||
      [];
  return (Array.isArray(list) ? list : [])
    .map(normalizeMilestone)
    .filter((m): m is PortalMilestone => Boolean(m));
}

export function normalizeShipmentDocument(raw: unknown): PortalShipmentDocument | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.document_id, record.doc_id);
  if (!id) return null;
  return {
    id,
    name:
      pickString(record.name, record.file_name, record.filename, record.title, record.document_type) ||
      'Document',
    documentType: pickString(record.document_type, record.documentType, record.type) || undefined,
    mimeType: pickString(record.mime_type, record.mimeType, record.content_type) || undefined,
    createdAt: pickString(record.created_at, record.createdAt) || undefined,
    canDownload: record.can_download !== false && record.canDownload !== false,
  };
}

export function normalizeShipmentDocuments(raw: unknown): PortalShipmentDocument[] {
  const { items } = unwrapList(raw, ['items', 'results', 'documents', 'data']);
  return items
    .map(normalizeShipmentDocument)
    .filter((d): d is PortalShipmentDocument => Boolean(d));
}

export function normalizeShipmentDetail(raw: unknown): PortalShipmentDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const base = normalizeShipmentListItem(data);
  if (!base) return null;

  const cargo = asRecord(data.cargo) ?? asRecord(data.cargo_summary);
  const milestonesRaw = data.milestones ?? data.timeline;
  const docsRaw = data.documents;

  return {
    ...base,
    cargoSummary:
      pickString(data.cargo_summary, data.cargoSummary, cargo?.summary, cargo?.description) ||
      undefined,
    pieces: pickNumber(data.pieces, cargo?.pieces),
    grossWeight: pickNumber(data.gross_weight, data.grossWeight, cargo?.gross_weight),
    chargeableWeight: pickNumber(
      data.chargeable_weight,
      data.chargeableWeight,
      cargo?.chargeable_weight,
    ),
    volumeCbm: pickNumber(data.volume_cbm, data.volumeCbm, cargo?.volume_cbm),
    milestones: Array.isArray(milestonesRaw)
      ? milestonesRaw.map(normalizeMilestone).filter((m): m is PortalMilestone => Boolean(m))
      : [],
    documents: Array.isArray(docsRaw)
      ? docsRaw.map(normalizeShipmentDocument).filter((d): d is PortalShipmentDocument => Boolean(d))
      : undefined,
  };
}
