import type { JobType } from '../constants/job.constants';
import { JOB_TYPES, JOB_TYPE_WIZARD_OPTIONS } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';
import { effectiveListJobTypes, normalizeJobTypeToken } from './deptAccessFromStaffGrants';
import { filterJobTypesByStaffAccess } from './filterJobTypesByStaffAccess';

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
 * Ops visible ∪ writable from /auth/me are authoritative (Tenant Admin grants).
 * Matrix submodule gaps must not hide types that /me already lists.
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
  const listScope = effectiveListJobTypes(
    opts.visibleJobTypes,
    opts.writableJobTypes,
    perms,
  );

  // 1) Explicit /me Ops visible∪writable — primary list scope.
  let fromMe: JobType[] = [];
  if (listScope && listScope.length > 0) {
    fromMe = jobTypesFromScopeTokens(listScope).filter((t) =>
      candidateSet.has(t),
    );
  }

  // 2) Matrix / menu fallback (and union) when /me is empty or partial.
  const fromMatrix = filterJobTypesByStaffAccess({
    permissions: perms,
    visibleJobTypes: listScope,
    writableJobTypes: opts.writableJobTypes,
    unrestrictedOps: false,
    isTenantAdmin: false,
    isModuleEnabled: opts.isModuleEnabled,
    candidates,
    mode: 'list',
  });

  const merged = expandDepartmentJobTypeFamilies([
    ...fromMe,
    ...fromMatrix,
  ]).filter((t) => candidateSet.has(t));

  // Department page: any granted type in segment → full segment (same as admin).
  if (opts.fullSegmentIfAnyAccess && opts.candidates?.length && merged.length > 0) {
    return [...opts.candidates];
  }

  // Dashboard: prefer explicit /me union; never return empty when /me listed types.
  if (merged.length) return merged;
  if (fromMe.length) return fromMe;

  // Last resort: wizard defaults only when both /me and matrix yielded nothing.
  if (!listScope?.length) {
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
