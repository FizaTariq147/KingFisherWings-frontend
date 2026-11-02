import { tenantModuleKeyMatchers } from '../constants/tenantModules.constants';

/**
 * Tenant `enabled_modules` allow-list semantics (matches Super Admin Features + /auth/me).
 * - undefined / null → unrestricted (all modules on)
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

export function pickEnabledModulesFromRecord(
  raw: Record<string, unknown>,
): string[] | undefined {
  const tenant = asRecord(raw.tenant);
  const features = asRecord(raw.features) || asRecord(tenant?.features);
  const value =
    raw.enabled_modules ??
    raw.enabledModules ??
    tenant?.enabled_modules ??
    tenant?.enabledModules ??
    features?.enabled_modules ??
    features?.enabledModules;

  if (!Array.isArray(value)) return undefined;
  const modules = value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const row = item as Record<string, unknown>;
        for (const key of ['key', 'module', 'code', 'name', 'slug']) {
          if (typeof row[key] === 'string' && row[key].trim()) return String(row[key]).trim();
        }
      }
      return '';
    })
    .filter(Boolean);
  return modules.length ? modules : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
