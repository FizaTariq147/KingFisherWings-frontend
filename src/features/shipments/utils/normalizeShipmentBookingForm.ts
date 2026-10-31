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

/**
 * Compact PUT body for /shipments/:id/booking-form.
 * Omits empty custom_fields[] and nullish values — empty arrays / nulls have caused
 * Nest 500s on some booking-form handlers.
 */
export function compactShipmentBookingFormPutBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === 'custom_fields') continue;
    if (value == null || value === '') continue;
    if (typeof value === 'string' && isUuid(value.trim())) continue;
    out[key] = value;
  }

  const rawCustom = body.custom_fields;
  if (Array.isArray(rawCustom) && rawCustom.length) {
    const rows: Record<string, unknown>[] = [];
    for (const item of rawCustom) {
      const row = asRecord(item);
      if (!row) continue;
      const key = String(row.key ?? '').trim();
      const label = String(row.label ?? '').trim();
      if (!key || !label) continue;
      const next: Record<string, unknown> = {
        key,
        label,
        type: String(row.type ?? 'text'),
      };
      if (row.value !== undefined && row.value !== null && row.value !== '') {
        next.value = row.value;
      }
      rows.push(next);
    }
    if (rows.length) out.custom_fields = rows;
  }

  // Draft save flag used by mode booking forms; harmless if DTO ignores it.
  if (out.mark_complete == null) out.mark_complete = false;

  return out;
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
