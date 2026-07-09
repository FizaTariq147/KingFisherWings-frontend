// PASTE THIS AT: src/features/superadmin/components/SuperAdminProtectedRoute/SuperAdminProtectedRoute.tsx
//
// Uses the real superadmin auth store — not the tenant-facing useAuth.
// No role check needed: this store only ever holds a session if the person
// authenticated through the separate superadmin login flow in the first place.

import { Navigate, Outlet } from 'react-router-dom';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';

export function SuperAdminProtectedRoute() {
  const isAuthenticated = useSuperAdminAuthStore((s) => s.isAuthenticated);

  // ASSUMPTION: redirect target — confirm your actual superadmin login route
  if (!isAuthenticated) return <Navigate to="/superadmin/login" replace />;

  return <Outlet />;
}