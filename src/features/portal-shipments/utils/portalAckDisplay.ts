import { isUuid } from '@/lib/isUuid';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function tryParseJson(value: string): unknown | null {
  const t = value.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}

function humanLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Non-UUID display string from a nested entity / catalog row. */
export function entityDisplayName(value: unknown): string {
  const row = asRecord(value);
  if (!row) {
    if (typeof value === 'string') {
      const t = value.trim();
      if (!t || isUuid(t)) return '';
      return t;
    }
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return '';
  }
  for (const key of [
    'name',
    'label',
    'display_name',
    'displayName',
    'full_name',
    'fullName',
    'title',
    'code',
    'type',
    'org_type',
    'party_type',
    'description',
    'value',
  ]) {
    const v = row[key];
    if (typeof v === 'string' && v.trim() && !isUuid(v.trim())) return v.trim();
  }
  for (const [key, v] of Object.entries(row)) {
    const lower = key.toLowerCase();
    if (lower === 'id' || lower.endsWith('_id') || lower.endsWith('_uuid')) continue;
    if (typeof v === 'string' && v.trim() && !isUuid(v.trim())) return v.trim();
  }
  return '';
}

function siblingName(key: string, data: Record<string, unknown>): string {
  const base = key.replace(/(_id|_uuid)$/i, '');
  for (const suffix of ['_name', '_label', 'Name', 'Label']) {
    const v = data[`${base}${suffix}`] ?? data[`${base}_${suffix.replace(/^_/, '')}`];
    if (typeof v === 'string' && v.trim() && !isUuid(v.trim())) return v.trim();
  }
  const nested = entityDisplayName(data[base]);
  if (nested) return nested;
  return '';
}

export type PortalAckListRow = { label: string; value: string };

/**
 * Flatten acknowledgement / template payloads into label/value rows for the customer portal.
 * Never surfaces bare UUIDs — prefers sibling *_name / nested name fields from the API.
 */
export function portalAckToListRows(data: unknown, depth = 0): PortalAckListRow[] {
  if (data == null || depth > 6) return [];

  if (typeof data === 'string') {
    const parsed = tryParseJson(data);
    if (parsed != null) return portalAckToListRows(parsed, depth + 1);
    const t = data.trim();
    if (!t || isUuid(t)) return [];
    return [{ label: 'Value', value: t }];
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return [{ label: 'Value', value: entityDisplayName(data) || String(data) }];
  }

  if (Array.isArray(data)) {
    if (!data.length) return [];
    const rows: PortalAckListRow[] = [];
    data.forEach((item, index) => {
      const name = entityDisplayName(item);
      if (name) {
        rows.push({ label: `Item ${index + 1}`, value: name });
        return;
      }
      const nested = portalAckToListRows(item, depth + 1);
      if (nested.length === 1) {
        rows.push({ label: `Item ${index + 1}`, value: nested[0]!.value });
      } else {
        for (const row of nested) {
          rows.push({
            label: nested.length > 1 ? `Item ${index + 1} · ${row.label}` : row.label,
            value: row.value,
          });
        }
      }
    });
    return rows;
  }

  const rec = asRecord(data);
  if (!rec) return [];

  const skip = new Set([
    'id',
    'raw',
    'tenant_id',
    'tenantId',
    'company_id',
    'companyId',
    '__typename',
  ]);
  const seen = new Set<string>();
  const rows: PortalAckListRow[] = [];

  for (const [key, value] of Object.entries(rec)) {
    if (skip.has(key) || seen.has(key)) continue;
    const lower = key.toLowerCase();

    if (lower.endsWith('_id') || lower.endsWith('_uuid')) {
      const named = siblingName(key, rec);
      if (named) {
        const base = key.replace(/(_id|_uuid)$/i, '');
        seen.add(`${base}_name`);
        seen.add(`${base}_label`);
        seen.add(`${base}_code`);
        rows.push({ label: humanLabel(base), value: named });
      }
      continue;
    }

    if (typeof value === 'string') {
      const parsed = tryParseJson(value);
      if (parsed != null) {
        const nested = portalAckToListRows(parsed, depth + 1);
        for (const row of nested) {
          rows.push({
            label: nested.length > 1 ? `${humanLabel(key)} · ${row.label}` : humanLabel(key),
            value: row.value,
          });
        }
        continue;
      }
      if (isUuid(value.trim())) continue;
      if (lower.endsWith('_name') || lower.endsWith('_label') || lower.endsWith('_code')) {
        const base = key.replace(/(_name|_label|_code)$/i, '');
        if (rec[`${base}_id`] != null || rec[`${base}_uuid`] != null) continue;
      }
      if (!value.trim()) continue;
      rows.push({ label: humanLabel(key), value: value.trim() });
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      rows.push({ label: humanLabel(key), value: entityDisplayName(value) || String(value) });
      continue;
    }

    if (Array.isArray(value)) {
      if (!value.length) continue;
      const nested = portalAckToListRows(value, depth + 1);
      if (nested.length === 1) {
        rows.push({ label: humanLabel(key), value: nested[0]!.value });
      } else {
        for (const row of nested) {
          rows.push({
            label: `${humanLabel(key)} · ${row.label}`,
            value: row.value,
          });
        }
      }
      continue;
    }

    if (value != null && typeof value === 'object') {
      const named = entityDisplayName(value);
      if (named) {
        rows.push({ label: humanLabel(key), value: named });
        continue;
      }
      const nested = portalAckToListRows(value, depth + 1);
      for (const row of nested) {
        rows.push({
          label: nested.length > 1 ? `${humanLabel(key)} · ${row.label}` : humanLabel(key),
          value: row.value,
        });
      }
    }
  }

  return rows;
}
