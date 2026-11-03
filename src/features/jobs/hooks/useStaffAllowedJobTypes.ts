import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';
import { filterJobTypesByStaffAccess } from '../utils/filterJobTypesByStaffAccess';

/**
 * Job types the current user may see/create — same matrix + enabled-module rules as the sidebar.
 */
export function useStaffAllowedJobTypes(
  candidates: readonly JobType[] = JOB_TYPE_WIZARD_OPTIONS,
): JobType[] {
  const { user, hasRole, hasEnabledModule } = useAuth();
  const roleSlug = resolveAuthRoleSlug(user?.role);
  const isTenantAdmin =
    isTenantUserManagerRole(roleSlug) ||
    TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => hasRole(s));

  return useMemo(
    () =>
      filterJobTypesByStaffAccess({
        permissions: user?.permissions ?? [],
        visibleJobTypes: user?.visibleJobTypes,
        unrestrictedOps: user?.unrestrictedOps,
        isTenantAdmin,
        isModuleEnabled: hasEnabledModule,
        candidates,
      }),
    [
      user?.permissions,
      user?.visibleJobTypes,
      user?.unrestrictedOps,
      isTenantAdmin,
      hasEnabledModule,
      candidates,
    ],
  );
}
