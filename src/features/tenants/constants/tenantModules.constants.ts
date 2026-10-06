/**
 * Catalog for PATCH /tenants/:id/features `enabled_modules`.
 * Keys must match backend validation exactly.
 */
export const TENANT_ENABLED_MODULE_OPTIONS = [
  { key: 'operations', label: 'Operations' },
  { key: 'sales', label: 'Sales' },
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
