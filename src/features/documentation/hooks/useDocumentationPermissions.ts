import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { permissionsFromAccessToken } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { isTenantUserManagerRole } from '@/features/users/constants/userPermissions';
import {
  DOCUMENTATION_EDI_READ_DENIED_MESSAGE,
  DOCUMENTATION_EDI_READ_PERMISSION,
  DOCUMENTATION_EDI_READ_TENANT_ADMIN_MESSAGE,
  DOCUMENTATION_MANAGE_DENIED_MESSAGE,
  DOCUMENTATION_MANAGE_PERMISSION,
  DOCUMENTATION_READ_DENIED_MESSAGE,
  DOCUMENTATION_READ_PERMISSION,
  DOCUMENTATION_READ_TENANT_ADMIN_MESSAGE,
  hasDocumentationEdiRead,
  hasDocumentationManage,
  hasDocumentationRead,
} from '../utils/documentationPermissions';

export function useDocumentationPermissions() {
  const { user } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMemo(() => {
    const jwtPermissions = permissionsFromAccessToken(accessToken);
    const roleSlug = user?.role.slug || user?.role.name || '';
    const isTenantAdmin = isTenantUserManagerRole(roleSlug);
    const canRead = hasDocumentationRead({ permissions: jwtPermissions });
    const canReadEdi = hasDocumentationEdiRead({ permissions: jwtPermissions });
    const canManage = hasDocumentationManage({
      permissions: jwtPermissions,
      roleSlug,
      role: user?.role,
    });

    const readHint = isTenantAdmin
      ? DOCUMENTATION_READ_TENANT_ADMIN_MESSAGE
      : DOCUMENTATION_READ_DENIED_MESSAGE;

    const ediReadHint = isTenantAdmin
      ? DOCUMENTATION_EDI_READ_TENANT_ADMIN_MESSAGE
      : DOCUMENTATION_EDI_READ_DENIED_MESSAGE;

    const manageHint = isTenantAdmin
      ? `${DOCUMENTATION_MANAGE_DENIED_MESSAGE} (Super Admin → Tenants → Sync permissions.)`
      : DOCUMENTATION_MANAGE_DENIED_MESSAGE;

    return {
      jwtPermissions,
      isTenantAdmin,
      canRead,
      canReadEdi,
      canManage,
      missingRead: !canRead,
      missingEdiRead: !canReadEdi,
      missingManage: canRead && !canManage,
      readHint,
      ediReadHint,
      manageHint,
      hasReadInToken: jwtPermissions.includes(DOCUMENTATION_READ_PERMISSION),
      hasEdiReadInToken: jwtPermissions.includes(DOCUMENTATION_EDI_READ_PERMISSION),
      hasManageInToken: jwtPermissions.includes(DOCUMENTATION_MANAGE_PERMISSION),
    };
  }, [user, accessToken]);
}
