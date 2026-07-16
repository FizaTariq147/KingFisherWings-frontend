const CREATE_ALLOWED = new Set([
  'name',
  'report_type',
  'description',
  'filters',
  'company_id',
  'is_shared',
]);

function cleanScalar(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t || undefined;
  }
  if (typeof value === 'boolean') return value;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  return value;
}

function pickAllowed<T extends Record<string, unknown>>(
  dto: T,
  allowed: Set<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!allowed.has(key)) continue;
    const cleaned = cleanScalar(value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  return out;
}

export function prepareCreateSavedReportPayload<T extends Record<string, unknown>>(dto: T): T {
  const out = pickAllowed(dto, CREATE_ALLOWED);
  if (!out.name) throw new Error('Name is required.');
  if (!out.report_type) throw new Error('Report type is required.');
  return out as T;
}

export function prepareUpdateSavedReportPayload<T extends Record<string, unknown>>(dto: T): T {
  return pickAllowed(dto, CREATE_ALLOWED) as T;
}
