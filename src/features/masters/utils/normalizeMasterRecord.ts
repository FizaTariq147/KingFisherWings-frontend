import type { MasterRecord } from '../types/master.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickDeletedAt(raw: Record<string, unknown>): string | null {
  const value = raw.deleted_at ?? raw.deletedAt;
  if (typeof value === 'string' && value) return value;
  if (raw.is_deleted === true || raw.isDeleted === true) return new Date().toISOString();
  return null;
}

function coerceIsActive(raw: Record<string, unknown>, deletedAt: string | null): boolean {
  if (deletedAt) return false;
  const flag = raw.is_active ?? raw.isActive;
  if (typeof flag === 'boolean') return flag;
  if (flag === 'true' || flag === 1 || flag === '1') return true;
  if (flag === 'false' || flag === 0 || flag === '0') return false;
  return true;
}

function pickId(raw: Record<string, unknown>): string {
  const id = raw.id ?? raw._id;
  if (typeof id === 'string' && id) return id;
  if (typeof id === 'number') return String(id);
  return '';
}

/** Normalize one master API row to a stable MasterRecord. */
export function normalizeMasterRecord(raw: unknown): MasterRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickId(record);
  if (!id) return null;
  const deletedAt = pickDeletedAt(record);
  const iso =
    String(record.iso_code ?? record.isoCode ?? '')
      .trim()
      .toUpperCase() || undefined;

  return {
    ...record,
    id,
    ...(iso ? { iso_code: iso } : {}),
    is_active: coerceIsActive(record, deletedAt),
    deleted_at: deletedAt,
  };
}

/** Prefer a 2-letter ISO country code from a master row. */
export function pickCountryIsoCode(record: MasterRecord): string {
  const candidates = [record.iso_code, record.isoCode, record.country_code, record.countryCode];
  for (const c of candidates) {
    const s = String(c ?? '')
      .trim()
      .toUpperCase();
    if (/^[A-Z]{2}$/.test(s)) return s;
  }
  return '';
}

export function normalizeMasterRecords(raw: unknown): MasterRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeMasterRecord)
    .filter((item): item is MasterRecord => Boolean(item));
}

/** Display string for a cell / title. */
export function masterDisplayValue(record: MasterRecord, key: string): string {
  const value = record[key];
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.trim() || '—';
  if (Array.isArray(value)) return value.map(String).join(', ') || '—';
  return String(value);
}
