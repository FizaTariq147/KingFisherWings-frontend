import type { PermissionAccessLevel } from '../types/userPermissionMatrix.types';
import type { PermissionMatrixGrant } from '../types/userPermissionMatrix.types';
import { accessFromFlags } from './permissionAccess';

/**
 * Map ops permission-matrix grants → job-type scope for BE list/create ACL.
 *
 * - `null` — unrestricted (module-level operations grant)
 * - `string[]` — canonical job_type enums for granted submodules
 * - `undefined` — no ops grants; omit from payload (do not wipe scope)
 *
 * `minAccess`:
 * - `read` → visible_job_types (see/read/write)
 * - `write` → writable_job_types (write only)
 */
function isOpsOrNvoccModule(module: string): boolean {
  const mod = module
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return mod.startsWith('operations') || mod === 'nvocc' || mod.startsWith('nvocc');
}

function accessRank(access: PermissionAccessLevel): number {
  if (access === 'write') return 2;
  if (access === 'read') return 1;
  return 0;
}

function grantAccess(g: PermissionMatrixGrant): PermissionAccessLevel {
  return g.access ?? accessFromFlags(Boolean(g.see), Boolean(g.read), Boolean(g.write));
}

function jobTypesFromMatrixGrants(
  grants: readonly PermissionMatrixGrant[],
  minAccess: 'read' | 'write',
): string[] | null | undefined {
  const minRank = minAccess === 'write' ? 2 : 1;
  const opsRows = grants.filter((g) => isOpsOrNvoccModule(String(g.module ?? '')));
  if (!opsRows.length) return undefined;

  const active = opsRows.filter((g) => accessRank(grantAccess(g)) >= minRank);
  if (!active.length) {
    // Ops rows present but none meet minAccess → empty scoped list.
    return [];
  }

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
    } else if (
      key === 'air' ||
      (key.startsWith('air_') && !key.includes('export') && !key.includes('import'))
    ) {
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

/** Visible / list scope (read+). */
export function visibleJobTypesFromMatrixGrants(
  grants: readonly PermissionMatrixGrant[],
): string[] | null | undefined {
  return jobTypesFromMatrixGrants(grants, 'read');
}

/** Create / write scope. */
export function writableJobTypesFromMatrixGrants(
  grants: readonly PermissionMatrixGrant[],
): string[] | null | undefined {
  return jobTypesFromMatrixGrants(grants, 'write');
}

/** Nest forbidNonWhitelisted for scope fields. */
export function isVisibleJobTypesNotAllowedError(error: unknown): boolean {
  const axiosErr = error as {
    response?: { status?: number; data?: { message?: string | string[] } };
    message?: string;
  };
  const status = axiosErr.response?.status;
  if (status !== 400 && status !== 422) return false;
  const raw = axiosErr.response?.data?.message ?? axiosErr.message ?? '';
  const msg = Array.isArray(raw) ? raw.map(String).join('; ') : String(raw);
  return (
    /visible_job_types|writable_job_types/i.test(msg) &&
    /should not exist|whitelist|forbid/i.test(msg)
  );
}
