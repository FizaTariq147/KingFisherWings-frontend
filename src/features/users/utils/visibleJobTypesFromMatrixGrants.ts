import type { PermissionMatrixGrant } from '../types/userPermissionMatrix.types';
import { accessFromFlags } from './permissionAccess';

/**
 * Map ops permission-matrix grants → `visible_job_types` for BE list/search ACL.
 * Matrix-only assignment often left `visible_job_types` as `[]`, so staff could create
 * jobs but GET /jobs (and quotes/shipments) returned nothing.
 *
 * - `null` — unrestricted (module-level operations grant)
 * - `string[]` — canonical job_type enums for granted submodules
 * - `undefined` — no ops grants; omit from PUT (do not wipe scope)
 */
function isOpsOrNvoccModule(module: string): boolean {
  const mod = module
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return mod.startsWith('operations') || mod === 'nvocc' || mod.startsWith('nvocc');
}

export function visibleJobTypesFromMatrixGrants(
  grants: readonly PermissionMatrixGrant[],
): string[] | null | undefined {
  const opsRows = grants.filter((g) => isOpsOrNvoccModule(String(g.module ?? '')));
  // No ops/nvocc rows in payload → leave BE scope untouched.
  if (!opsRows.length) return undefined;

  const active = opsRows.filter((g) => {
    const access =
      g.access ?? accessFromFlags(Boolean(g.see), Boolean(g.read), Boolean(g.write));
    return access !== 'none';
  });

  // Explicit ops grid with everything None → empty scope (not unrestricted).
  if (!active.length) return [];

  const types = new Set<string>();
  let unrestrictedOps = false;

  for (const g of active) {
    const mod = String(g.module ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
    const sub = String(g.submodule ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

    if (mod === 'nvocc' || mod.startsWith('nvocc')) {
      types.add('NVOCC_EXPORT');
      types.add('NVOCC_IMPORT');
      continue;
    }

    // Module-level operations → unrestricted list scope (null on BE).
    if (
      (mod === 'operations' || mod === 'operations_module') &&
      (sub === 'module' || sub === '' || sub === 'operations')
    ) {
      unrestrictedOps = true;
      continue;
    }

    const key = mod.startsWith('operations_') ? mod.slice('operations_'.length) : sub;

    if (key.includes('air_export') || key === 'airexport') {
      types.add('AIR_EXPORT');
    } else if (key.includes('air_import') || key === 'airimport') {
      types.add('AIR_IMPORT');
    } else if (key === 'air' || (key.startsWith('air_') && !key.includes('export') && !key.includes('import'))) {
      types.add('AIR_EXPORT');
      types.add('AIR_IMPORT');
    }

    if (
      key.includes('sea_export') ||
      key.includes('fcl_export') ||
      key.includes('lcl_export')
    ) {
      types.add('SEA_FCL_EXPORT');
      types.add('SEA_LCL_EXPORT');
    }
    if (
      key.includes('sea_import') ||
      key.includes('fcl_import') ||
      key.includes('lcl_import')
    ) {
      types.add('SEA_FCL_IMPORT');
      types.add('SEA_LCL_IMPORT');
    }
    if (key.includes('customs')) {
      types.add('CUSTOMS_CLEARANCE');
    }
    if (key.includes('road') || key === 'land' || key.includes('courier')) {
      types.add('ROAD_FREIGHT');
      types.add('LAND');
      types.add('COURIER');
    }
    if (key.includes('warehouse')) {
      types.add('WAREHOUSE');
    }
  }

  if (unrestrictedOps) return null;
  if (!types.size) return undefined;
  return [...types];
}
