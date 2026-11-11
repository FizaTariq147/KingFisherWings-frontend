import { JOB_ORG_TYPES } from './orgTypes';
import { normalizeOrganizationRows, orgPartyLabel } from './orgDisplay';

export type OrgTypeOption = {
  code: string;
  label: string;
  /** True when the code came from a backend catalog / linked row (not only the local fallback). */
  fromBackend?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeCode(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

/** Display label — CLIENT and CUSTOMER stay distinct parties. */
export function orgTypeLabel(code: string): string {
  const c = normalizeCode(code);
  const known: Record<string, string> = {
    CLIENT: 'Client',
    CUSTOMER: 'Customer',
    SHIPPER: 'Shipper',
    CONSIGNEE: 'Consignee',
    NOTIFY: 'Notify',
    BILLING_PARTY: 'Billing party',
    AGENT: 'Agent',
    OVERSEAS_AGENT: 'Overseas agent',
    VENDOR: 'Vendor',
  };
  return known[c] ?? c.replaceAll('_', ' ');
}

function pushCode(
  map: Map<string, OrgTypeOption>,
  rawCode: unknown,
  rawLabel?: unknown,
  fromBackend = false,
) {
  const code = normalizeCode(rawCode);
  if (!code) return;
  // Never collapse CUSTOMER into CLIENT (or the reverse).
  const existing = map.get(code);
  const label =
    (typeof rawLabel === 'string' && rawLabel.trim()
      ? rawLabel.trim()
      : orgTypeLabel(code)) || code;
  if (!existing) {
    map.set(code, { code, label, fromBackend });
    return;
  }
  map.set(code, {
    code,
    label: existing.label || label,
    fromBackend: existing.fromBackend || fromBackend,
  });
}

/** Pull org-type catalog arrays from an organizations / detail payload. */
export function extractOrgTypeCatalog(raw: unknown): OrgTypeOption[] {
  const map = new Map<string, OrgTypeOption>();
  const visit = (node: unknown, depth = 0) => {
    if (depth > 4 || node == null) return;
    if (Array.isArray(node)) {
      for (const entry of node) {
        if (typeof entry === 'string' || typeof entry === 'number') {
          pushCode(map, entry, undefined, true);
          continue;
        }
        const rec = asRecord(entry);
        if (!rec) continue;
        const code =
          rec.code ??
          rec.org_type ??
          rec.orgType ??
          rec.value ??
          rec.key ??
          rec.type ??
          rec.name;
        const label = rec.label ?? rec.title ?? rec.display_name ?? rec.displayName;
        if (code != null) pushCode(map, code, label, true);
      }
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    for (const key of [
      'org_types',
      'orgTypes',
      'available_org_types',
      'availableOrgTypes',
      'organization_types',
      'organizationTypes',
      'organisation_types',
      'organisationTypes',
      'allowed_org_types',
      'allowedOrgTypes',
      'org_type_options',
      'orgTypeOptions',
    ]) {
      if (rec[key] != null) visit(rec[key], depth + 1);
    }
    // Nested under data / meta.
    if (rec.data != null) visit(rec.data, depth + 1);
    if (rec.meta != null) visit(rec.meta, depth + 1);
  };
  visit(raw);
  return [...map.values()];
}

/**
 * Org type dropdown options for job/shipment Party tab.
 * Prefer backend catalog when present; always keep CLIENT ≠ CUSTOMER.
 * Local JOB_ORG_TYPES is fallback only when the API sends no catalog.
 */
export function resolveOrgTypeOptions(
  ...sources: unknown[]
): OrgTypeOption[] {
  const map = new Map<string, OrgTypeOption>();

  for (const source of sources) {
    for (const opt of extractOrgTypeCatalog(source)) {
      pushCode(map, opt.code, opt.label, true);
    }
    // Types already linked on the job/shipment.
    for (const row of normalizeOrganizationRows(source)) {
      const info = orgPartyLabel(row);
      if (info.orgType && info.orgType !== '—') {
        pushCode(map, info.orgType, orgTypeLabel(info.orgType), true);
      }
    }
  }

  const fromBackend = [...map.values()].some((o) => o.fromBackend);
  if (!fromBackend) {
    for (const code of JOB_ORG_TYPES) {
      pushCode(map, code, orgTypeLabel(code), false);
    }
    // Support Deal Customer as its own org role when BE starts sending/accepting it.
    pushCode(map, 'CUSTOMER', orgTypeLabel('CUSTOMER'), false);
  }

  const preferred = [
    'CLIENT',
    'CUSTOMER',
    'SHIPPER',
    'CONSIGNEE',
    'NOTIFY',
    'BILLING_PARTY',
    'AGENT',
    'OVERSEAS_AGENT',
    'VENDOR',
  ];
  const ordered: OrgTypeOption[] = [];
  for (const code of preferred) {
    const opt = map.get(code);
    if (opt) {
      ordered.push(opt);
      map.delete(code);
    }
  }
  for (const opt of [...map.values()].sort((a, b) => a.code.localeCompare(b.code))) {
    ordered.push(opt);
  }
  return ordered;
}
