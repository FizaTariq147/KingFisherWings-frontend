/**
 * Costing getTab rollup — BE `parties_included` (job + shipment parity).
 * When the API omits it, derive a summary from charge lines for FE display.
 */

export interface CostingPartyCurrencyBreakdown {
  currency: string;
  sale_total?: number;
  cost_total?: number;
}

export interface CostingPartyIncluded {
  party_id: string;
  party_name: string;
  party_type?: string;
  /** BILL_TO | VENDOR | AGENT | … */
  role?: string;
  sale_total?: number;
  cost_total?: number;
  currency_breakdown?: CostingPartyCurrencyBreakdown[];
  line_count: number;
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
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function unwrapRoot(raw: unknown): Record<string, unknown> | null {
  const top = asRecord(raw);
  if (!top) return null;
  if ('data' in top) {
    const data = asRecord(top.data);
    if (data) return data;
  }
  return top;
}

function normalizeCurrencyBreakdown(raw: unknown): CostingPartyCurrencyBreakdown[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const r = asRecord(row);
      if (!r) return null;
      const currency = str(r.currency, r.currency_code, r.currencyCode).toUpperCase();
      if (!currency) return null;
      return {
        currency,
        sale_total: num(r.sale_total ?? r.saleTotal),
        cost_total: num(r.cost_total ?? r.costTotal),
      } satisfies CostingPartyCurrencyBreakdown;
    })
    .filter((x): x is CostingPartyCurrencyBreakdown => Boolean(x));
}

export function normalizePartiesIncluded(raw: unknown): CostingPartyIncluded[] {
  const root = unwrapRoot(raw) ?? asRecord(raw);
  // Only accept an explicit parties_included list — never treat charge rows as parties.
  const listRaw =
    root?.parties_included ?? root?.partiesIncluded ?? null;
  if (!Array.isArray(listRaw)) return [];

  return listRaw
    .map((row) => {
      const r = asRecord(row);
      if (!r) return null;
      const party_id = str(r.party_id, r.partyId, r.id);
      if (!party_id) return null;
      const party_name =
        str(r.party_name, r.partyName, r.name) || party_id.slice(0, 8);
      const line_count =
        num(r.line_count ?? r.lineCount ?? r.lines_count ?? r.count) ?? 0;
      return {
        party_id,
        party_name,
        party_type: str(r.party_type, r.partyType, r.type) || undefined,
        role: str(r.role, r.party_role, r.partyRole) || undefined,
        sale_total: num(r.sale_total ?? r.saleTotal),
        cost_total: num(r.cost_total ?? r.costTotal),
        currency_breakdown: normalizeCurrencyBreakdown(
          r.currency_breakdown ?? r.currencyBreakdown ?? r.currencies,
        ),
        line_count,
      } satisfies CostingPartyIncluded;
    })
    .filter((x): x is CostingPartyIncluded => Boolean(x));
}

export type ChargeLikeForPartyRollup = {
  party_id?: string;
  party_name?: string;
  sale_amount?: number;
  cost_amount?: number;
  currency_code?: string;
  is_cost?: boolean;
  sale?: {
    bill_to?: string;
    bill_to_name?: string;
    local_amount?: number;
    amount?: number;
    currency?: string;
  };
  cost?: {
    vendor?: string;
    vendor_name?: string;
    local_amount?: number;
    amount?: number;
    currency?: string;
  };
};

/**
 * Client-side rollup when BE has not yet returned `parties_included`.
 * Groups bill-to (sale) and vendor (cost) parties from dual-sided lines.
 */
export function derivePartiesIncludedFromCharges(
  charges: ChargeLikeForPartyRollup[],
): CostingPartyIncluded[] {
  type Acc = {
    party_id: string;
    party_name: string;
    role: string;
    sale_total: number;
    cost_total: number;
    line_count: number;
    byCcy: Map<string, { sale: number; cost: number }>;
  };
  const map = new Map<string, Acc>();

  const bump = (
    partyId: string,
    partyName: string,
    role: string,
    sale: number,
    cost: number,
    currency: string,
  ) => {
    if (!partyId) return;
    const key = `${role}:${partyId}`;
    let acc = map.get(key);
    if (!acc) {
      acc = {
        party_id: partyId,
        party_name: partyName || partyId.slice(0, 8),
        role,
        sale_total: 0,
        cost_total: 0,
        line_count: 0,
        byCcy: new Map(),
      };
      map.set(key, acc);
    }
    acc.sale_total += sale;
    acc.cost_total += cost;
    acc.line_count += 1;
    if (partyName && acc.party_name.length < partyName.length) {
      acc.party_name = partyName;
    }
    const ccy = (currency || 'AED').toUpperCase();
    const cur = acc.byCcy.get(ccy) ?? { sale: 0, cost: 0 };
    cur.sale += sale;
    cur.cost += cost;
    acc.byCcy.set(ccy, cur);
  };

  for (const c of charges) {
    const saleAmt =
      c.sale_amount ?? c.sale?.local_amount ?? c.sale?.amount ?? undefined;
    const costAmt =
      c.cost_amount ?? c.cost?.local_amount ?? c.cost?.amount ?? undefined;
    const salePartyId = c.sale?.bill_to || (saleAmt != null ? c.party_id : undefined);
    const costPartyId = c.cost?.vendor || (costAmt != null || c.is_cost ? c.party_id : undefined);
    const saleName = c.sale?.bill_to_name || c.party_name || '';
    const costName = c.cost?.vendor_name || c.party_name || '';
    const saleCcy = c.sale?.currency || c.currency_code || 'AED';
    const costCcy = c.cost?.currency || c.currency_code || 'AED';

    if (salePartyId && (saleAmt != null || Boolean(c.sale))) {
      bump(salePartyId, saleName, 'BILL_TO', saleAmt ?? 0, 0, saleCcy);
    }
    if (costPartyId && (costAmt != null || Boolean(c.cost) || c.is_cost)) {
      bump(costPartyId, costName, 'VENDOR', 0, costAmt ?? 0, costCcy);
    }
    // Single-sided line with only party_id
    if (!salePartyId && !costPartyId && c.party_id) {
      if (c.is_cost || (costAmt != null && saleAmt == null)) {
        bump(c.party_id, c.party_name || '', 'VENDOR', 0, costAmt ?? c.cost_amount ?? 0, costCcy);
      } else {
        bump(
          c.party_id,
          c.party_name || '',
          'BILL_TO',
          saleAmt ?? c.sale_amount ?? 0,
          0,
          saleCcy,
        );
      }
    }
  }

  return [...map.values()].map((acc) => ({
    party_id: acc.party_id,
    party_name: acc.party_name,
    role: acc.role,
    sale_total: acc.sale_total || undefined,
    cost_total: acc.cost_total || undefined,
    line_count: acc.line_count,
    currency_breakdown: [...acc.byCcy.entries()].map(([currency, v]) => ({
      currency,
      sale_total: v.sale || undefined,
      cost_total: v.cost || undefined,
    })),
  }));
}

export function resolvePartiesIncluded(
  raw: unknown,
  charges: ChargeLikeForPartyRollup[],
): CostingPartyIncluded[] {
  const fromApi = normalizePartiesIncluded(raw);
  if (fromApi.length) return fromApi;
  return derivePartiesIncludedFromCharges(charges);
}
