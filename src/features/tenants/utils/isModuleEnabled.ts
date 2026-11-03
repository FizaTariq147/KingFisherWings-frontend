import { hasMatrixModuleAccess } from '@/features/users/utils/matrixPermissionAccess';
import {
  canonicalizeTenantModuleKey,
  tenantModuleKeyMatchers,
} from '../constants/tenantModules.constants';

/**
 * Tenant `enabled_modules` allow-list semantics (matches Super Admin Features + /auth/me).
 * - undefined / null → unrestricted at this helper (callers may still infer from session grants)
 * - non-empty array → membership required (case-insensitive)
 * - aliases: `vendors` ↔ `vendor`
 */
export function isModuleEnabled(
  enabledModules: readonly string[] | null | undefined,
  moduleKey: string,
): boolean {
  if (enabledModules == null) return true;
  if (enabledModules.length === 0) return true;
  const matchers = new Set(tenantModuleKeyMatchers(moduleKey));
  if (!matchers.size) return true;
  return enabledModules.some((key) => matchers.has(key.trim().toLowerCase()));
}

/**
 * Classic menu_* / bridge keys that prove a Super Admin module is on the login token.
 * Used when /auth/me omits `enabled_modules` so SA-disabled modules (keys stripped from JWT)
 * do not stay visible for Tenant Admin.
 */
const CLASSIC_MENUS_BY_MODULE: Readonly<Record<string, readonly string[]>> = {
  documentation: ['menu_documentation'],
  transport: ['menu_transport', 'transport.view', 'transport.manage', 'transport.read'],
  nvocc: ['menu_nvocc'],
  sales: ['menu_sales', 'menu_quotations'],
  finance: ['menu_finance', 'menu_accounts'],
  operations: [
    'menu_jobs_air_export',
    'menu_jobs_sea_export',
    'menu_jobs_sea_import',
  ],
  shipments: ['menu_shipments'],
  parties: ['menu_customers'],
  vendor: ['menu_vendors'],
  vendors: ['menu_vendors'],
  admin: ['menu_management', 'menu_admin'],
  hr: ['menu_hr'],
  wms: ['menu_warehouse'],
  masters: ['menu_masters'],
  support: ['menu_support'],
  logistics: ['menu_logistics'],
};

/**
 * True when the session permission list shows the module was granted
 * (matrix `{module}_module.*` / `{module}.*` or classic menu bridges).
 */
export function sessionAllowsTenantModule(
  permissions: readonly string[],
  moduleKey: string,
): boolean {
  if (!moduleKey.trim() || permissions.length === 0) return false;
  if (hasMatrixModuleAccess(permissions, moduleKey, 'see')) return true;

  const canonical = canonicalizeTenantModuleKey(moduleKey);
  const menus = new Set<string>([
    ...(CLASSIC_MENUS_BY_MODULE[canonical] ?? []),
    ...(CLASSIC_MENUS_BY_MODULE[moduleKey.trim().toLowerCase()] ?? []),
    `menu_${canonical}`,
  ]);
  const set = new Set(
    permissions.map((p) => (typeof p === 'string' ? p.trim().toLowerCase() : '')).filter(Boolean),
  );
  for (const menu of menus) {
    if (set.has(menu.toLowerCase())) return true;
  }
  return false;
}

function coerceEnabledModulesList(value: unknown): string[] | undefined {
  if (value == null) return undefined;

  if (typeof value === 'string') {
    const parts = value
      .split(/[,|;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return parts.length ? parts : undefined;
  }

  if (!Array.isArray(value)) return undefined;

  const modules = value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const row = item as Record<string, unknown>;
        for (const key of ['key', 'module', 'code', 'name', 'slug']) {
          if (typeof row[key] === 'string' && String(row[key]).trim()) {
            return String(row[key]).trim();
          }
        }
      }
      return '';
    })
    .filter(Boolean);

  return modules.length ? modules : undefined;
}

export function pickEnabledModulesFromRecord(
  raw: Record<string, unknown>,
): string[] | undefined {
  const tenant = asRecord(raw.tenant);
  const organization = asRecord(raw.organization) || asRecord(raw.org);
  const company = asRecord(raw.company);
  const subscription = asRecord(raw.subscription);
  const features =
    asRecord(raw.features) ||
    asRecord(tenant?.features) ||
    asRecord(organization?.features) ||
    asRecord(company?.features);
  const product =
    asRecord(raw.product) ||
    asRecord(tenant?.product) ||
    asRecord(subscription?.product);

  const candidates: unknown[] = [
    raw.enabled_modules,
    raw.enabledModules,
    raw.allowed_modules,
    raw.allowedModules,
    raw.modules_enabled,
    tenant?.enabled_modules,
    tenant?.enabledModules,
    tenant?.allowed_modules,
    organization?.enabled_modules,
    organization?.enabledModules,
    company?.enabled_modules,
    company?.enabledModules,
    subscription?.enabled_modules,
    subscription?.enabledModules,
    features?.enabled_modules,
    features?.enabledModules,
    features?.modules,
    product?.enabled_modules,
    product?.enabledModules,
    raw.tenant_features,
  ];

  for (const candidate of candidates) {
    const modules = coerceEnabledModulesList(candidate);
    if (modules?.length) return modules;
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
