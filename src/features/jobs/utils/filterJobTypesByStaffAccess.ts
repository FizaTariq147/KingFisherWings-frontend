import type { PermissionKey } from '@/types/auth.types';
import {
  hasAnyOpsMatrixGrant,
  hasMatrixSubmoduleAccess,
} from '@/features/users/utils/matrixPermissionAccess';
import { DEPARTMENT_NAV, type DepartmentNavKey } from '../config/departmentNav';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';

type DeptAccessRule = {
  deptKey: DepartmentNavKey;
  matrixModule: string;
  matrixSubmodule: string;
  /** Classic menu fallback when staff has no ops matrix keys. */
  permission: PermissionKey;
  permissionAny?: PermissionKey[];
  jobTypes: JobType[];
};

/**
 * Same department → job_type map as sidebar / hubs.
 * Keep Air Export and Air Import independent.
 */
const DEPT_JOB_TYPE_RULES: DeptAccessRule[] = [
  {
    deptKey: 'air-export',
    matrixModule: 'operations',
    matrixSubmodule: 'air_export',
    permission: 'menu_jobs_air_export',
    jobTypes: ['AIR_EXPORT'],
  },
  {
    deptKey: 'air-import',
    matrixModule: 'operations',
    matrixSubmodule: 'air_import',
    permission: 'menu_jobs_air_export',
    jobTypes: ['AIR_IMPORT'],
  },
  {
    deptKey: 'sea-export',
    matrixModule: 'operations',
    matrixSubmodule: 'sea_export',
    permission: 'menu_jobs_sea_export',
    jobTypes: ['SEA_FCL_EXPORT', 'SEA_LCL_EXPORT'],
  },
  {
    deptKey: 'sea-import',
    matrixModule: 'operations',
    matrixSubmodule: 'sea_import',
    permission: 'menu_jobs_sea_import',
    jobTypes: ['SEA_FCL_IMPORT', 'SEA_LCL_IMPORT'],
  },
  {
    deptKey: 'road-freight',
    matrixModule: 'operations',
    matrixSubmodule: 'road_freight',
    permission: 'menu_jobs_air_export',
    jobTypes: ['ROAD_FREIGHT'],
  },
  {
    deptKey: 'customs-clearance',
    matrixModule: 'operations',
    matrixSubmodule: 'customs_clearance',
    permission: 'menu_documentation',
    permissionAny: ['menu_documentation'],
    jobTypes: ['CUSTOMS_CLEARANCE'],
  },
  {
    deptKey: 'nvocc',
    matrixModule: 'nvocc',
    matrixSubmodule: 'module',
    permission: 'menu_nvocc',
    jobTypes: ['NVOCC_EXPORT', 'NVOCC_IMPORT'],
  },
];

/** Types that are not department-scoped — only shown when staff has unrestricted ops. */
const UNSCOPED_WIZARD_TYPES: JobType[] = ['SERVICE_JOB', 'WAREHOUSE'];

function normalizeVisibleTokens(visibleJobTypes: string[] | null | undefined): string[] | null {
  if (visibleJobTypes === null || visibleJobTypes === undefined) return null;
  return visibleJobTypes.map((t) => t.trim().toLowerCase().replace(/-/g, '_'));
}

function deptAllowedByVisibleJobTypes(
  deptKey: DepartmentNavKey,
  visibleJobTypes: string[] | null | undefined,
): boolean {
  if (deptKey === 'nvocc') return true;
  const tokens = normalizeVisibleTokens(visibleJobTypes);
  if (tokens === null) return true;
  if (!tokens.length) return false;
  const matches = (needles: string[]) =>
    tokens.some((t) => needles.some((n) => t === n || t.includes(n) || n.includes(t)));
  switch (deptKey) {
    case 'air-export':
      return matches(['air_export', 'airexport']);
    case 'air-import':
      return matches(['air_import', 'airimport']);
    case 'sea-export':
      return matches(['sea_export', 'sea_fcl_export', 'sea_lcl_export', 'fcl_export', 'lcl_export']);
    case 'sea-import':
      return matches(['sea_import', 'sea_fcl_import', 'sea_lcl_import', 'fcl_import', 'lcl_import']);
    case 'road-freight':
      return matches(['road_freight', 'road', 'land', 'courier']);
    case 'customs-clearance':
      return matches(['customs_clearance', 'customs']);
    default:
      return true;
  }
}

function hasPermission(
  permissions: readonly string[],
  key: PermissionKey,
): boolean {
  return permissions.includes(key);
}

function staffCanAccessDept(
  rule: DeptAccessRule,
  opts: {
    permissions: readonly string[];
    visibleJobTypes?: string[] | null;
    unrestrictedOps?: boolean;
    isTenantAdmin?: boolean;
  },
): boolean {
  if (opts.isTenantAdmin) return true;
  if (!opts.unrestrictedOps && !deptAllowedByVisibleJobTypes(rule.deptKey, opts.visibleJobTypes)) {
    return false;
  }

  const perms = opts.permissions;
  if (rule.deptKey === 'nvocc') {
    return (
      hasMatrixSubmoduleAccess(perms, 'nvocc', 'module', 'see') ||
      hasPermission(perms, 'menu_nvocc')
    );
  }

  if (hasMatrixSubmoduleAccess(perms, rule.matrixModule, rule.matrixSubmodule, 'see')) {
    return true;
  }

  // Legacy staff (no ops matrix keys) — coarse menu_* only (same as Sidebar).
  if (!hasAnyOpsMatrixGrant(perms)) {
    if (rule.permissionAny?.length) {
      return rule.permissionAny.some((p) => hasPermission(perms, p));
    }
    return hasPermission(perms, rule.permission);
  }
  return false;
}

export type FilterJobTypesByStaffAccessOpts = {
  permissions?: readonly string[] | null;
  visibleJobTypes?: string[] | null;
  unrestrictedOps?: boolean;
  isTenantAdmin?: boolean;
  /** Candidate list (defaults to wizard radios). */
  candidates?: readonly JobType[];
};

/**
 * Filter create-job type radios to departments the staff can see in the sidebar.
 * Example: only `operations_air_export` + `operations_air_import` → AIR_EXPORT + AIR_IMPORT.
 */
export function filterJobTypesByStaffAccess(
  opts: FilterJobTypesByStaffAccessOpts = {},
): JobType[] {
  const candidates = opts.candidates?.length
    ? [...opts.candidates]
    : [...JOB_TYPE_WIZARD_OPTIONS];
  const candidateSet = new Set(candidates);

  if (opts.isTenantAdmin || opts.unrestrictedOps) {
    return candidates;
  }

  const perms = opts.permissions ?? [];
  const allowed = new Set<JobType>();

  for (const rule of DEPT_JOB_TYPE_RULES) {
    if (!staffCanAccessDept(rule, { ...opts, permissions: perms })) continue;
    const fromNav = DEPARTMENT_NAV.find((d) => d.key === rule.deptKey)?.jobTypes ?? rule.jobTypes;
    for (const t of fromNav) {
      if (candidateSet.has(t)) allowed.add(t);
    }
    for (const t of rule.jobTypes) {
      if (candidateSet.has(t)) allowed.add(t);
    }
  }

  // If matrix grants nothing (and not legacy menu fallback), keep candidates unchanged
  // only when there are no ops matrix keys AND no menu grants — callers still get a list.
  if (allowed.size === 0) {
    // No department access → do not offer SERVICE_JOB/WAREHOUSE as a loophole.
    return [];
  }

  // Unscoped types stay hidden unless unrestricted / tenant admin (handled above).
  for (const t of UNSCOPED_WIZARD_TYPES) {
    if (allowed.has(t)) allowed.delete(t);
  }

  return candidates.filter((t) => allowed.has(t));
}

/** Pick a safe default create type from the filtered list. */
export function pickDefaultJobType(
  preferred: JobType | null | undefined,
  allowed: readonly JobType[],
): JobType | undefined {
  if (!allowed.length) return undefined;
  if (preferred && allowed.includes(preferred)) return preferred;
  return allowed[0];
}
