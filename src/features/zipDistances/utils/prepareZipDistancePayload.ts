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

  if (!out.from_zip || typeof out.from_zip !== 'string') {
    throw new Error('From ZIP is required.');
  }
  if (!out.to_zip || typeof out.to_zip !== 'string') {
    throw new Error('To ZIP is required.');
  }
  if (typeof out.distance !== 'number' || !(out.distance > 0)) {
    throw new Error('Distance must be greater than zero.');
  }
  if (!out.unit) out.unit = 'KM';

  return out as T;
}
