import {
  CONTAINER_STATUSES,
  type ContainerStatus,
} from '../constants/job.constants';
import type { JobContainer } from '../types/job.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickBool(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
  }
  return undefined;
}

function normalizeStatus(raw: unknown): ContainerStatus | undefined {
  const value = pickString(raw)?.toUpperCase().replace(/[\s-]+/g, '_');
  if (!value) return undefined;
  return (CONTAINER_STATUSES as readonly string[]).includes(value)
    ? (value as ContainerStatus)
    : (value as ContainerStatus);
}

function unwrapListItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const root = asRecord(raw);
  if (!root) return [];

  for (const key of ['items', 'results', 'containers', 'rows', 'data']) {
    if (Array.isArray(root[key])) return root[key] as unknown[];
  }

  const nested = asRecord(root.data);
  if (nested) {
    for (const key of ['items', 'results', 'containers', 'rows', 'data']) {
      if (Array.isArray(nested[key])) return nested[key] as unknown[];
    }
  }
  return [];
}

export function normalizeJobContainer(raw: unknown): JobContainer | null {
  const r = asRecord(raw);
  if (!r) return null;
  const nestedType = asRecord(r.container_type) ?? asRecord(r.containerType);
  const id = pickString(r.id, r.container_id, r.containerId);
  if (!id) return null;

  const container_type_id =
    pickString(r.container_type_id, r.containerTypeId, nestedType?.id) || '';

  const typeName = pickString(
    r.container_type_name,
    r.containerTypeName,
    nestedType?.name,
    nestedType?.label,
  );

  const typeCode = pickString(
    r.container_type_code,
    r.containerTypeCode,
    r.iso_size,
    r.isoSize,
    nestedType?.code,
    nestedType?.size,
    nestedType?.iso_size,
  );

  return {
    id,
    container_type_id,
    container_type_name: typeName,
    container_type_code: typeCode || undefined,
    iso_size: pickString(r.iso_size, r.isoSize, typeCode) || undefined,
    container_number: pickString(
      r.container_number,
      r.containerNumber,
      r.number,
      r.container_no,
    ),
    seal_number: pickString(r.seal_number, r.sealNumber, r.seal),
    status: normalizeStatus(
      r.status ?? r.container_status ?? r.containerStatus ?? r.state,
    ),
    tare_weight: pickNumber(r.tare_weight, r.tareWeight),
    max_payload: pickNumber(r.max_payload, r.maxPayload),
    cubic_capacity: pickNumber(r.cubic_capacity, r.cubicCapacity, r.cbm_capacity),
    gross_weight: pickNumber(r.gross_weight, r.grossWeight),
    vgm_weight: pickNumber(r.vgm_weight, r.vgmWeight),
    cbm: pickNumber(r.cbm, r.volume_cbm, r.volumeCbm, r.used_cbm, r.usedCbm),
    is_soc: pickBool(r.is_soc, r.isSoc, r.soc),
    gate_in_at: pickString(r.gate_in_at, r.gateInAt),
    updated_at: pickString(r.updated_at, r.updatedAt, r.touched_at, r.touchedAt),
    created_at: pickString(r.created_at, r.createdAt),
  };
}

export function normalizeJobContainers(raw: unknown): JobContainer[] {
  return unwrapListItems(raw)
    .map(normalizeJobContainer)
    .filter((c): c is JobContainer => Boolean(c));
}

export interface ContainerFillInfo {
  container_id: string;
  container_number?: string;
  /** 0–100 when known */
  fill_percent?: number;
  used_cbm?: number;
  capacity_cbm?: number;
  used_weight?: number;
  capacity_weight?: number;
  status?: string;
  message?: string;
  raw?: unknown;
}

function computeFillPercent(r: Record<string, unknown>): number | undefined {
  const direct = pickNumber(
    r.fill_percent,
    r.fillPercent,
    r.fill_pct,
    r.fillPct,
    r.utilization,
    r.utilization_pct,
    r.utilizationPct,
    r.percent,
    r.percentage,
  );
  if (direct != null) {
    // Some APIs return 0–1 fractions
    return direct > 0 && direct <= 1 ? Math.round(direct * 1000) / 10 : direct;
  }

  const usedCbm = pickNumber(
    r.used_cbm,
    r.usedCbm,
    r.cbm_used,
    r.cbmUsed,
    r.volume_used,
    r.occupied_cbm,
  );
  const capCbm = pickNumber(
    r.capacity_cbm,
    r.capacityCbm,
    r.cubic_capacity,
    r.cubicCapacity,
    r.max_cbm,
    r.maxCbm,
  );
  if (usedCbm != null && capCbm != null && capCbm > 0) {
    return Math.round((usedCbm / capCbm) * 1000) / 10;
  }

  const usedWt = pickNumber(
    r.used_weight,
    r.usedWeight,
    r.gross_weight,
    r.grossWeight,
    r.payload_used,
  );
  const capWt = pickNumber(
    r.capacity_weight,
    r.capacityWeight,
    r.max_payload,
    r.maxPayload,
    r.payload_capacity,
  );
  if (usedWt != null && capWt != null && capWt > 0) {
    return Math.round((usedWt / capWt) * 1000) / 10;
  }
  return undefined;
}

export function normalizeContainerFill(raw: unknown): ContainerFillInfo | null {
  const root = asRecord(raw);
  const r = asRecord(root?.data) ?? root;
  if (!r) return null;

  const container = asRecord(r.container);
  const container_id = pickString(
    r.container_id,
    r.containerId,
    r.id,
    container?.id,
  );
  if (!container_id) return null;

  const fill_percent = computeFillPercent(r);
  const used_cbm = pickNumber(r.used_cbm, r.usedCbm, r.cbm_used, r.cbm, r.occupied_cbm);
  const capacity_cbm = pickNumber(
    r.capacity_cbm,
    r.capacityCbm,
    r.cubic_capacity,
    r.cubicCapacity,
  );
  const used_weight = pickNumber(r.used_weight, r.usedWeight, r.gross_weight);
  const capacity_weight = pickNumber(
    r.capacity_weight,
    r.capacityWeight,
    r.max_payload,
    r.maxPayload,
  );

  let message = pickString(r.message, r.detail, r.error, r.reason);
  if (fill_percent == null && !message) {
    if (capacity_cbm == null && capacity_weight == null) {
      message = 'No capacity on container (set cubic capacity / max payload).';
    } else if (used_cbm == null && used_weight == null) {
      message = 'No cargo assigned — Fill % needs cargo volume or weight.';
    }
  }

  return {
    container_id,
    container_number: pickString(
      r.container_number,
      r.containerNumber,
      container?.container_number,
      container?.containerNumber,
    ),
    fill_percent,
    used_cbm,
    capacity_cbm,
    used_weight,
    capacity_weight,
    status: pickString(r.status, container?.status),
    message,
    raw,
  };
}

export function normalizeContainersFill(raw: unknown): ContainerFillInfo[] {
  const items = unwrapListItems(raw);
  if (items.length) {
    return items
      .map(normalizeContainerFill)
      .filter((f): f is ContainerFillInfo => Boolean(f));
  }
  const single = normalizeContainerFill(raw);
  return single ? [single] : [];
}

export function formatFillPercent(value?: number): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}%`;
}

/**
 * Path key for container APIs — prefer container_number, fall back to UUID.
 */
export function containerRouteKey(c: {
  id?: string;
  container_number?: string | null;
}): string {
  const number = String(c.container_number ?? '').trim();
  if (number) return number;
  return String(c.id ?? '').trim();
}
