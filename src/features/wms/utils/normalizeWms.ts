import type {
  WmsDocument,
  WmsItem,
  WmsItemListParams,
  WmsPaginationMeta,
  WmsSettings,
  WmsStockRow,
} from '../types/wms.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value).trim();
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return fallback;
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

  const candidates: unknown[] = [
    envelope.data,
    envelope.items,
    envelope.results,
    envelope.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return { items: candidate, meta: envelope.meta };
    }
    const nested = asRecord(candidate);
    if (!nested) continue;
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.rows) && nested.rows) ||
      (Array.isArray(nested.data) && nested.data) ||
      null;
    if (list) {
      return { items: list, meta: nested.meta ?? envelope.meta };
    }
  }

  return { items: [] };
}

export function normalizePaginationMeta(
  raw: unknown,
  fallbackTotal: number,
  params: WmsItemListParams,
): WmsPaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

export function normalizeWmsSettings(raw: unknown): WmsSettings | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r) return null;
  const method = pickString(r, 'valuation_method', 'valuationMethod');
  return {
    valuation_method: (method === 'LIFO' ? 'LIFO' : 'FIFO') as WmsSettings['valuation_method'],
    default_free_days: num(r.default_free_days ?? r.defaultFreeDays) ?? 0,
    default_storage_rate: num(r.default_storage_rate ?? r.defaultStorageRate) ?? 0,
    default_currency: pickString(r, 'default_currency', 'defaultCurrency', 'currency_code').toUpperCase() || 'AED',
  };
}

export function normalizeWmsItem(raw: unknown): WmsItem | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r || !r.id) return null;
  return {
    id: str(r.id),
    code: pickString(r, 'code'),
    name: pickString(r, 'name'),
    description: pickString(r, 'description') || undefined,
    uom_code: pickString(r, 'uom_code', 'uomCode') || undefined,
    low_stock_threshold: num(r.low_stock_threshold ?? r.lowStockThreshold),
    is_active: bool(r.is_active ?? r.isActive, true),
    created_at: pickString(r, 'created_at', 'createdAt') || undefined,
    updated_at: pickString(r, 'updated_at', 'updatedAt') || undefined,
  };
}

export function normalizeWmsItems(items: unknown[]): WmsItem[] {
  return items.map(normalizeWmsItem).filter((i): i is WmsItem => Boolean(i));
}

export function normalizeWmsDocument(raw: unknown): WmsDocument | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r || !r.id) return null;
  const linesRaw = r.lines ?? r.line_items ?? r.lineItems;
  return {
    id: str(r.id),
    document_number: pickString(r, 'document_number', 'documentNumber', 'asn_number', 'grn_number', 'gdo_number', 'transfer_number') || undefined,
    status: pickString(r, 'status') || undefined,
    warehouse_id: pickString(r, 'warehouse_id', 'warehouseId') || undefined,
    party_id: pickString(r, 'party_id', 'partyId') || undefined,
    job_id: pickString(r, 'job_id', 'jobId') || undefined,
    remarks: pickString(r, 'remarks') || undefined,
    created_at: pickString(r, 'created_at', 'createdAt') || undefined,
    updated_at: pickString(r, 'updated_at', 'updatedAt') || undefined,
    lines: Array.isArray(linesRaw) ? linesRaw : undefined,
    ...r,
  };
}

export function normalizeWmsDocuments(items: unknown[]): WmsDocument[] {
  return items.map(normalizeWmsDocument).filter((d): d is WmsDocument => Boolean(d));
}

export function normalizeStockRows(items: unknown[]): WmsStockRow[] {
  return items.map((raw) => {
    const r = asRecord(raw);
    if (!r) return {};
    return {
      id: pickString(r, 'id', 'lot_id', 'lotId') || undefined,
      warehouse_id: pickString(r, 'warehouse_id', 'warehouseId') || undefined,
      warehouse_name: pickString(r, 'warehouse_name', 'warehouseName', 'warehouse') || undefined,
      item_id: pickString(r, 'item_id', 'itemId') || undefined,
      item_code: pickString(r, 'item_code', 'itemCode', 'code') || undefined,
      item_name: pickString(r, 'item_name', 'itemName', 'name') || undefined,
      quantity: num(r.quantity ?? r.on_hand ?? r.onHand ?? r.qty),
      uom_code: pickString(r, 'uom_code', 'uomCode') || undefined,
      ...r,
    };
  });
}

export function displayDocNumber(doc: WmsDocument): string {
  return doc.document_number || doc.id.slice(0, 8);
}
