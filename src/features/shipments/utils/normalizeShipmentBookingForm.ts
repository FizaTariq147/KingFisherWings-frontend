import { isUuid } from '@/lib/isUuid';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/**
 * Flatten GET/PUT /shipments/:id/booking-form envelopes into a single form record.
 * Prefers nested booking_form / form / fields when present; copies camelCase → snake_case.
 */
export function normalizeShipmentBookingForm(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw) ?? {};
  const nested =
    asRecord(root.booking_form) ??
    asRecord(root.bookingForm) ??
    asRecord(root.form) ??
    asRecord(root.fields) ??
    asRecord(root.content) ??
    asRecord(root.payload) ??
    asRecord(root.data);

  const merged: Record<string, unknown> = { ...root };
  if (nested) {
    for (const [k, v] of Object.entries(nested)) {
      if (merged[k] == null || merged[k] === '') merged[k] = v;
    }
  }

  // Promote camelCase aliases to snake_case so EDITABLE_KEYS hydrate.
  for (const [k, v] of Object.entries({ ...merged })) {
    if (!/[A-Z]/.test(k)) continue;
    const snake = camelToSnake(k);
    if (snake !== k && (merged[snake] == null || merged[snake] === '')) {
      merged[snake] = v;
    }
  }

  const custom =
    merged.custom_fields ??
    merged.customFields ??
    nested?.custom_fields ??
    nested?.customFields;
  if (custom != null) merged.custom_fields = custom;

  return merged;
}

/** Read a booking-form scalar for an editable snake_case key (also tries camelCase). */
export function pickBookingFormScalar(
  data: Record<string, unknown>,
  snakeKey: string,
): string {
  const camel = snakeKey.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const raw = data[snakeKey] ?? data[camel];
  if (raw == null || typeof raw === 'object') return '';
  const s = String(raw).trim();
  if (!s || isUuid(s)) return '';
  return s;
}

/** Merge saved PUT body into existing cache so the UI keeps values if GET is sparse. */
export function mergeBookingFormCache(
  previous: Record<string, unknown> | undefined,
  savedBody: Record<string, unknown>,
  response: Record<string, unknown>,
): Record<string, unknown> {
  const normalizedResponse = normalizeShipmentBookingForm(response);
  const base = { ...(previous ?? {}) };
  for (const [k, v] of Object.entries(savedBody)) {
    if (v == null || v === '') continue;
    base[k] = v;
  }
  for (const [k, v] of Object.entries(normalizedResponse)) {
    if (v == null || v === '') continue;
    if (typeof v === 'string' && isUuid(v)) continue;
    base[k] = v;
  }
  if (savedBody.custom_fields != null) {
    base.custom_fields = savedBody.custom_fields;
  }
  if (normalizedResponse.custom_fields != null) {
    base.custom_fields = normalizedResponse.custom_fields;
  }
  return normalizeShipmentBookingForm(base);
}
