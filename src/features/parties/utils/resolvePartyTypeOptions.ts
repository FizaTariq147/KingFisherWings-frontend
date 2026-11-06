import {
  PARTY_TYPES,
  PARTY_TYPE_LABELS,
  type PartyType,
} from '../constants/party.constants';
import type { PartyTypeCatalogItem } from '../types/party.types';

export type PartyTypeOption = {
  code: PartyType | string;
  label: string;
  id?: string;
  is_system?: boolean;
  is_active?: boolean;
};

function normalizeCode(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function isCatalogItem(value: unknown): value is PartyTypeCatalogItem {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && 'code' in value);
}

/**
 * Merge API GET /parties/types with local catalog. Always keeps VENDOR.
 * Prefer API catalog labels when available; unknown codes are still shown.
 */
export function resolvePartyTypeOptions(
  apiTypes?: Array<string | PartyTypeCatalogItem> | null,
): PartyTypeOption[] {
  const labelByCode = new Map<string, string>();
  const metaByCode = new Map<string, Pick<PartyTypeOption, 'id' | 'is_system' | 'is_active'>>();
  const codes = new Set<string>();

  for (const entry of apiTypes ?? []) {
    if (typeof entry === 'string') {
      const code = normalizeCode(entry);
      if (!code) continue;
      codes.add(code);
      continue;
    }
    if (!isCatalogItem(entry)) continue;
    const code = normalizeCode(entry.code);
    if (!code) continue;
    codes.add(code);
    if (entry.label?.trim()) labelByCode.set(code, entry.label.trim());
    metaByCode.set(code, {
      id: entry.id,
      is_system: entry.is_system,
      is_active: entry.is_active,
    });
  }

  for (const t of PARTY_TYPES) codes.add(t);
  codes.add('VENDOR');

  const preferred = PARTY_TYPES.filter((t) => codes.has(t));
  const extras = [...codes].filter(
    (c) => !(PARTY_TYPES as readonly string[]).includes(c),
  );
  const ordered = [...preferred, ...extras.sort()];

  return ordered.map((code) => {
    const meta = metaByCode.get(code);
    return {
      code,
      label:
        labelByCode.get(code) ??
        (PARTY_TYPE_LABELS as Record<string, string>)[code] ??
        code.replaceAll('_', ' '),
      id: meta?.id,
      is_system: meta?.is_system,
      is_active: meta?.is_active,
    };
  });
}
