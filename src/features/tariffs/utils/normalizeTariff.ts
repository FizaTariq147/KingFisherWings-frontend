import {
  TARIFF_SERVICE_TYPES,
  type TariffServiceType,
} from '../constants/tariff.constants';
import type { Tariff } from '../types/tariff.types';

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

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

function normalizeServiceType(value: unknown): TariffServiceType {
  const raw = String(value ?? 'SEA_FCL_EXPORT').trim().toUpperCase();
  return (TARIFF_SERVICE_TYPES as readonly string[]).includes(raw)
    ? (raw as TariffServiceType)
    : 'SEA_FCL_EXPORT';
}

export function normalizeTariff(raw: unknown): Tariff | null {
  const r = asRecord(raw);
  if (!r) return null;
  // Prefer standard UUID; still accept other id strings so list rows are not dropped.
  const id =
    str(r.id) ||
    str(r.tariff_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;

  const origin = asRecord(r.origin_port) ?? asRecord(r.origin);
  const dest = asRecord(r.dest_port) ?? asRecord(r.destination);
  const charge = asRecord(r.charge_code) ?? asRecord(r.charge);
  const container = asRecord(r.container_type) ?? asRecord(r.container);
  const customer = asRecord(r.customer) ?? asRecord(r.party);

  return {
    id,
    service_type: normalizeServiceType(r.service_type),
    origin_port_id: str(r.origin_port_id),
    dest_port_id: str(r.dest_port_id),
    origin_port_code: str(r.origin_port_code) ?? str(origin?.code),
    dest_port_code: str(r.dest_port_code) ?? str(dest?.code),
    origin_port_name: str(r.origin_port_name) ?? str(origin?.name),
    dest_port_name: str(r.dest_port_name) ?? str(dest?.name),
    container_type_id: str(r.container_type_id),
    container_type_code:
      str(r.container_type_code) ?? str(container?.code) ?? str(container?.name),
    charge_code_id: str(r.charge_code_id) ?? '',
    charge_code:
      str(r.charge_code_code) ??
      (typeof r.charge_code === 'string' ? str(r.charge_code) : str(charge?.code)),
    charge_name: str(r.charge_name) ?? str(charge?.name),
    customer_id: str(r.customer_id),
    customer_name: str(r.customer_name) ?? str(customer?.name),
    unit: str(r.unit),
    sale_rate: num(r.sale_rate) ?? 0,
    cost_rate: num(r.cost_rate) ?? 0,
    currency_code: (str(r.currency_code) ?? 'AED').toUpperCase(),
    valid_from: (str(r.valid_from) ?? '').slice(0, 10),
    valid_to: str(r.valid_to)?.slice(0, 10),
    is_active: bool(r.is_active) ?? true,
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    remarks: str(r.remarks),
  };
}

export function normalizeTariffs(raw: unknown): Tariff[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeTariff).filter((t): t is Tariff => Boolean(t));
}

export function tariffDisplayLabel(t: Tariff): string {
  const charge = t.charge_code || t.charge_name || t.charge_code_id.slice(0, 8);
  return `${t.service_type} · ${charge}`;
}
