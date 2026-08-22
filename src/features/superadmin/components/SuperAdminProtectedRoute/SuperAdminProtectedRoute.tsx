// Uses the real superadmin auth store — not the tenant-facing useAuth.
// No role check needed: this store only ever holds a session if the person
// authenticated through the separate superadmin login flow in the first place.

import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';

export function SuperAdminProtectedRoute() {
  const isAuthenticated = useSuperAdminAuthStore((s) => s.isAuthenticated);
  const clearErpSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (isAuthenticated) clearErpSession();
  }, [isAuthenticated, clearErpSession]);

  if (!isAuthenticated) return <Navigate to="/superadmin/login" replace />;

  return <Outlet />;
}
