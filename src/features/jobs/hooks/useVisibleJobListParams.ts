import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  isOpsUnrestrictedRole,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';
import type { JobListParams } from '../types/job.types';
import { filterJobTypesByStaffAccess } from '../utils/filterJobTypesByStaffAccess';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';
import { resolveClientVisibleJobTypes } from '../utils/resolveClientVisibleJobTypes';
import { resolveStaffListJobTypes } from '../utils/resolveStaffListJobTypes';

export type VisibleJobListScope = {
  kind: 'unrestricted' | 'staff';
  /**
   * For `jobService.listVisibleJobs`:
   * - `null` → admin / unrestricted (plain GET /jobs, no typed fan-out)
   * - `JobType[]` → staff filter / probe set (may be empty when uncertain — do NOT hard-empty)
   */
  scopeTypes: JobType[] | null;
  /**
   * When true, listVisibleJobs may client-filter plain rows to scopeTypes.
   * False when JWT only has operations_scope / empty /me tokens.
   */
  scopeConfident: boolean;
  /** Typed fan-out + search recovery targets (sidebar-aligned; never full JOB_TYPES). */
  probeTypes: JobType[];
  /** Resolved staff allow-list for client filters / UI; undefined for admin. */
  jobTypes?: JobType[];
  /**
   * Spread into GET /jobs — always empty for default all-jobs / dashboard.
   * Department UIs should client-filter, not send job_type.
   */
  listScopeParams: Pick<JobListParams, 'job_types' | 'job_type'>;
};

function intersectCandidates(
  types: readonly JobType[],
  candidates?: readonly JobType[],
): JobType[] {
  if (!candidates?.length) return [...types];
  const allow = new Set(candidates);
  return types.filter((t) => allow.has(t));
}

/**
 * Default list/dashboard API scope.
 * Admin: omit job_type.
 * Staff: prefer /me visible∪writable + direct operations_{type}.*; if those are empty,
 * fall back to the same sidebar dept access matrix (not the full JOB_TYPES catalog).
 * Never send job_type on the default request.
 *
 * --- Staff “Total Jobs OK / grids empty” ---
 * Counts use GET /jobs/dashboard-counts; grids use GET /jobs. When JWT has
 * operations_scope without concrete operations_{type}.see|read|write (or frozen
 * grants disagree with DB), list can return empty while job_count is correct.
 *
 * Admin must grant for each department staff should see, then staff re-login:
 * 1. Matrix: operations_{dept} / operations_sea_fcl_export (etc.) see|read|write
 * 2. Persist visible_job_types (+ writable_job_types if they create) — not only
 *    a role pack + bare operations_scope
 * 3. Avoid a role pack that includes every operations_* type (shows all depts)
 * 4. Confirm /auth/me shows those codes after re-login
 *
 * Permanent BE fix (not in this repo): resolveVisibleJobTypes(tx, tenantId,
 * userId, role) on each request for findAll, dashboard-counts, search,
 * documentation, shipments — return meta.visible_job_types (null = admin) and
 * keep meta.total === job_count for the same job_type + branch_id.
 */
export function useVisibleJobListScope(
  opts?: {
    /** Limit resolve to a department segment (Sea Export, Air Import, …). */
    candidates?: readonly JobType[];
  },
): VisibleJobListScope {
  const { user, hasRole, hasEnabledModule } = useAuth();
  const candidates = opts?.candidates;
  const roleSlug = resolveAuthRoleSlug(user?.role);
  const isTenantAdmin =
    isTenantUserManagerRole(roleSlug) ||
    TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => hasRole(s));

  return useMemo(() => {
    if (isOpsUnrestrictedUser(user)) {
      return {
        kind: 'unrestricted' as const,
        scopeTypes: null,
        scopeConfident: true,
        probeTypes: [],
        listScopeParams: {},
      };
    }

    const perms = user?.permissions ?? [];
    const visible = user?.visibleJobTypes;
    const writable = user?.writableJobTypes;

    const client = resolveClientVisibleJobTypes({
      isUnrestricted: false,
      permissions: perms,
      visibleJobTypes: visible,
      writableJobTypes: writable,
    });

    // Prefer resolver that mirrors BE: scope → direct only; else role/matrix preset.
    const fromResolver = resolveStaffListJobTypes({
      permissions: perms,
      visibleJobTypes: visible,
      writableJobTypes: writable,
      isModuleEnabled: hasEnabledModule,
      ...(candidates?.length ? { candidates } : {}),
    });

    // Same source as Sidebar when /me tokens are empty under operations_scope.
    const fromSidebar = filterJobTypesByStaffAccess({
      permissions: perms,
      visibleJobTypes: visible,
      writableJobTypes: writable,
      unrestrictedOps: false,
      isTenantAdmin: isTenantAdmin || isOpsUnrestrictedRole(roleSlug),
      isModuleEnabled: hasEnabledModule,
      candidates: candidates?.length ? candidates : JOB_TYPE_WIZARD_OPTIONS,
      mode: 'list',
    });

    const probeTypes = intersectCandidates(
      fromResolver.length ? fromResolver : fromSidebar,
      candidates,
    );

    const meHasTokens =
      (Array.isArray(visible) && visible.length > 0) ||
      (Array.isArray(writable) && writable.length > 0);
    const hasDirectOpsTypes =
      client.hasOperationsScope && (client.types?.length ?? 0) > 0;
    const scopeConfident = meHasTokens || hasDirectOpsTypes;

    return {
      kind: 'staff' as const,
      jobTypes: probeTypes,
      scopeTypes: probeTypes,
      scopeConfident,
      probeTypes,
      listScopeParams: {},
    };
  }, [
    user,
    user?.unrestrictedOps,
    user?.role,
    user?.permissions,
    user?.visibleJobTypes,
    user?.writableJobTypes,
    candidates,
    hasEnabledModule,
    isTenantAdmin,
    roleSlug,
  ]);
}
