import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { permissionsFromAccessToken } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { isTenantUserManagerRole } from '@/features/users/constants/userPermissions';
import {
  NVOCC_MANAGE_DENIED_MESSAGE,
  NVOCC_MANAGE_PERMISSION,
  NVOCC_MANAGE_TENANT_ADMIN_MESSAGE,
} from '../utils/nvoccPermissions';

export function useNvoccPermissions() {
  const { user } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMemo(() => {
    const jwtPerms = permissionsFromAccessToken(accessToken);
    const roleSlug = user?.role.slug || user?.role.name || '';
    const isTenantAdmin = isTenantUserManagerRole(roleSlug);
    const canManage = jwtPerms.includes(NVOCC_MANAGE_PERMISSION);

    const manageHint = isTenantAdmin
      ? NVOCC_MANAGE_TENANT_ADMIN_MESSAGE
      : NVOCC_MANAGE_DENIED_MESSAGE;

    return {
      jwtPermissions: jwtPerms,
      isTenantAdmin,
      canManage,
      manageHint,
      missingManage: !canManage,
    };
  }, [user, accessToken]);
}
