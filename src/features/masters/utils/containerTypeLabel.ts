import { isUuid } from '@/lib/isUuid';
import type { MasterRecord } from '../types/master.types';

type NamedRecord = {
  id?: unknown;
  name?: unknown;
  label?: unknown;
  code?: unknown;
  size?: unknown;
  [key: string]: unknown;
};

/**
 * Human label for a container type master row.
 * Prefer name — never show UUID; code only if name is missing (backend gap).
 */
export function containerTypeDisplayName(record?: NamedRecord | null): string {
  if (!record) return '';
  const name = String(record.name ?? record.label ?? '').trim();
  if (name && !isUuid(name)) return name;
  const code = String(record.code ?? record.size ?? '').trim();
  if (code && !isUuid(code)) return code;
  return '';
}

/** Select options: value = master UUID, label = name from master. */
export function containerTypeSelectOptions(
  records: MasterRecord[] | NamedRecord[],
): Array<{ value: string; label: string }> {
  const out: Array<{ value: string; label: string }> = [];
  for (const row of records) {
    const id = String(row.id ?? '').trim();
    if (!isUuid(id)) continue;
    const label = containerTypeDisplayName(row);
    // Skip unlabeled rows rather than showing UUID (backend should send name).
    if (!label) continue;
    out.push({ value: id, label });
  }
  return out;
}

/** Resolve a stored container_type_id to a display name via master list. */
export function resolveContainerTypeName(
  id: string | undefined | null,
  records: MasterRecord[] | NamedRecord[],
  knownName?: string | null,
): string {
  const known = String(knownName ?? '').trim();
  if (known && !isUuid(known)) return known;
  const key = String(id ?? '').trim();
  if (!key) return '—';
  const match = records.find((r) => String(r.id ?? '').trim() === key);
  const label = containerTypeDisplayName(match);
  if (label) return label;
  // Never surface raw UUID when master name is missing.
  if (isUuid(key)) return '—';
  return key;
}

/** Party / consignee label: name only (no code, no UUID). */
export function partyNameOnly(party?: {
  name?: string | null;
  short_name?: string | null;
  code?: string | null;
  id?: string | null;
} | null): string {
  if (!party) return '';
  const name = String(party.name ?? party.short_name ?? '').trim();
  if (name && !isUuid(name)) return name;
  return '';
}
