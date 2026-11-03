/**
 * Resolve access from JWT /auth/me permission keys produced by the Users permission matrix
 * and the matrix→classic bridge (e.g. `wms_module.read` + `wms.view`).
 *
 * Backend naming:
 * - submodule `module`  → `{module}_module.{see|read|write}`  e.g. `wms_module.see`
 * - other submodules    → `{module}_{submodule}.{see|read|write}` e.g. `operations_air_export.write`
 * - classic bridge      → `{module}.view` / `{module}.manage` / action packs
 * - route menus         → `menu_jobs_air_export`, `menu_quotations`, …
 *
 * No FE catalog of modules is hardcoded — callers pass the module key from the API tree.
 */

import type { PermissionKey } from '@/types/auth.types';

export type MatrixAccessLevel = 'see' | 'read' | 'write';

const GRANT_FLAGS = new Set(['see', 'read', 'write', 'view', 'manage']);

function levelsAtLeast(level: MatrixAccessLevel): MatrixAccessLevel[] {
  if (level === 'write') return ['write'];
  if (level === 'read') return ['read', 'write'];
  return ['see', 'read', 'write'];
}

function addOpsJobMenus(keys: Set<PermissionKey>, sub: string) {
  if (!sub || sub === 'module') {
    keys.add('menu_jobs_air_export');
    keys.add('menu_jobs_sea_export');
    keys.add('menu_jobs_sea_import');
    keys.add('menu_documentation');
    return;
  }
  // Air export / import share the air jobs route group (no separate menu_jobs_air_import yet).
  if (sub.includes('air')) keys.add('menu_jobs_air_export');
  if (sub.includes('sea_export') || sub.includes('fcl_export') || sub.includes('lcl_export')) {
    keys.add('menu_jobs_sea_export');
  }
  if (sub.includes('sea_import') || sub.includes('fcl_import') || sub.includes('lcl_import')) {
    keys.add('menu_jobs_sea_import');
  }
  // Road / land / courier — do NOT unlock sea or paint every ops department.
  if (sub.includes('road') || sub.includes('land') || sub.includes('courier')) {
    keys.add('menu_jobs_air_export');
  }
  // Customs clearance department — documentation + air route group only.
  if (sub.includes('customs')) {
    keys.add('menu_jobs_air_export');
    keys.add('menu_documentation');
  }
  if (sub.includes('doc')) keys.add('menu_documentation');
}

function flagSatisfies(flag: string, level: MatrixAccessLevel): boolean {
  const accepted = new Set(levelsAtLeast(level));
  if (flag === 'manage') return true;
  if (flag === 'view' && (level === 'see' || level === 'read')) return true;
  if (flag === 'see' || flag === 'read' || flag === 'write') {
    if (accepted.has(flag)) return true;
    if (level === 'see') return true;
    if (level === 'read' && (flag === 'read' || flag === 'write')) return true;
  }
  return false;
}

/**
 * True when JWT/matrix permissions grant a specific submodule
 * (e.g. operations + air_export → `operations_air_export.see`).
 * Module-level `operations_module.*` / `operations.*` still unlocks every submodule.
 */
export function hasMatrixSubmoduleAccess(
  permissions: readonly string[],
  moduleKey: string,
  submodule: string,
  level: MatrixAccessLevel = 'see',
): boolean {
  const mod = moduleKey.trim().toLowerCase();
  const sub = submodule.trim().toLowerCase().replace(/-/g, '_');
  if (!mod || !sub || permissions.length === 0) return false;

  const aliases = new Set<string>([sub]);
  /**
   * Keep Air Export and Air Import independent so the sidebar only shows
   * departments the matrix actually grants (e.g. only those two when both are set).
   * Still accept catalog label variants per side.
   */
  if (sub === 'air_export' || sub === 'airexport' || sub === 'air_export_operations') {
    aliases.add('air_export');
    aliases.add('airexport');
    aliases.add('air_export_operations');
  } else if (sub === 'air_import' || sub === 'airimport' || sub === 'air_import_operations') {
    aliases.add('air_import');
    aliases.add('airimport');
    aliases.add('air_import_operations');
  } else if (sub === 'air' || sub.startsWith('air_')) {
    aliases.add(sub);
  }
  if (sub === 'sea_export' || (sub.startsWith('sea_') && sub.includes('export'))) {
    aliases.add('sea_export');
    aliases.add('sea_fcl_export');
    aliases.add('sea_lcl_export');
  }
  if (sub === 'sea_import' || (sub.startsWith('sea_') && sub.includes('import'))) {
    aliases.add('sea_import');
    aliases.add('sea_fcl_import');
    aliases.add('sea_lcl_import');
  }
  if (sub === 'road_freight') {
    aliases.add('road');
    aliases.add('land');
    aliases.add('courier');
  }
  if (sub === 'customs_clearance') aliases.add('customs');

  const prefixes = new Set<string>([`${mod}_module`, mod]);
  for (const alias of aliases) {
    prefixes.add(`${mod}_${alias}`);
  }

  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    // Normalize hyphens/spaces so `operations_air-export.see` matches `air_export`.
    const key = raw
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_');
    const dot = key.lastIndexOf('.');
    if (dot <= 0) continue;
    const prefix = key.slice(0, dot);
    const flag = key.slice(dot + 1);
    if (!prefixes.has(prefix)) continue;
    if (flagSatisfies(flag, level)) return true;
  }

  return false;
}

/** True when any `operations_*` / `operations.*` matrix grant exists — used for legacy fallbacks. */
export function hasAnyOpsMatrixGrant(permissions: readonly string[]): boolean {
  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = raw.trim().toLowerCase();
    if (key.startsWith('operations_') || key.startsWith('operations.')) return true;
  }
  return false;
}

/**
 * Map matrix / classic JWT permission keys onto sidebar `menu_*` route guards.
 * Needed so Tenant Admin matrix grants open pages even when coarse staff flags
 * (is_operations, …) are off — ProtectedRoute still checks menu_* keys.
 */
export function menuKeysFromMatrixPermissions(
  permissions: readonly string[],
): PermissionKey[] {
  const keys = new Set<PermissionKey>();

  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = raw.trim().toLowerCase();

    if (key.startsWith('menu_')) {
      keys.add(key as PermissionKey);
      continue;
    }

    // Classic / product keys: vendor.users | vendor.permissions | vendor.disputes
    if (
      key === 'vendor.users' ||
      key === 'vendor.permissions' ||
      key === 'vendor.disputes' ||
      key.startsWith('vendor.users') ||
      key.startsWith('vendor.permissions') ||
      key.startsWith('vendor.disputes')
    ) {
      keys.add('menu_vendors');
      continue;
    }

    const dot = key.lastIndexOf('.');
    if (dot <= 0) continue;
    const prefix = key.slice(0, dot);
    const flag = key.slice(dot + 1);
    if (!GRANT_FLAGS.has(flag)) continue;

    if (prefix === 'operations' || prefix === 'operations_module') {
      addOpsJobMenus(keys, 'module');
      continue;
    }
    if (prefix.startsWith('operations_')) {
      addOpsJobMenus(keys, prefix.slice('operations_'.length));
      continue;
    }

    if (prefix === 'nvocc' || prefix === 'nvocc_module' || prefix.startsWith('nvocc_')) {
      keys.add('menu_nvocc');
      continue;
    }
    if (
      prefix === 'quotations' ||
      prefix === 'quotations_module' ||
      prefix.startsWith('quotations_')
    ) {
      keys.add('menu_quotations');
      continue;
    }
    if (prefix === 'sales' || prefix === 'sales_module' || prefix.startsWith('sales_')) {
      keys.add('menu_sales');
      // CRM enquiries often live under sales; quotations tile hubs need both.
      if (prefix.includes('enquir') || prefix.includes('quotation') || prefix === 'sales_module') {
        keys.add('menu_quotations');
      }
      continue;
    }
    if (prefix === 'crm' || prefix === 'crm_module' || prefix.startsWith('crm_')) {
      keys.add('menu_sales');
      continue;
    }
    if (prefix === 'finance' || prefix === 'finance_module' || prefix.startsWith('finance_')) {
      keys.add('menu_finance');
      continue;
    }
    if (prefix === 'accounts' || prefix === 'accounts_module' || prefix.startsWith('accounts_')) {
      keys.add('menu_accounts');
      continue;
    }
    if (
      prefix === 'documentation' ||
      prefix === 'documentation_module' ||
      prefix.startsWith('documentation_')
    ) {
      keys.add('menu_documentation');
      continue;
    }
    if (
      prefix === 'customers' ||
      prefix === 'customers_module' ||
      prefix.startsWith('customers_') ||
      prefix === 'support' ||
      prefix === 'support_module' ||
      prefix.startsWith('support_') ||
      prefix === 'parties' ||
      prefix === 'parties_module' ||
      prefix.startsWith('parties_')
    ) {
      // Parties + Customer Services share the classic menu_customers route key.
      keys.add('menu_customers');
      continue;
    }
    // Vendor Services matrix: vendor_* / vendors_* / vendor.users|permissions|disputes.
    if (
      prefix === 'vendor' ||
      prefix === 'vendor_module' ||
      prefix.startsWith('vendor_') ||
      prefix.startsWith('vendor.') ||
      prefix === 'vendors' ||
      prefix === 'vendors_module' ||
      prefix.startsWith('vendors_')
    ) {
      keys.add('menu_vendors');
      continue;
    }
    if (prefix === 'masters' || prefix === 'masters_module' || prefix.startsWith('masters_')) {
      keys.add('menu_masters');
      continue;
    }
    if (prefix === 'reports' || prefix === 'reports_module' || prefix.startsWith('reports_')) {
      keys.add('menu_reports');
      continue;
    }
    if (
      prefix === 'admin' ||
      prefix === 'admin_module' ||
      prefix === 'management' ||
      prefix === 'management_module' ||
      prefix.startsWith('admin_') ||
      prefix.startsWith('management_')
    ) {
      keys.add('menu_management');
      continue;
    }
    if (prefix === 'warehouse' || prefix === 'wms' || prefix === 'wms_module' || prefix.startsWith('wms_')) {
      keys.add('menu_warehouse');
    }
  }

  return [...keys];
}

/** True when JWT/matrix permissions grant the module at the requested level. */
export function hasMatrixModuleAccess(
  permissions: readonly string[],
  moduleKey: string,
  level: MatrixAccessLevel = 'see',
): boolean {
  const mod = moduleKey.trim().toLowerCase();
  if (!mod || permissions.length === 0) return false;

  // `vendor` ↔ `vendors` (BE enabled_modules / matrix use singular `vendor`).
  const modAliases =
    mod === 'vendor' || mod === 'vendors'
      ? (['vendor', 'vendors'] as const)
      : ([mod] as const);

  const accepted = new Set(levelsAtLeast(level));

  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = raw.trim().toLowerCase();

    for (const alias of modAliases) {
      // menu_{module} if backend emits it
      if (key === `menu_${alias}` && (level === 'see' || accepted.has('see'))) return true;
      // menu_vendors is the classic sidebar key for Vendor Services
      if (
        (alias === 'vendor' || alias === 'vendors') &&
        key === 'menu_vendors' &&
        (level === 'see' || accepted.has('see'))
      ) {
        return true;
      }

      // {module}.view / {module}.manage (route guards)
      if (key === `${alias}.view` && (level === 'see' || level === 'read')) return true;
      if (key === `${alias}.manage`) return true;
      if (key === `${alias}.read` && (level === 'see' || level === 'read')) return true;
      if (key === `${alias}.write` && level === 'write') return true;
      if (key === `${alias}.see` && level === 'see') return true;
    }

    const dot = key.lastIndexOf('.');
    if (dot <= 0) continue;
    const prefix = key.slice(0, dot);
    const flag = key.slice(dot + 1) as MatrixAccessLevel | 'view' | 'manage';

    const matchesModule = modAliases.some(
      (alias) =>
        prefix === `${alias}_module` ||
        prefix === alias ||
        prefix.startsWith(`${alias}_`),
    );

    if (!matchesModule) continue;

    if (flag === 'manage') return true;
    if (flag === 'view' && (level === 'see' || level === 'read')) return true;
    if (flag === 'see' || flag === 'read' || flag === 'write') {
      if (accepted.has(flag)) return true;
      // Higher grant implies lower for “see” checks
      if (level === 'see') return true;
      if (level === 'read' && (flag === 'read' || flag === 'write')) return true;
    }
  }

  return false;
}

/** Collect module keys that have at least `see` from a flat permission list (for debugging). */
export function matrixModulesFromPermissions(permissions: readonly string[]): string[] {
  const out = new Set<string>();
  for (const raw of permissions) {
    if (typeof raw !== 'string') continue;
    const key = raw.trim().toLowerCase();
    const m = /^([a-z0-9]+)(?:_module)?\.(?:see|read|write|view|manage)$/i.exec(key);
    if (m) out.add(m[1]);
    const m2 = /^([a-z0-9]+)_[a-z0-9_]+\.(?:see|read|write)$/i.exec(key);
    if (m2) out.add(m2[1]);
  }
  return [...out].sort();
}
