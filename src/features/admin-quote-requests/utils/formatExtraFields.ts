/** Flatten nested payload into plain label/value rows for staff UI (no JSON dump). */

const SKIP_KEYS = new Set([
  'id',
  'tenant_id',
  'tenantId',
  'raw',
  'raw_json',
  'rawJson',
  'api_key',
  'apiKey',
  'api_key_ciphertext',
  'apiKeyCiphertext',
]);

function humanLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatPrimitive(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

export function flattenExtraFields(
  source: Record<string, unknown> | null | undefined,
  options?: { excludeKeys?: string[]; max?: number },
): Array<{ label: string; value: string }> {
  if (!source) return [];
  const exclude = new Set([...(options?.excludeKeys ?? []), ...SKIP_KEYS]);
  const max = options?.max ?? 40;
  const rows: Array<{ label: string; value: string }> = [];

  const walk = (record: Record<string, unknown>, prefix = '') => {
    for (const [key, value] of Object.entries(record)) {
      if (rows.length >= max) return;
      if (exclude.has(key)) continue;
      const label = prefix ? `${prefix} · ${humanLabel(key)}` : humanLabel(key);
      const primitive = formatPrimitive(value);
      if (primitive != null) {
        rows.push({ label, value: primitive });
        continue;
      }
      if (Array.isArray(value)) {
        if (value.every((item) => formatPrimitive(item) != null)) {
          const joined = value
            .map((item) => formatPrimitive(item))
            .filter(Boolean)
            .join(', ');
          if (joined) rows.push({ label, value: joined });
        } else if (value.length) {
          rows.push({ label, value: `${value.length} item(s)` });
        }
        continue;
      }
      if (value && typeof value === 'object') {
        walk(value as Record<string, unknown>, label);
      }
    }
  };

  walk(source);
  return rows;
}
