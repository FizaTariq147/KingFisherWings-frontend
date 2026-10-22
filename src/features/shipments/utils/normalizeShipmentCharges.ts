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
  sale_amount?: number;
  cost_amount?: number;
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
    'sale_charges',
    'cost_charges',
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
  // Dual arrays: merge sale + cost lists when present
  const sale = Array.isArray(rec.sale) ? (rec.sale as unknown[]) : [];
  const cost = Array.isArray(rec.cost) ? (rec.cost as unknown[]) : [];
  if (sale.length || cost.length) return [...sale, ...cost];
  return [];
}

export function normalizeShipmentCharge(
  raw: unknown,
  index = 0,
): ShipmentChargeRow | null {
  const r = asRecord(raw);
  if (!r) return null;

  const chargeSec = asRecord(r.charge);
  const sale = asRecord(r.sale);
  const cost = asRecord(r.cost);
  const party = asRecord(r.party);

  const id =
    str(
      r.id,
      r.charge_id,
      r.chargeId,
      r.shipment_charge_id,
      r.shipmentChargeId,
      chargeSec?.id,
    ) || `row-${index}`;

  const saleAmt =
    num(r.sale_amount ?? r.saleAmount) ??
    num(sale?.amount ?? sale?.local_amount ?? sale?.unit_price ?? sale?.amount_per_qty);
  const costAmt =
    num(r.cost_amount ?? r.costAmount) ??
    num(cost?.amount ?? cost?.local_amount ?? cost?.unit_price ?? cost?.amount_per_qty);

  const unitPrice =
    num(r.unit_price ?? r.unitPrice ?? r.amount_per_unit ?? r.amountPerUnit) ??
    saleAmt ??
    costAmt ??
    0;

  const isCostFlag = bool(r.is_cost ?? r.isCost);
  const is_cost =
    isCostFlag === true
      ? true
      : saleAmt == null && costAmt != null
        ? true
        : isCostFlag === false
          ? false
          : undefined;

  return {
    id,
    charge_code_id:
      str(r.charge_code_id, r.chargeCodeId) ||
      str(chargeSec?.charge_code_id, chargeSec?.chargeCodeId) ||
      undefined,
    charge_code:
      str(r.charge_code, r.chargeCode, r.code) ||
      str(chargeSec?.charge_code, chargeSec?.code) ||
      undefined,
    description:
      str(r.description, r.name, r.charge_name, r.chargeName) ||
      str(chargeSec?.description, chargeSec?.name) ||
      '—',
    quantity:
      num(r.quantity ?? r.qty) ??
      num(chargeSec?.quantity) ??
      num(sale?.qty ?? sale?.quantity) ??
      num(cost?.qty ?? cost?.quantity),
    unit_price: unitPrice,
    currency_code: (
      str(r.currency_code, r.currencyCode, r.currency) ||
      str(sale?.currency, sale?.currency_code) ||
      str(cost?.currency, cost?.currency_code) ||
      'AED'
    ).toUpperCase(),
    is_cost,
    party_id:
      str(r.party_id, r.partyId) ||
      str(sale?.bill_to, cost?.vendor) ||
      undefined,
    party_name:
      str(r.party_name, r.partyName) ||
      str(party?.name, party?.party_name) ||
      undefined,
    line_total: num(r.line_total ?? r.lineTotal) ?? saleAmt ?? costAmt,
    sale_amount: saleAmt,
    cost_amount: costAmt,
  };
}

export function normalizeShipmentCharges(raw: unknown): ShipmentChargeRow[] {
  return unwrapItems(raw)
    .map((row, i) => normalizeShipmentCharge(row, i))
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

/** Drop undefined / empty-string keys so Nest validation does not reject the body. */
export function compactShipmentChargeDto<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(dto)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && !v.trim()) continue;
    out[k] = v;
  }
  return out as T;
}
