import type { JobType } from '../constants/job.constants';
import { JOB_TYPES, JOB_TYPE_WIZARD_OPTIONS } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';
import { effectiveListJobTypes, normalizeJobTypeToken } from './deptAccessFromStaffGrants';
import { filterJobTypesByStaffAccess } from './filterJobTypesByStaffAccess';
import {
  parseOpsJobTypePermissions,
  resolveClientVisibleJobTypes,
} from './resolveClientVisibleJobTypes';

export type ResolveStaffListJobTypesOpts = {
  permissions?: readonly string[] | null;
  visibleJobTypes?: string[] | null;
  writableJobTypes?: string[] | null;
  isModuleEnabled?: (moduleKey: string) => boolean;
  /** Limit to a department segment (Sea Export, Sea Import, …). */
  candidates?: readonly JobType[];
  /**
   * When true and staff has any access within `candidates`, return the full
   * candidate list (same shape as admin for that department page).
   */
  fullSegmentIfAnyAccess?: boolean;
  /** Prefer BE GET /jobs meta.visible_job_types when available. */
  metaVisibleJobTypes?: string[] | null;
};

/** Sibling sets — staff list scope matches admin per department. */
const DEPT_TYPE_FAMILIES: JobType[][] = [
  ['SEA_FCL_EXPORT', 'SEA_LCL_EXPORT'],
  ['SEA_FCL_IMPORT', 'SEA_LCL_IMPORT'],
  ['ROAD_FREIGHT', 'LAND', 'COURIER'],
  ['NVOCC_EXPORT', 'NVOCC_IMPORT'],
];

/**
 * If staff has any type in a department family, include the full family
 * (Sea Export → FCL + LCL export, Sea Import → FCL + LCL import, …).
 */
export function expandDepartmentJobTypeFamilies(
  types: readonly JobType[],
): JobType[] {
  const set = new Set(types.map((t) => canonicalizeJobType(String(t))));
  for (const family of DEPT_TYPE_FAMILIES) {
    if (family.some((t) => set.has(t))) {
      for (const t of family) set.add(t);
    }
  }
  return [...set];
}

/**
 * Map /me Ops visible∪writable tokens onto canonical JobType enums.
 */
function jobTypesFromScopeTokens(tokens: readonly string[]): JobType[] {
  const out = new Set<JobType>();
  for (const raw of tokens) {
    const n = normalizeJobTypeToken(raw);
    if (!n) continue;

    if (
      n === 'sea_export' ||
      n === 'seaexport' ||
      (n.includes('sea_export') && !n.includes('import'))
    ) {
      out.add('SEA_FCL_EXPORT');
      out.add('SEA_LCL_EXPORT');
      continue;
    }
    if (
      n === 'sea_import' ||
      n === 'seaimport' ||
      (n.includes('sea_import') && !n.includes('export'))
    ) {
      out.add('SEA_FCL_IMPORT');
      out.add('SEA_LCL_IMPORT');
      continue;
    }
    if (n === 'sea_fcl_export' || n === 'fcl_export') {
      out.add('SEA_FCL_EXPORT');
      continue;
    }
    if (n === 'sea_lcl_export' || n === 'lcl_export') {
      out.add('SEA_LCL_EXPORT');
      continue;
    }
    if (n === 'sea_fcl_import' || n === 'fcl_import') {
      out.add('SEA_FCL_IMPORT');
      continue;
    }
    if (n === 'sea_lcl_import' || n === 'lcl_import') {
      out.add('SEA_LCL_IMPORT');
      continue;
    }
    if (n === 'air_export' || n === 'airexport' || n.includes('air_export')) {
      out.add('AIR_EXPORT');
      continue;
    }
    if (n === 'air_import' || n === 'airimport' || n.includes('air_import')) {
      out.add('AIR_IMPORT');
      continue;
    }
    if (n === 'road_freight' || n === 'road' || n.includes('road_freight')) {
      out.add('ROAD_FREIGHT');
      continue;
    }
    if (n === 'land' || n === 'land_freight') {
      out.add('LAND');
      continue;
    }
    if (n === 'courier') {
      out.add('COURIER');
      continue;
    }
    if (n.includes('customs')) {
      out.add('CUSTOMS_CLEARANCE');
      continue;
    }
    if (n === 'nvocc_export' || n === 'nvocc_exp') {
      out.add('NVOCC_EXPORT');
      continue;
    }
    if (n === 'nvocc_import' || n === 'nvocc_imp') {
      out.add('NVOCC_IMPORT');
      continue;
    }
    if (n === 'nvocc' || n.includes('nvocc')) {
      out.add('NVOCC_EXPORT');
      out.add('NVOCC_IMPORT');
      continue;
    }

    out.add(canonicalizeJobType(raw));
  }
  return expandDepartmentJobTypeFamilies([...out]);
}

/**
 * Job types staff may list for Active shipments / department grids.
 *
 * Mirrors BE resolveVisibleJobTypes:
 * - operations_scope → only /me visible∪writable + direct operations_{type}.*
 *   (role pack must not re-add other departments)
 * - no scope marker → /me first, else matrix/role preset (not blank)
 *
 * Callers must NOT send these as GET /jobs?job_type / job_types unless
 * canSendJobTypeQuery says so — prefer plain list + client filter.
 */
export function resolveStaffListJobTypes(
  opts: ResolveStaffListJobTypesOpts,
): JobType[] {
  const candidates = opts.candidates?.length
    ? [...opts.candidates]
    : [...JOB_TYPES];
  const candidateSet = new Set(
    candidates.map((t) => canonicalizeJobType(String(t))),
  );
  const perms = opts.permissions ?? [];

  const clientScope = resolveClientVisibleJobTypes({
    isUnrestricted: false,
    permissions: perms,
    visibleJobTypes: opts.visibleJobTypes,
    writableJobTypes: opts.writableJobTypes,
    metaVisibleJobTypes: opts.metaVisibleJobTypes,
  });

  if (clientScope.types === null) {
    return [...candidates];
  }

  // Explicit meta empty allow-list from BE → locked.
  if (
    Array.isArray(opts.metaVisibleJobTypes) &&
    opts.metaVisibleJobTypes.length === 0
  ) {
    return [];
  }

  if (clientScope.hasOperationsScope && (clientScope.types?.length ?? 0) > 0) {
    // Scope + direct grants: only those types (role pack must not re-open air etc.).
    const scoped = (clientScope.types ?? []).filter((t) => candidateSet.has(t));
    if (
      opts.fullSegmentIfAnyAccess &&
      opts.candidates?.length &&
      scoped.length > 0
    ) {
      return [...opts.candidates];
    }
    return scoped;
  }

  // Scope marker with no direct type grants → fall through to role preset below.

  const listScope = effectiveListJobTypes(
    opts.visibleJobTypes,
    opts.writableJobTypes,
    perms,
  );

  // Prefer resolver output ( /me ∪ direct codes ) over matrix role-pack fill-in.
  let fromMe: JobType[] = [];
  if (clientScope.types.length > 0) {
    fromMe = clientScope.types.filter((t) => candidateSet.has(t));
  } else if (listScope && listScope.length > 0) {
    fromMe = jobTypesFromScopeTokens(listScope).filter((t) =>
      candidateSet.has(t),
    );
  }

  const { directTypes } = parseOpsJobTypePermissions(perms);
  const fromDirect = directTypes.filter((t) => candidateSet.has(t));

  // No scope marker and no direct /me codes → role preset / matrix (keep departments).
  const fromMatrix =
    !fromMe.length && !fromDirect.length
      ? filterJobTypesByStaffAccess({
          permissions: perms,
          visibleJobTypes: listScope,
          writableJobTypes: opts.writableJobTypes,
          unrestrictedOps: false,
          isTenantAdmin: false,
          isModuleEnabled: opts.isModuleEnabled,
          candidates,
          mode: 'list',
        })
      : [];

  const merged = expandDepartmentJobTypeFamilies([
    ...fromMe,
    ...fromDirect,
    ...fromMatrix,
  ]).filter((t) => candidateSet.has(t));

  if (opts.fullSegmentIfAnyAccess && opts.candidates?.length && merged.length > 0) {
    return [...opts.candidates];
  }

  if (merged.length) return merged;
  if (fromMe.length) return fromMe;

  if (!listScope?.length && !clientScope.types.length) {
    return filterJobTypesByStaffAccess({
      permissions: perms,
      visibleJobTypes: listScope,
      writableJobTypes: opts.writableJobTypes,
      unrestrictedOps: false,
      isTenantAdmin: false,
      isModuleEnabled: opts.isModuleEnabled,
      candidates: [...JOB_TYPE_WIZARD_OPTIONS],
      mode: 'list',
    });
  }

  return [];
}
