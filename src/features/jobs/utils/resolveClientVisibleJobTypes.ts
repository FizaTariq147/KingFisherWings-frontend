import type { JobType } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';
import { expandDepartmentJobTypeFamilies } from './resolveStaffListJobTypes';

/**
 * FE mirror of BE staff job visibility (see backend job-type-access notes).
 *
 * - Admin / unrestricted → null (no job_type filter).
 * - Staff with operations_scope → only direct operations_{type}.see|read|write
 *   and /me visible∪writable — never invent the full role pack.
 * - Staff with no scope marker → /me visible∪writable, else direct ops_* codes.
 *
 * List UIs must NOT send GET /jobs?job_type=X unless X is in this set, or BE
 * returns job_type: { in: [] } while dashboard-counts (no job_type) still shows totals.
 */

export type ClientVisibleJobScope = {
  /** null = admin / unrestricted (all departments). */
  types: JobType[] | null;
  hasOperationsScope: boolean;
  /** True when scope resolved to an explicit empty allow-list. */
  lockedEmpty: boolean;
};

function mapOpsSubmoduleToJobTypes(sub: string): JobType[] {
  const key = sub.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!key || key === 'scope' || key === 'module' || key === 'operations') return [];

  if (key.includes('air_export') || key === 'airexport') return ['AIR_EXPORT'];
  if (key.includes('air_import') || key === 'airimport') return ['AIR_IMPORT'];
  if (key === 'air' || (key.startsWith('air_') && !key.includes('export') && !key.includes('import'))) {
    return ['AIR_EXPORT', 'AIR_IMPORT'];
  }
  if (key === 'sea_fcl_export' || key === 'fcl_export') return ['SEA_FCL_EXPORT'];
  if (key === 'sea_lcl_export' || key === 'lcl_export') return ['SEA_LCL_EXPORT'];
  if (key === 'sea_fcl_import' || key === 'fcl_import') return ['SEA_FCL_IMPORT'];
  if (key === 'sea_lcl_import' || key === 'lcl_import') return ['SEA_LCL_IMPORT'];
  if (key.includes('sea_export')) return ['SEA_FCL_EXPORT', 'SEA_LCL_EXPORT'];
  if (key.includes('sea_import')) return ['SEA_FCL_IMPORT', 'SEA_LCL_IMPORT'];
  if (key.includes('customs')) return ['CUSTOMS_CLEARANCE'];
  if (key.includes('road') || key === 'land' || key.includes('courier')) {
    return ['ROAD_FREIGHT', 'LAND', 'COURIER'];
  }
  if (key.includes('nvocc')) return ['NVOCC_EXPORT', 'NVOCC_IMPORT'];
  if (key.includes('warehouse')) return ['WAREHOUSE'];
  return [];
}

/** Parse JWT /me permission keys into direct job-type grants + scope marker. */
export function parseOpsJobTypePermissions(permissions: readonly string[]): {
  hasOperationsScope: boolean;
  directTypes: JobType[];
} {
  let hasOperationsScope = false;
  const types = new Set<JobType>();

  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');

    if (key === 'operations_scope' || key.startsWith('operations_scope.')) {
      hasOperationsScope = true;
      continue;
    }

    // operations_sea_fcl_export.write | operations_sea_export.see | …
    const dotted = key.match(/^operations_([a-z0-9_]+)\.(see|read|write)$/);
    if (dotted) {
      for (const t of mapOpsSubmoduleToJobTypes(dotted[1])) types.add(t);
      continue;
    }

    // Bare operations_sea_fcl_export (no access suffix)
    if (key.startsWith('operations_') && !key.includes('.')) {
      const sub = key.slice('operations_'.length);
      if (sub === 'scope') {
        hasOperationsScope = true;
        continue;
      }
      for (const t of mapOpsSubmoduleToJobTypes(sub)) types.add(t);
    }
  }

  return {
    hasOperationsScope,
    directTypes: expandDepartmentJobTypeFamilies([...types]),
  };
}

function typesFromMeTokens(tokens: readonly string[]): JobType[] {
  const out = new Set<JobType>();
  for (const raw of tokens) {
    const n = String(raw ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
    if (!n) continue;

    // Permission-style tokens inside visible_job_types
    if (n.startsWith('operations_')) {
      for (const t of mapOpsSubmoduleToJobTypes(n.replace(/^operations_/, '').replace(/\.(see|read|write)$/, ''))) {
        out.add(t);
      }
      continue;
    }

    out.add(canonicalizeJobType(raw));
  }
  return expandDepartmentJobTypeFamilies([...out]);
}

/**
 * Resolve the job-type allow-list the FE should honor for filtering / deciding
 * whether a job_type query param is safe to send.
 */
export function resolveClientVisibleJobTypes(opts: {
  isUnrestricted: boolean;
  permissions?: readonly string[] | null;
  visibleJobTypes?: string[] | null;
  writableJobTypes?: string[] | null;
  /** Prefer BE list meta.visible_job_types when present (null = admin). */
  metaVisibleJobTypes?: string[] | null;
}): ClientVisibleJobScope {
  if (opts.isUnrestricted) {
    return { types: null, hasOperationsScope: false, lockedEmpty: false };
  }

  // Authoritative when BE returns it on GET /jobs meta.
  if (opts.metaVisibleJobTypes === null) {
    return { types: null, hasOperationsScope: false, lockedEmpty: false };
  }
  if (Array.isArray(opts.metaVisibleJobTypes)) {
    if (!opts.metaVisibleJobTypes.length) {
      return { types: [], hasOperationsScope: true, lockedEmpty: true };
    }
    return {
      types: typesFromMeTokens(opts.metaVisibleJobTypes),
      hasOperationsScope: false,
      lockedEmpty: false,
    };
  }

  const perms = opts.permissions ?? [];
  const { hasOperationsScope, directTypes } = parseOpsJobTypePermissions(perms);

  const meTokens = [
    ...(Array.isArray(opts.visibleJobTypes) ? opts.visibleJobTypes : []),
    ...(Array.isArray(opts.writableJobTypes) ? opts.writableJobTypes : []),
  ];
  const fromMe = meTokens.length ? typesFromMeTokens(meTokens) : [];

  if (hasOperationsScope) {
    // Scope + direct /me or operations_{type}.* → only those types (no role-pack inflate).
    // Scope with no type grants → leave types empty here; callers fall back to role preset
    // (see resolveStaffListJobTypes) so OPERATIONS_MANAGER does not go blank.
    const merged = expandDepartmentJobTypeFamilies([...fromMe, ...directTypes]);
    return {
      types: merged,
      hasOperationsScope: true,
      lockedEmpty: false,
    };
  }

  if (fromMe.length) {
    return {
      types: fromMe,
      hasOperationsScope: false,
      lockedEmpty: false,
    };
  }

  if (directTypes.length) {
    return {
      types: directTypes,
      hasOperationsScope: false,
      lockedEmpty: false,
    };
  }

  // No marker and no direct codes — leave null-ish empty; plain GET /jobs still
  // relies on BE role preset. Do not invent every department on the FE.
  return { types: [], hasOperationsScope: false, lockedEmpty: false };
}

/** Safe to send GET /jobs?job_type= only when unrestricted or type ∈ allow-list. */
export function canSendJobTypeQuery(
  scope: ClientVisibleJobScope,
  jobType: string | undefined,
): boolean {
  if (!jobType?.trim()) return false;
  if (scope.types === null) return true;
  if (!scope.types.length) return false;
  const t = canonicalizeJobType(jobType);
  return scope.types.includes(t);
}
