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
 * Build party-type select options from GET /parties/types.
 * When the API returns types, use those present/active codes only (plus VENDOR).
 * Do not also append the full local PARTY_TYPES catalog on top of the API list.
 * Local PARTY_TYPES is fallback only when the API list is empty.
 */
export function resolvePartyTypeOptions(
  apiTypes?: Array<string | PartyTypeCatalogItem> | null,
): PartyTypeOption[] {
  const labelByCode = new Map<string, string>();
  const metaByCode = new Map<string, Pick<PartyTypeOption, 'id' | 'is_system' | 'is_active'>>();
  const codes = new Set<string>();
  let apiProvided = false;

  for (const entry of apiTypes ?? []) {
    if (typeof entry === 'string') {
      const code = normalizeCode(entry);
      if (!code) continue;
      apiProvided = true;
      codes.add(code);
      continue;
    }
    if (!isCatalogItem(entry)) continue;
    const code = normalizeCode(entry.code);
    if (!code) continue;
    // Skip soft-deactivated catalog rows when API sends the flag.
    if (entry.is_active === false) continue;
    apiProvided = true;
    codes.add(code);
    if (entry.label?.trim()) labelByCode.set(code, entry.label.trim());
    metaByCode.set(code, {
      id: entry.id,
      is_system: entry.is_system,
      is_active: entry.is_active,
    });
  }

  if (!apiProvided) {
    for (const t of PARTY_TYPES) codes.add(t);
  }
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
