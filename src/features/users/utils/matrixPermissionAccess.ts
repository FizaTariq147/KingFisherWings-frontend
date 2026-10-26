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

function addOpsJobMenus(keys: Set<PermissionKey>, sub: string) {
  if (!sub || sub === 'module') {
    keys.add('menu_jobs_air_export');
    keys.add('menu_jobs_sea_export');
    keys.add('menu_jobs_sea_import');
    keys.add('menu_documentation');
    return;
  }
  if (sub.includes('air')) keys.add('menu_jobs_air_export');
  if (sub.includes('sea_export') || sub.includes('fcl_export') || sub.includes('lcl_export')) {
    keys.add('menu_jobs_sea_export');
  }
  if (sub.includes('sea_import') || sub.includes('fcl_import') || sub.includes('lcl_import')) {
    keys.add('menu_jobs_sea_import');
  }
  // road_freight / land / courier / customs share the ops job route group
  if (
    sub.includes('road') ||
    sub.includes('land') ||
    sub.includes('courier') ||
    sub.includes('customs')
  ) {
    keys.add('menu_jobs_air_export');
    keys.add('menu_jobs_sea_export');
    keys.add('menu_jobs_sea_import');
  }
  if (sub.includes('doc')) keys.add('menu_documentation');
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
      prefix === 'support_module'
    ) {
      keys.add('menu_customers');
      continue;
    }
    if (prefix === 'vendors' || prefix === 'vendors_module' || prefix.startsWith('vendors_')) {
      keys.add('menu_vendors');
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

function levelsAtLeast(level: MatrixAccessLevel): MatrixAccessLevel[] {
  if (level === 'write') return ['write'];
  if (level === 'read') return ['read', 'write'];
  return ['see', 'read', 'write'];
}

/** True when JWT/matrix permissions grant the module at the requested level. */
export function hasMatrixModuleAccess(
  permissions: readonly string[],
  moduleKey: string,
  level: MatrixAccessLevel = 'see',
): boolean {
  const mod = moduleKey.trim().toLowerCase();
  if (!mod || permissions.length === 0) return false;

  const accepted = new Set(levelsAtLeast(level));

  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = raw.trim().toLowerCase();

    // menu_{module} if backend emits it
    if (key === `menu_${mod}` && (level === 'see' || accepted.has('see'))) return true;

    // {module}.view / {module}.manage (route guards)
    if (key === `${mod}.view` && (level === 'see' || level === 'read')) return true;
    if (key === `${mod}.manage`) return true;
    if (key === `${mod}.read` && (level === 'see' || level === 'read')) return true;
    if (key === `${mod}.write` && level === 'write') return true;
    if (key === `${mod}.see` && level === 'see') return true;

    const dot = key.lastIndexOf('.');
    if (dot <= 0) continue;
    const prefix = key.slice(0, dot);
    const flag = key.slice(dot + 1) as MatrixAccessLevel | 'view' | 'manage';

    const matchesModule =
      prefix === `${mod}_module` ||
      prefix === mod ||
      prefix.startsWith(`${mod}_`);

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
