const ALLOWED = new Set([
  'from_zip',
  'from_city',
  'to_zip',
  'to_city',
  'distance',
  'unit',
  'is_active',
]);

export function prepareZipDistancePayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOWED.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;
    if (typeof value === 'string') {
      out[key] = value.trim();
      continue;
    }
    out[key] = value;
  }
  return out as T;
}
