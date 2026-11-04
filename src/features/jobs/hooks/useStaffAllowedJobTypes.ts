import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  isOpsUnrestrictedRole,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';
import { filterJobTypesByStaffAccess } from '../utils/filterJobTypesByStaffAccess';
import { isOpsUnrestrictedUser } from '../utils/isOpsUnrestrictedUser';

export type StaffJobTypeAccessMode = 'list' | 'create';

/**
 * Job types the current user may see (list) or create — matrix + /auth/me scopes.
 * Create mode prefers `writable_job_types` and requires write-level matrix grants.
 * Tenant admin / branch manager are unrestricted for list (create still uses write when set).
 */
export function useStaffAllowedJobTypes(
  candidates: readonly JobType[] = JOB_TYPE_WIZARD_OPTIONS,
  mode: StaffJobTypeAccessMode = 'list',
): JobType[] {
  const { user, hasRole, hasEnabledModule } = useAuth();
  const roleSlug = resolveAuthRoleSlug(user?.role);
  const isTenantAdmin =
    isTenantUserManagerRole(roleSlug) ||
    TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => hasRole(s));
  const opsUnrestricted =
    isOpsUnrestrictedUser(user) ||
    isOpsUnrestrictedRole(roleSlug) ||
    TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => hasRole(s));

  return useMemo(
    () =>
      filterJobTypesByStaffAccess({
        permissions: user?.permissions ?? [],
        visibleJobTypes: user?.visibleJobTypes,
        writableJobTypes: user?.writableJobTypes,
        unrestrictedOps: opsUnrestricted || user?.unrestrictedOps,
        isTenantAdmin: isTenantAdmin || isOpsUnrestrictedRole(roleSlug),
        isModuleEnabled: hasEnabledModule,
        candidates,
        mode,
      }),
    [
      user?.permissions,
      user?.visibleJobTypes,
      user?.writableJobTypes,
      user?.unrestrictedOps,
      opsUnrestricted,
      isTenantAdmin,
      roleSlug,
      hasEnabledModule,
      candidates,
      mode,
    ],
  );
}
