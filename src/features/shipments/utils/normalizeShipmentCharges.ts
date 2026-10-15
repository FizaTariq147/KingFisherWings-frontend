import { isUuid } from '@/lib/isUuid';

export interface ShipmentChargeRow {
  id: string;
  charge_code_id?: string;
  charge_code?: string;
  description: string;
  quantity?: number;
  unit_price: number;
  currency_code: string;
  is_cost?: boolean;
  party_id?: string;
  party_name?: string;
  line_total?: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function num(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

function unwrapItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of [
    'charges',
    'items',
    'lines',
    'preview_charges',
    'data',
    'results',
  ]) {
    const v = rec[key];
    if (Array.isArray(v)) return v;
    const nested = asRecord(v);
    if (nested) {
      for (const nk of ['charges', 'items', 'lines', 'data']) {
        if (Array.isArray(nested[nk])) return nested[nk] as unknown[];
      }
    }
  }
  return [];
}

export function normalizeShipmentCharge(raw: unknown): ShipmentChargeRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id, r.charge_id, r.chargeId);
  if (!id) return null;
  const party = asRecord(r.party);
  return {
    id,
    charge_code_id: str(r.charge_code_id, r.chargeCodeId) || undefined,
    charge_code: str(r.charge_code, r.chargeCode) || undefined,
    description: str(r.description, r.name) || '—',
    quantity: num(r.quantity),
    unit_price: num(r.unit_price ?? r.unitPrice) ?? 0,
    currency_code: (str(r.currency_code, r.currencyCode, r.currency) || 'AED').toUpperCase(),
    is_cost: bool(r.is_cost ?? r.isCost),
    party_id: str(r.party_id, r.partyId) || undefined,
    party_name:
      str(r.party_name, r.partyName) ||
      str(party?.name, party?.party_name) ||
      undefined,
    line_total: num(r.line_total ?? r.lineTotal),
  };
}

export function normalizeShipmentCharges(raw: unknown): ShipmentChargeRow[] {
  return unwrapItems(raw)
    .map(normalizeShipmentCharge)
    .filter((c): c is ShipmentChargeRow => Boolean(c));
}

/** True when GET /shipments/:id/detail `tabs` key is the Costing tab (API-driven). */
export function isShipmentCostingTab(key: string): boolean {
  const k = key.trim().toLowerCase().replace(/-/g, '_');
  return k === 'costing' || k === 'charges' || k === 'cost';
}

export function shipmentChargeSelectableId(row: ShipmentChargeRow): string {
  return isUuid(row.id) ? row.id : row.id;
}
