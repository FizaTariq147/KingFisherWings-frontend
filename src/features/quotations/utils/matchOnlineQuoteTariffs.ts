import type { Tariff } from '@/features/tariffs/types/tariff.types';

function isoToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function inValidityWindow(tariff: Tariff, onDate: string): boolean {
  if (tariff.valid_from && tariff.valid_from > onDate) return false;
  if (tariff.valid_to && tariff.valid_to < onDate) return false;
  return true;
}

export type OnlineQuoteTariffMatchInput = {
  jobType?: string;
  originPortId?: string;
  destPortId?: string;
  containerTypeId?: string;
  currencyCode?: string;
  onDate?: string;
};

/**
 * Pick Online Tariff Master rows that match the online-quote lane.
 * Prefer exact lane matches; fall back to service-type-only general rates.
 * Values come from GET /quotations/tariffs — nothing is invented here.
 */
export function matchOnlineQuoteTariffs(
  tariffs: Tariff[],
  input: OnlineQuoteTariffMatchInput,
): Tariff[] {
  const jobType = input.jobType?.trim().toUpperCase();
  if (!jobType) return [];

  const onDate = input.onDate || isoToday();
  const currency = input.currencyCode?.trim().toUpperCase();
  const origin = input.originPortId?.trim();
  const dest = input.destPortId?.trim();
  const container = input.containerTypeId?.trim();

  const active = tariffs.filter(
    (t) =>
      t.is_active !== false &&
      !t.deleted_at &&
      t.service_type === jobType &&
      inValidityWindow(t, onDate) &&
      (!currency || t.currency_code === currency),
  );

  const score = (t: Tariff): number => {
    let s = 0;
    if (origin && t.origin_port_id === origin) s += 4;
    else if (origin && t.origin_port_id && t.origin_port_id !== origin) return -1;
    if (dest && t.dest_port_id === dest) s += 4;
    else if (dest && t.dest_port_id && t.dest_port_id !== dest) return -1;
    if (container && t.container_type_id === container) s += 2;
    else if (container && t.container_type_id && t.container_type_id !== container) return -1;
    if (!t.customer_id) s += 1; // general rate preferred for public online quote
    return s;
  };

  const ranked = active
    .map((t) => ({ t, s: score(t) }))
    .filter((row) => row.s >= 0)
    .sort((a, b) => b.s - a.s || a.t.sale_rate - b.t.sale_rate);

  if (!ranked.length) return [];

  const best = ranked[0]?.s ?? 0;
  // Keep top-scoring matches (same lane specificity), unique by charge_code_id.
  const seen = new Set<string>();
  const out: Tariff[] = [];
  for (const row of ranked) {
    if (row.s < best && out.length > 0) break;
    const key = row.t.charge_code_id || row.t.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row.t);
  }
  return out;
}

export function tariffChargeLabel(tariff: Tariff): string {
  return [tariff.charge_code, tariff.charge_name].filter(Boolean).join(' — ') || tariff.charge_code_id;
}
