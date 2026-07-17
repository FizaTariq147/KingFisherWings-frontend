import type { LocaleApiResponse, LocaleSettings } from '../types/locale.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const raw = record[key];
    if (raw == null) continue;
    const text = String(raw).trim();
    if (text) return text;
  }
  return null;
}

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'boolean') return raw;
  }
  return false;
}

function pickStringArray(record: Record<string, unknown>, ...keys: string[]): string[] {
  for (const key of keys) {
    const raw = record[key];
    if (!Array.isArray(raw)) continue;
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  return [];
}

function unwrapLocalePayload(raw: unknown): Record<string, unknown> {
  const record = asRecord(raw);
  if (!record) return {};

  const nested = asRecord(record.data) ?? asRecord(record.result) ?? asRecord(record.payload);
  if (nested && ('country_code' in nested || 'countryCode' in nested || 'base_currency' in nested)) {
    return nested;
  }

  return record;
}

export function normalizeLocaleSettings(raw: unknown): LocaleSettings {
  const record = unwrapLocalePayload(raw);

  const countryRaw = pickString(record, 'country_code', 'countryCode');
  const countryCode = countryRaw ? countryRaw.toUpperCase() : null;

  const dialRaw = pickString(record, 'dial_code', 'dialCode');
  const currencyRaw = pickString(record, 'base_currency', 'baseCurrency', 'default_currency', 'defaultCurrency');
  const timezoneRaw = pickString(record, 'timezone', 'default_timezone', 'defaultTimezone');
  const taxIdLabel = pickString(record, 'tax_id_label', 'taxIdLabel');

  return {
    countryCode,
    dialCode: dialRaw,
    baseCurrency: currencyRaw ? currencyRaw.toUpperCase() : null,
    timezone: timezoneRaw,
    timezones: pickStringArray(record, 'timezones'),
    taxIdLabel,
    hasPostalPattern: pickBool(record, 'has_postal_pattern', 'hasPostalPattern'),
    hasTaxPattern: pickBool(record, 'has_tax_pattern', 'hasTaxPattern'),
    countryRequired: pickBool(record, 'country_required', 'countryRequired'),
  };
}

export function isLocaleApiResponse(value: unknown): value is LocaleApiResponse {
  const record = asRecord(value);
  if (!record) return false;
  return 'country_code' in record || 'countryCode' in record || 'base_currency' in record;
}
