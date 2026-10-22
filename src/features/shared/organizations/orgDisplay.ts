import { isUuid } from '@/lib/isUuid';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

/** Optional API `display_fields` — hide raw UUIDs in UI labels. */
export function orgDisplayFields(row: Record<string, unknown>): Record<string, unknown> {
  const nested = asRecord(row.display_fields) ?? asRecord(row.displayFields);
  return nested ?? {};
}

export function orgPartyLabel(row: Record<string, unknown>): {
  orgType: string;
  name: string;
  code: string;
  partyType: string;
  address: string;
  partyId: string;
  /** Human label — never a bare UUID. */
  primary: string;
  secondary?: string;
} {
  const display = orgDisplayFields(row);
  const orgType = pickStr(row.org_type, row.type, row.role, display.org_type) || '—';
  const name = pickStr(
    display.party_name,
    display.name,
    row.party_name,
    row.name,
    row.display_name,
    row.displayName,
  );
  const code = pickStr(display.party_code, display.code, row.party_code, row.partyCode, row.code);
  const partyType = pickStr(
    display.party_type,
    display.partyType,
    row.party_type,
    row.partyType,
  );
  const address = pickStr(
    display.address_snippet,
    display.addressSnippet,
    display.address,
    row.address_snippet,
    row.addressSnippet,
    row.address_line1,
    row.address,
  );
  const partyId = pickStr(row.party_id, row.partyId, row.id);
  const safeName = name && !isUuid(name) ? name : '';
  const safeCode = code && !isUuid(code) ? code : '';
  const primary =
    safeName ||
    (safeCode ? safeCode : '') ||
    (partyType && !isUuid(partyType) ? partyType.replaceAll('_', ' ') : '') ||
    '—';
  const bits = [
    safeCode && safeName ? safeCode : '',
    partyType && !isUuid(partyType) ? partyType.replaceAll('_', ' ') : '',
    address,
  ].filter(Boolean);
  return {
    orgType,
    name: safeName,
    code: safeCode,
    partyType,
    address,
    partyId,
    primary,
    secondary: bits.length ? bits.join(' · ') : undefined,
  };
}
