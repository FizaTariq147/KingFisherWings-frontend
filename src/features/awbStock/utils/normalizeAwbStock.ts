import { isUuid } from '@/lib/isUuid';
import type { AwbAllocation, AwbStockBatch } from '../types/awbStock.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

export function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

export function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.batches) && nested.batches) ||
      (Array.isArray(nested.allocations) && nested.allocations) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

export function normalizeAwbAllocation(raw: unknown): AwbAllocation | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r || !r.id) return null;
  return {
    id: str(r.id)!,
    batch_id: pickString(r, 'batch_id', 'batchId') || undefined,
    airline_id: pickString(r, 'airline_id', 'airlineId') || undefined,
    awb_number: pickString(r, 'awb_number', 'awbNumber') || undefined,
    serial_number: num(r.serial_number ?? r.serialNumber),
    prefix: pickString(r, 'prefix') || undefined,
    job_id: pickString(r, 'job_id', 'jobId') || undefined,
    job_number: pickString(r, 'job_number', 'jobNumber') || undefined,
    status: pickString(r, 'status') || undefined,
    void_reason: pickString(r, 'void_reason', 'voidReason') || undefined,
    allocated_at: pickString(r, 'allocated_at', 'allocatedAt') || undefined,
    used_at: pickString(r, 'used_at', 'usedAt') || undefined,
    voided_at: pickString(r, 'voided_at', 'voidedAt') || undefined,
    created_at: pickString(r, 'created_at', 'createdAt') || undefined,
  };
}

export function normalizeAwbStockBatch(raw: unknown): AwbStockBatch | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r || !r.id) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;

  const range_from = num(r.range_from ?? r.rangeFrom) ?? 0;
  const range_to = num(r.range_to ?? r.rangeTo) ?? 0;
  const total =
    num(r.total_count ?? r.totalCount) ??
    (range_to >= range_from ? range_to - range_from + 1 : undefined);
  const remaining = num(r.remaining ?? r.remaining_count ?? r.remainingCount);
  const threshold = num(r.low_stock_threshold ?? r.lowStockThreshold);
  const isLow =
    typeof remaining === 'number' && typeof threshold === 'number'
      ? remaining <= threshold
      : Boolean(r.is_low_stock ?? r.isLowStock);

  const airline = asRecord(r.airline);
  const branch = asRecord(r.branch);
  const allocationsRaw = r.allocations ?? r.recent_allocations ?? r.recentAllocations;
  const allocations = Array.isArray(allocationsRaw)
    ? allocationsRaw.map(normalizeAwbAllocation).filter((a): a is AwbAllocation => Boolean(a))
    : undefined;

  return {
    id,
    airline_id: pickString(r, 'airline_id', 'airlineId') || pickString(airline ?? {}, 'id'),
    airline_name:
      pickString(r, 'airline_name', 'airlineName') ||
      pickString(airline ?? {}, 'name') ||
      undefined,
    airline_code:
      pickString(r, 'airline_code', 'airlineCode') ||
      pickString(airline ?? {}, 'code', 'iata_code') ||
      undefined,
    branch_id:
      pickString(r, 'branch_id', 'branchId') || pickString(branch ?? {}, 'id') || undefined,
    branch_name:
      pickString(r, 'branch_name', 'branchName') ||
      pickString(branch ?? {}, 'name') ||
      undefined,
    prefix: pickString(r, 'prefix'),
    range_from,
    range_to,
    next_number: num(r.next_number ?? r.nextNumber),
    remaining,
    total_count: total,
    used_count: num(r.used_count ?? r.usedCount),
    allocated_count: num(r.allocated_count ?? r.allocatedCount),
    low_stock_threshold: threshold,
    notes: pickString(r, 'notes') || undefined,
    is_low_stock: isLow,
    deleted_at: (str(r.deleted_at ?? r.deletedAt) as string | null | undefined) ?? null,
    created_at: pickString(r, 'created_at', 'createdAt') || undefined,
    updated_at: pickString(r, 'updated_at', 'updatedAt') || undefined,
    allocations,
  };
}

export function normalizeAwbStockBatches(items: unknown[]): AwbStockBatch[] {
  return items.map(normalizeAwbStockBatch).filter((b): b is AwbStockBatch => Boolean(b));
}

export function normalizeAwbAllocations(items: unknown[]): AwbAllocation[] {
  return items.map(normalizeAwbAllocation).filter((a): a is AwbAllocation => Boolean(a));
}

export function awbBatchDisplayLabel(b: AwbStockBatch): string {
  const airline = b.airline_code || b.airline_name || b.airline_id.slice(0, 8);
  return `${airline} ${b.prefix} · ${b.range_from}–${b.range_to}`;
}

export function computeTotalAwbs(from: number, to: number): number {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return 0;
  return to - from + 1;
}
