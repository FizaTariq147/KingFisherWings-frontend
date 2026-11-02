/**
 * Catalog for PATCH /tenants/:id/features `enabled_modules`.
 * Keys must match backend validation exactly.
 * Valid (live API): operations, sales, parties, vendor, shipments, finance,
 * masters, admin, hr, wms, transport, nvocc, documentation, support, logistics.
 */
export const TENANT_ENABLED_MODULE_OPTIONS = [
  { key: 'operations', label: 'Operations' },
  { key: 'shipments', label: 'Shipments' },
  { key: 'sales', label: 'Sales' },
  { key: 'parties', label: 'Parties' },
  { key: 'vendor', label: 'Vendor Services' },
  { key: 'finance', label: 'Finance' },
  { key: 'masters', label: 'Masters' },
  { key: 'admin', label: 'Admin' },
  { key: 'hr', label: 'HR' },
  { key: 'wms', label: 'Warehouse (WMS)' },
  { key: 'transport', label: 'Transport' },
  { key: 'nvocc', label: 'NVOCC' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'support', label: 'Support' },
  { key: 'logistics', label: 'Logistics' },
] as const;

export type TenantEnabledModuleKey = (typeof TENANT_ENABLED_MODULE_OPTIONS)[number]['key'];

/** Backend-accepted module keys (for validation / messaging). */
export const TENANT_ENABLED_MODULE_KEYS = TENANT_ENABLED_MODULE_OPTIONS.map(
  (m) => m.key,
) as readonly TenantEnabledModuleKey[];

/**
 * Legacy / misspelled FE keys → canonical BE enabled_modules / matrix module keys.
 * e.g. Super Admin previously sent `vendors` which the API rejects.
 */
export const TENANT_MODULE_KEY_ALIASES: Readonly<Record<string, string>> = {
  vendors: 'vendor',
};

/** Normalize a module key to the backend canonical form. */
export function canonicalizeTenantModuleKey(key: string): string {
  const k = key.trim().toLowerCase();
  if (!k) return '';
  return TENANT_MODULE_KEY_ALIASES[k] ?? k;
}

/** Keys that should match when checking enablement / matrix (canonical + aliases). */
export function tenantModuleKeyMatchers(moduleKey: string): string[] {
  const canonical = canonicalizeTenantModuleKey(moduleKey);
  if (!canonical) return [];
  const matchers = new Set<string>([canonical, moduleKey.trim().toLowerCase()]);
  for (const [alias, target] of Object.entries(TENANT_MODULE_KEY_ALIASES)) {
    if (target === canonical) matchers.add(alias);
  }
  return [...matchers];
}
