import type { PermissionKey } from '@/types/auth.types';
import {
  hasAnyOpsMatrixGrant,
  hasMatrixModuleAccess,
  hasMatrixSubmoduleAccess,
} from '@/features/users/utils/matrixPermissionAccess';
import { DEPARTMENT_NAV, type DepartmentNavKey } from '../config/departmentNav';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';
import {
  deptAllowedByVisibleJobTypes,
  effectiveVisibleJobTypes,
} from './deptAccessFromStaffGrants';

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

/** Types that are not department-scoped — only shown when staff has unrestricted ops / tenant admin. */
const UNSCOPED_WIZARD_TYPES: JobType[] = ['SERVICE_JOB', 'WAREHOUSE'];

function hasPermission(
  permissions: readonly string[],
  key: PermissionKey,
): boolean {
  return permissions.includes(key);
}

/** Mirror Sidebar enabled_modules gate (operations vs nvocc). */
function deptModuleEnabled(
  deptKey: DepartmentNavKey,
  isModuleEnabled?: (moduleKey: string) => boolean,
): boolean {
  if (!isModuleEnabled) return true;
  if (deptKey === 'nvocc') return isModuleEnabled('nvocc');
  return isModuleEnabled('operations');
}

/**
 * Same rules as Sidebar department visibility (permissions / matrix).
 * `unrestrictedOps` only skips visible_job_types scoping — it must NOT unlock NVOCC
 * (or any other dept) without the matching grant.
 */
function staffCanAccessDept(
  rule: DeptAccessRule,
  opts: {
    permissions: readonly string[];
    visibleJobTypes?: string[] | null;
    unrestrictedOps?: boolean;
    isModuleEnabled?: (moduleKey: string) => boolean;
  },
): boolean {
  if (!deptModuleEnabled(rule.deptKey, opts.isModuleEnabled)) return false;

  const perms = opts.permissions;
  const effectiveVisible = effectiveVisibleJobTypes(opts.visibleJobTypes, perms);

  // NVOCC uses module-level matrix (Sidebar: hasMatrixModule('nvocc') / menu_nvocc).
  if (rule.deptKey === 'nvocc') {
    return (
      hasMatrixModuleAccess(perms, 'nvocc', 'see') ||
      hasMatrixSubmoduleAccess(perms, 'nvocc', 'module', 'see') ||
      hasPermission(perms, 'menu_nvocc')
    );
  }

  const matrixOk = hasMatrixSubmoduleAccess(
    perms,
    rule.matrixModule,
    rule.matrixSubmodule,
    'see',
  );
  if (matrixOk) {
    if (opts.unrestrictedOps) return true;
    return deptAllowedByVisibleJobTypes(rule.deptKey, effectiveVisible);
  }

  // Legacy staff (no ops matrix keys) — coarse menu_* only (same as Sidebar).
  if (!hasAnyOpsMatrixGrant(perms)) {
    if (!opts.unrestrictedOps && !deptAllowedByVisibleJobTypes(rule.deptKey, effectiveVisible)) {
      return false;
    }
    if (rule.permissionAny?.length) {
      return rule.permissionAny.some((p) => hasPermission(perms, p));
    }
    return hasPermission(perms, rule.permission);
  }
  return false;
}

function collectTypesForRule(
  rule: DeptAccessRule,
  candidateSet: Set<JobType>,
  into: Set<JobType>,
) {
  const fromNav = DEPARTMENT_NAV.find((d) => d.key === rule.deptKey)?.jobTypes ?? rule.jobTypes;
  for (const t of fromNav) {
    if (candidateSet.has(t)) into.add(t);
  }
  for (const t of rule.jobTypes) {
    if (candidateSet.has(t)) into.add(t);
  }
}

export type FilterJobTypesByStaffAccessOpts = {
  permissions?: readonly string[] | null;
  visibleJobTypes?: string[] | null;
  /**
   * When true, skip visible_job_types department scoping only.
   * Does NOT grant every job type — matrix / menu permissions still apply (same as Sidebar).
   */
  unrestrictedOps?: boolean;
  isTenantAdmin?: boolean;
  /** Super Admin Features allow-list — same gate as Sidebar `hasEnabledModule`. */
  isModuleEnabled?: (moduleKey: string) => boolean;
  /** Candidate list (defaults to wizard radios). */
  candidates?: readonly JobType[];
};

/**
 * Filter create-job type radios to departments the staff can see in the sidebar.
 * Example: only `operations_air_export` + `operations_air_import` → AIR_EXPORT + AIR_IMPORT.
 * NVOCC appears only when the NVOCC nav item would (matrix / menu_nvocc + enabled module).
 */
export function filterJobTypesByStaffAccess(
  opts: FilterJobTypesByStaffAccessOpts = {},
): JobType[] {
  const candidates = opts.candidates?.length
    ? [...opts.candidates]
    : [...JOB_TYPE_WIZARD_OPTIONS];
  const candidateSet = new Set(candidates);
  const allowed = new Set<JobType>();

  // Tenant admins: all enabled departments (Sidebar shows every enabled dept).
  if (opts.isTenantAdmin) {
    for (const rule of DEPT_JOB_TYPE_RULES) {
      if (!deptModuleEnabled(rule.deptKey, opts.isModuleEnabled)) continue;
      collectTypesForRule(rule, candidateSet, allowed);
    }
    const opsOn = !opts.isModuleEnabled || opts.isModuleEnabled('operations');
    if (opsOn) {
      for (const t of UNSCOPED_WIZARD_TYPES) {
        if (candidateSet.has(t)) allowed.add(t);
      }
    }
    return candidates.filter((t) => allowed.has(t));
  }

  // Staff: never unlock all types via unrestrictedOps — match Sidebar permission checks.
  const perms = opts.permissions ?? [];
  for (const rule of DEPT_JOB_TYPE_RULES) {
    if (
      !staffCanAccessDept(rule, {
        permissions: perms,
        visibleJobTypes: opts.visibleJobTypes,
        unrestrictedOps: opts.unrestrictedOps,
        isModuleEnabled: opts.isModuleEnabled,
      })
    ) {
      continue;
    }
    collectTypesForRule(rule, candidateSet, allowed);
  }

  if (allowed.size === 0) {
    return [];
  }

  // Unscoped types stay hidden for department-scoped staff.
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
