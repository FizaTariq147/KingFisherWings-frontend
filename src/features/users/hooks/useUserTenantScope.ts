import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';

const USERS_BASE = '/admin/users';

/**
 * Tenant Admin user scope — tenant comes only from the ERP session (AuthContext / JWT).
 * There is no tenant picker; users are always created for this tenant.
 */
export function useUserTenantScope() {
  const { user, isAuthenticated } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const storeUser = useAuthStore((s) => s.user);

  const tenantId = useMemo(
    () =>
      resolveSessionTenantIdFromAuth({
        accessToken,
        user: {
          id: user?.id || storeUser?.id,
          role: user?.role?.slug || user?.role?.name || storeUser?.role,
          tenantId: user?.tenantId || storeUser?.tenantId,
        },
      }),
    [
      accessToken,
      user?.id,
      user?.role?.slug,
      user?.role?.name,
      user?.tenantId,
      storeUser?.id,
      storeUser?.role,
      storeUser?.tenantId,
    ],
  );

  const sessionScoped = Boolean(accessToken || isAuthenticated);

  const usersBasePath = useMemo(() => USERS_BASE, []);

  const userPath = useCallback((suffix = '') => `${USERS_BASE}${suffix}`, []);

  const setTenantId = useCallback((_id: string) => {
    // Tenant cannot be switched — users belong to the authenticated tenant only.
  }, []);

  return {
    tenantId,
    /** True when logged in even if JWT has no explicit tenant UUID (API scopes by Bearer). */
    sessionScoped,
    hasInvalidTenantParam: false,
    setTenantId,
    usersBasePath,
    userPath,
    isTenantAdminScope: true as const,
  };
}
