import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  PortalContainerRequest,
  PortalMilestone,
  PortalShipmentDetail,
  PortalShipmentDocument,
  PortalShipmentListItem,
  PortalShipmentListResult,
  PortalShipmentSummary,
  PortalUldRequest,
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
    total:
      pickNumber(
        data.total,
        data.total_shipments,
        data.totalShipments,
        data.shipments_total,
        data.shipmentsTotal,
        data.count,
      ) ?? byStatusTotal,
    active:
      pickNumber(
        data.active,
        data.active_count,
        data.activeCount,
        data.active_shipments,
        data.activeShipments,
        data.in_progress,
        data.inProgress,
        data.open,
        data.open_count,
        data.openCount,
      ) ?? activeFromStatus,
    delivered: pickNumber(data.delivered, data.completed, data.delivered_count) ?? deliveredFromStatus,
    onHold: pickNumber(data.on_hold, data.onHold, data.hold) ?? onHoldFromStatus,
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

export function normalizePortalContainerRequest(raw: unknown): PortalContainerRequest | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.request_id, record.line_id, record.lineId);
  if (!id) return null;
  const lineId = pickString(record.line_id, record.lineId, record.container_line_id, record.id) || id;
  const status = pickString(record.status, record.request_status) || undefined;
  const picked =
    status?.toUpperCase().includes('PICK') ||
    status?.toUpperCase() === 'PICKED' ||
    status?.toUpperCase() === 'ALLOCATED';
  return {
    id,
    lineId,
    status,
    containerType: pickString(
      record.container_type_code,
      record.container_type,
      record.containerType,
      asRecord(record.container_type)?.code,
      asRecord(record.container_type)?.name,
    ) || undefined,
    containerNumber: pickString(record.container_number, record.containerNumber) || undefined,
    croNumber: pickString(record.cro_number, record.croNumber, record.cro_reference) || undefined,
    quantity: pickNumber(record.quantity, record.container_count),
    canConfirmPick:
      record.can_confirm_pick === false || record.canConfirmPick === false
        ? false
        : !picked,
    notes: pickString(record.notes) || undefined,
    raw: record,
  };
}

export function normalizePortalContainerRequests(raw: unknown): PortalContainerRequest[] {
  const { items } = unwrapList(raw, [
    'items',
    'results',
    'container_requests',
    'requests',
    'containers',
    'data',
  ]);
  return items
    .map(normalizePortalContainerRequest)
    .filter((r): r is PortalContainerRequest => Boolean(r));
}

export function normalizePortalUldRequest(raw: unknown): PortalUldRequest | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.request_id, record.line_id, record.lineId);
  if (!id) return null;
  const lineId = pickString(record.line_id, record.lineId, record.uld_line_id, record.id) || id;
  const status = pickString(record.status, record.request_status) || undefined;
  const dropped =
    status?.toUpperCase().includes('DROP') ||
    status?.toUpperCase() === 'DROPPED' ||
    status?.toUpperCase() === 'CARGO_DROPPED_OFF';
  return {
    id,
    lineId,
    status,
    palletType:
      pickString(
        record.air_pallet_type_code,
        record.pallet_type,
        record.palletType,
        asRecord(record.air_pallet_type)?.code,
        asRecord(record.air_pallet_type)?.name,
      ) || undefined,
    uldNumber: pickString(record.uld_number, record.uldNumber, record.container_number) || undefined,
    quantity: pickNumber(record.quantity, record.uld_count),
    canConfirmDropoff:
      record.can_confirm_dropoff === false || record.canConfirmDropoff === false
        ? false
        : !dropped,
    notes: pickString(record.notes) || undefined,
    raw: record,
  };
}

export function normalizePortalUldRequests(raw: unknown): PortalUldRequest[] {
  const { items } = unwrapList(raw, [
    'items',
    'results',
    'uld_requests',
    'requests',
    'uld_lines',
    'data',
  ]);
  return items.map(normalizePortalUldRequest).filter((r): r is PortalUldRequest => Boolean(r));
}
