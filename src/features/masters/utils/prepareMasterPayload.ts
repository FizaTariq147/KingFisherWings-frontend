/** Strip empties and coerce API shapes before POST/PATCH. */
export function prepareMasterPayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;

    // Swagger: applicable_modes is string[] (ShipmentMode)
    if (key === 'applicable_modes') {
      const modes = toStringArray(value).map((m) => m.toUpperCase());
      if (modes.length === 0) continue;
      out[key] = modes;
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      out[key] = value;
      continue;
    }

    if (typeof value === 'string' && value.trim() === '') continue;

    if (typeof value === 'string') {
      const trimmed = value.trim();

      // Nest @IsOptional()+@IsUUID() rejects "" and non-UUIDs with "uuid is expected"
      if (key === 'customer_id' || key.endsWith('_id')) {
        if (!UUID_RE.test(trimmed)) continue;
        out[key] = trimmed;
        continue;
      }

      // ISO 3166-1 alpha-2 (CreateHolidayDto, CreatePortDto, …)
      if (key === 'country_code' || key === 'flag_country') {
        out[key] = trimmed.toUpperCase();
        continue;
      }

      // Keep HTML date inputs as YYYY-MM-DD (Swagger holiday example)
      if (
        (key === 'date' ||
          key === 'rate_date' ||
          key === 'valid_from' ||
          key === 'valid_to' ||
          key === 'effective_from' ||
          key === 'effective_to') &&
        /^\d{4}-\d{2}-\d{2}/.test(trimmed)
      ) {
        out[key] = trimmed.slice(0, 10);
        continue;
      }

      out[key] = trimmed;
      continue;
    }

    out[key] = value;
  }
  return out;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}
