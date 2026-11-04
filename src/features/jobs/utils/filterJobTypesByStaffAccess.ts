import type { PermissionKey } from '@/types/auth.types';
import {
  hasAnyOpsMatrixGrant,
  hasMatrixModuleAccess,
  hasMatrixSubmoduleAccess,
  type MatrixAccessLevel,
} from '@/features/users/utils/matrixPermissionAccess';
import { DEPARTMENT_NAV, type DepartmentNavKey } from '../config/departmentNav';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';
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
    /** Scope tokens: visible for list/nav, writable for create. */
    scopeJobTypes?: string[] | null;
    unrestrictedOps?: boolean;
    isModuleEnabled?: (moduleKey: string) => boolean;
    /** Create wizards require write; list/sidebar use see. */
    matrixLevel?: MatrixAccessLevel;
  },
): boolean {
  if (!deptModuleEnabled(rule.deptKey, opts.isModuleEnabled)) return false;

  const perms = opts.permissions;
  const level: MatrixAccessLevel = opts.matrixLevel ?? 'see';
  const effectiveScope = effectiveVisibleJobTypes(opts.scopeJobTypes, perms);

  // NVOCC uses module-level matrix (Sidebar: hasMatrixModule('nvocc') / menu_nvocc).
  if (rule.deptKey === 'nvocc') {
    return (
      hasMatrixModuleAccess(perms, 'nvocc', level) ||
      hasMatrixSubmoduleAccess(perms, 'nvocc', 'module', level) ||
      hasPermission(perms, 'menu_nvocc')
    );
  }

  const matrixOk = hasMatrixSubmoduleAccess(
    perms,
    rule.matrixModule,
    rule.matrixSubmodule,
    level,
  );
  if (matrixOk) {
    if (opts.unrestrictedOps) return true;
    return deptAllowedByVisibleJobTypes(rule.deptKey, effectiveScope);
  }

  // Legacy staff (no ops matrix keys) — coarse menu_* only (same as Sidebar).
  if (!hasAnyOpsMatrixGrant(perms)) {
    if (!opts.unrestrictedOps && !deptAllowedByVisibleJobTypes(rule.deptKey, effectiveScope)) {
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
  /** Create wizards: prefer /auth/me.writable_job_types when present. */
  writableJobTypes?: string[] | null;
  /**
   * `list` — sidebar / list filters (see + visible).
   * `create` — create pickers (write + writable, falls back to visible).
   */
  mode?: 'list' | 'create';
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

function intersectWithWritableAllowList(
  types: JobType[],
  writableJobTypes: string[] | null | undefined,
): JobType[] {
  if (writableJobTypes === null || writableJobTypes === undefined) return types;
  if (!writableJobTypes.length) return [];
  const allow = new Set(
    writableJobTypes.map((t) => canonicalizeJobType(t)).filter(Boolean),
  );
  return types.filter((t) => allow.has(t));
}

/**
 * Filter job-type radios by department grants.
 * Create mode uses write + writable_job_types; list/sidebar uses see + visible.
 * Example: only `operations_air_export` + `operations_air_import` → AIR_EXPORT + AIR_IMPORT.
 */
export function filterJobTypesByStaffAccess(
  opts: FilterJobTypesByStaffAccessOpts = {},
): JobType[] {
  const candidates = opts.candidates?.length
    ? [...opts.candidates]
    : [...JOB_TYPE_WIZARD_OPTIONS];
  const candidateSet = new Set(candidates);
  const allowed = new Set<JobType>();
  const isCreate = opts.mode === 'create';
  const matrixLevel: MatrixAccessLevel = isCreate ? 'write' : 'see';
  // Create: prefer writable scope from /auth/me; fall back to visible when omitted.
  const scopeJobTypes = isCreate
    ? opts.writableJobTypes !== undefined
      ? opts.writableJobTypes
      : opts.visibleJobTypes
    : opts.visibleJobTypes;

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
    const adminTypes = candidates.filter((t) => allowed.has(t));
    return isCreate
      ? intersectWithWritableAllowList(adminTypes, opts.writableJobTypes)
      : adminTypes;
  }

  // Staff: never unlock all types via unrestrictedOps — match Sidebar permission checks.
  const perms = opts.permissions ?? [];
  for (const rule of DEPT_JOB_TYPE_RULES) {
    if (
      !staffCanAccessDept(rule, {
        permissions: perms,
        scopeJobTypes,
        unrestrictedOps: opts.unrestrictedOps,
        isModuleEnabled: opts.isModuleEnabled,
        matrixLevel,
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

  const filtered = candidates.filter((t) => allowed.has(t));
  return isCreate
    ? intersectWithWritableAllowList(filtered, opts.writableJobTypes)
    : filtered;
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
