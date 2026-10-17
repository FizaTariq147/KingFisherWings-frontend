import {
  PARTY_TYPES,
  PARTY_TYPE_LABELS,
  type PartyType,
} from '../constants/party.constants';

/**
 * Merge API GET /parties/types with local catalog. Always keeps VENDOR.
 * Unknown codes are still shown (label = prettified code).
 */
export function resolvePartyTypeOptions(apiTypes?: string[] | null): Array<{
  code: PartyType | string;
  label: string;
}> {
  const codes = new Set<string>();
  for (const t of apiTypes ?? []) {
    const code = String(t ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    if (code) codes.add(code);
  }
  for (const t of PARTY_TYPES) codes.add(t);
  codes.add('VENDOR');

  const preferred = PARTY_TYPES.filter((t) => codes.has(t));
  const extras = [...codes].filter(
    (c) => !(PARTY_TYPES as readonly string[]).includes(c),
  );
  const ordered = [...preferred, ...extras.sort()];

  return ordered.map((code) => ({
    code,
    label:
      (PARTY_TYPE_LABELS as Record<string, string>)[code] ??
      code.replaceAll('_', ' '),
  }));
}
