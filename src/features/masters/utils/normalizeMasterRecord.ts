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

function pickScalar(...values: unknown[]): string | number | boolean | undefined {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function snakeFromCamel(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/** Resolve a display/form field across snake_case, camelCase, and known aliases. */
export function pickMasterField(
  record: MasterRecord | Record<string, unknown>,
  key: string,
): unknown {
  if (key in record && record[key] != null && record[key] !== '') return record[key];

  const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  if (camel in record && record[camel] != null && record[camel] !== '') return record[camel];

  const aliases: Record<string, string[]> = {
    un_locode: ['unLocode', 'unlocode', 'locode', 'code', 'port_code', 'portCode'],
    iata_code: ['iataCode', 'iata', 'code', 'airport_code', 'airportCode'],
    icao_code: ['icaoCode', 'icao'],
    country_code: ['countryCode', 'country', 'iso_code', 'isoCode'],
    is_active: ['isActive', 'active'],
    latitude: ['lat'],
    longitude: ['lng', 'lon', 'long'],
    timezone: ['time_zone', 'timeZone', 'tz'],
  };

  for (const alias of aliases[key] ?? []) {
    if (alias in record && record[alias] != null && record[alias] !== '') return record[alias];
  }

  return record[key];
}

function canonicalizePlaceFields(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...record };

  // Copy common camelCase keys onto snake_case so list/detail/form keys match config.
  for (const [key, value] of Object.entries(record)) {
    const snake = snakeFromCamel(key);
    if (snake !== key && !(snake in out && out[snake] != null && out[snake] !== '')) {
      out[snake] = value;
    }
  }

  const hasIataHint =
    typeof out.iata_code === 'string' ||
    typeof out.iataCode === 'string' ||
    typeof out.icao_code === 'string' ||
    typeof out.icaoCode === 'string';

  const unLocode = pickScalar(
    out.un_locode,
    out.unLocode,
    out.locode,
    out.port_code,
    out.portCode,
    // World sea-port seed often exposes UNLOCODE as `code`.
    hasIataHint ? undefined : out.code,
  );
  if (unLocode != null) out.un_locode = String(unLocode).toUpperCase();

  const iata = pickScalar(out.iata_code, out.iataCode, out.iata, out.airport_code, out.airportCode);
  if (iata != null) out.iata_code = String(iata).toUpperCase();
  // Airport world seed may only send `code` as IATA.
  if (!out.iata_code && typeof out.code === 'string' && /^[A-Za-z0-9]{3}$/.test(out.code.trim())) {
    out.iata_code = out.code.trim().toUpperCase();
  }

  const icao = pickScalar(out.icao_code, out.icaoCode, out.icao);
  if (icao != null) out.icao_code = String(icao).toUpperCase();

  const name = pickScalar(out.name, out.port_name, out.portName, out.airport_name, out.airportName);
  if (name != null) out.name = String(name);

  const city = pickScalar(out.city, out.city_name, out.cityName);
  if (city != null) out.city = String(city);

  const country = pickScalar(
    out.country_code,
    out.countryCode,
    out.country,
    out.iso_code,
    out.isoCode,
  );
  if (country != null) out.country_code = String(country).toUpperCase().slice(0, 2);

  const mode = pickScalar(out.mode, out.transport_mode, out.transportMode);
  if (mode != null) out.mode = String(mode).toUpperCase();

  const lat = pickScalar(out.latitude, out.lat);
  if (typeof lat === 'number') out.latitude = lat;
  else if (typeof lat === 'string' && lat.trim() && Number.isFinite(Number(lat))) {
    out.latitude = Number(lat);
  }

  const lng = pickScalar(out.longitude, out.lng, out.lon, out.long);
  if (typeof lng === 'number') out.longitude = lng;
  else if (typeof lng === 'string' && lng.trim() && Number.isFinite(Number(lng))) {
    out.longitude = Number(lng);
  }

  const tz = pickScalar(out.timezone, out.time_zone, out.timeZone, out.tz);
  if (tz != null) out.timezone = String(tz);

  return out;
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

  const canonical = canonicalizePlaceFields(record);

  return {
    ...canonical,
    id,
    ...(iso ? { iso_code: iso } : {}),
    is_active: coerceIsActive(canonical, deletedAt),
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

function nestedRelationName(record: MasterRecord, key: string): string | undefined {
  // department_id → department / department_name / nested { name }
  if (!key.endsWith('_id') && !key.endsWith('Id')) return undefined;
  const base = key.replace(/_id$/i, '').replace(/Id$/, '');
  const camelBase = base.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const nameDirect = pickScalar(
    record[`${base}_name`],
    record[`${camelBase}Name`],
    record[`${base}Name`],
  );
  if (typeof nameDirect === 'string' && nameDirect.trim()) return nameDirect.trim();

  const nested = asRecord(record[base]) ?? asRecord(record[camelBase]);
  if (!nested) return undefined;
  const nestedName = pickScalar(
    nested.name,
    nested.label,
    nested.code,
    nested.display_name,
    nested.displayName,
  );
  return typeof nestedName === 'string' && nestedName.trim() ? nestedName.trim() : undefined;
}

/** Display string for a cell / title. Prefer relation names over raw UUIDs. */
export function masterDisplayValue(record: MasterRecord, key: string): string {
  const related = nestedRelationName(record, key);
  if (related) return related;

  const value = pickMasterField(record, key);
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '—';
    // UUID without a resolved name — hide raw id in UI (list/detail).
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        trimmed,
      )
    ) {
      return '—';
    }
    return trimmed;
  }
  if (Array.isArray(value)) return value.map(String).join(', ') || '—';
  const nested = asRecord(value);
  if (nested) {
    const name = pickScalar(nested.name, nested.label, nested.code);
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return String(value);
}
