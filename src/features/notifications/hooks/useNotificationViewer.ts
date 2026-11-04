import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';
import type { NotificationViewerContext } from '../utils/notificationAudience';

/** Current session as a notification audience viewer (admin vs staff grants). */
export function useNotificationViewer(): NotificationViewerContext {
  const { user, hasPermission, hasAnyPermission, hasMatrixModule, hasEnabledModule } = useAuth();
  const roleSlug = resolveAuthRoleSlug(user?.role);

  return useMemo<NotificationViewerContext>(
    () => ({
      userId: user?.id,
      roleSlug,
      isTenantManager: isTenantUserManagerRole(roleSlug),
      permissions: user?.permissions ?? [],
      hasPermission: (...keys) =>
        keys.length <= 1 ? hasPermission(...keys) : hasAnyPermission(...keys),
      hasMatrixModule: (moduleKey) => hasMatrixModule(moduleKey),
      hasEnabledModule,
    }),
    [
      user?.id,
      user?.permissions,
      roleSlug,
      hasPermission,
      hasAnyPermission,
      hasMatrixModule,
      hasEnabledModule,
    ],
  );
}
