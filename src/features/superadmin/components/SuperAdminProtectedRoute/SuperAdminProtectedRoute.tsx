// Uses the real superadmin auth store — not the tenant-facing useAuth.
// No role check needed: this store only ever holds a session if the person
// authenticated through the separate superadmin login flow in the first place.

import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { superAdminAuthService } from '@/features/superadmin/services/superAdminAuth.service';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';

export function SuperAdminProtectedRoute() {
  const isAuthenticated = useSuperAdminAuthStore((s) => s.isAuthenticated);
  const accessToken = useSuperAdminAuthStore((s) => s.accessToken);
  const refreshToken = useSuperAdminAuthStore((s) => s.refreshToken);
  const setTokens = useSuperAdminAuthStore((s) => s.setTokens);
  const logout = useSuperAdminAuthStore((s) => s.logout);
  const clearErpSession = useAuthStore((s) => s.clearSession);
  const [restoring, setRestoring] = useState(Boolean(refreshToken && !accessToken));

  useEffect(() => {
    if (isAuthenticated) clearErpSession();
  }, [isAuthenticated, clearErpSession]);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!refreshToken || accessToken) {
        setRestoring(false);
        return;
      }
      setRestoring(true);
      try {
        const pair = await superAdminAuthService.refresh(refreshToken);
        if (cancelled) return;
        setTokens(pair.access_token, pair.refresh_token || refreshToken);
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setRestoring(false);
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, setTokens, logout]);

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Restoring Super Admin session…
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/superadmin/login" replace />;
  }

  return <Outlet />;
}
