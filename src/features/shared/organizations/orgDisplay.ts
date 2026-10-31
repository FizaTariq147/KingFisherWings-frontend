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

/**
 * Normalize organizations list payloads from jobs/shipments APIs into row objects.
 * Supports arrays, `{ items|organizations|… }`, and org-type maps (`{ CLIENT: {…} }`).
 */
export function normalizeOrganizationRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];

  for (const key of ['items', 'organizations', 'data', 'results', 'parties', 'orgs']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }

  const nestedData = asRecord(rec.data);
  if (nestedData) {
    for (const key of ['items', 'organizations', 'results', 'parties']) {
      if (Array.isArray(nestedData[key])) {
        return (nestedData[key] as unknown[])
          .map(asRecord)
          .filter((r): r is Record<string, unknown> => Boolean(r));
      }
    }
  }

  // Map keyed by org type: { CLIENT: { party_name / party: {…} }, SHIPPER: … }
  const skip = new Set([
    'meta',
    'pagination',
    'links',
    'success',
    'message',
    'status',
    'path_hints',
    'pathHints',
    'ops_continuum',
    'opsContinuum',
  ]);
  const mapRows: Record<string, unknown>[] = [];
  for (const [key, val] of Object.entries(rec)) {
    if (skip.has(key) || key.startsWith('_')) continue;
    if (val == null) continue;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      continue;
    }
    const nested = asRecord(val);
    if (!nested) continue;
    const looksLikeOrg =
      nested.org_type != null ||
      nested.orgType != null ||
      nested.party_id != null ||
      nested.partyId != null ||
      nested.party_name != null ||
      nested.partyName != null ||
      nested.name != null ||
      nested.code != null ||
      asRecord(nested.party) != null ||
      asRecord(nested.organization) != null ||
      asRecord(nested.snapshot) != null ||
      asRecord(nested.party_snapshot) != null ||
      asRecord(nested.display_fields) != null;
    if (!looksLikeOrg) continue;
    mapRows.push({
      org_type: pickStr(nested.org_type, nested.orgType, nested.type, nested.role) || key,
      ...nested,
    });
  }
  return mapRows;
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
  const party =
    asRecord(row.party) ??
    asRecord(row.organization) ??
    asRecord(row.org) ??
    asRecord(row.snapshot) ??
    asRecord(row.party_snapshot) ??
    asRecord(row.partySnapshot) ??
    asRecord(display.party) ??
    {};
  const orgType =
    pickStr(
      row.org_type,
      row.orgType,
      row.type,
      row.role,
      row.party_role,
      row.partyRole,
      display.org_type,
      display.orgType,
    ) || '—';
  const name = pickStr(
    display.party_name,
    display.name,
    display.display_name,
    row.party_name,
    row.partyName,
    row.name,
    row.display_name,
    row.displayName,
    row.legal_name,
    row.legalName,
    row.short_name,
    row.shortName,
    row.company_name,
    row.companyName,
    party.party_name,
    party.partyName,
    party.name,
    party.display_name,
    party.displayName,
    party.legal_name,
    party.legalName,
    party.short_name,
    party.shortName,
    party.company_name,
    party.companyName,
  );
  const code = pickStr(
    display.party_code,
    display.code,
    row.party_code,
    row.partyCode,
    row.code,
    party.party_code,
    party.partyCode,
    party.code,
  );
  const partyType = pickStr(
    display.party_type,
    display.partyType,
    row.party_type,
    row.partyType,
    party.party_type,
    party.partyType,
    party.type,
  );
  const address = pickStr(
    display.address_snippet,
    display.addressSnippet,
    display.address,
    row.address_snippet,
    row.addressSnippet,
    row.address_line1,
    row.addressLine1,
    row.address,
    party.address_snippet,
    party.address_line1,
    party.address,
  );
  const partyId = pickStr(
    row.party_id,
    row.partyId,
    party.id,
    party.party_id,
    row.id,
  );
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
