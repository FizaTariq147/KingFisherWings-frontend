import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShellSkeleton } from '@/components/skeletons/AppShellSkeleton'
import type { PermissionKey } from '@/types/auth.types'

// ── Flip to true ONLY when backend is not running locally ──────────────────
const DEV_BYPASS_AUTH = import.meta.env.DEV && false

interface ProtectedRouteProps {
  redirectTo?:           string
  requirePermissions?:   PermissionKey[]
  requireAnyPermission?: PermissionKey[]
  requireRole?:          string
}

export default function ProtectedRoute({
  redirectTo = '/login',
  requirePermissions,
  requireAnyPermission,
  requireRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasRole } = useAuth()
  const location = useLocation()

  if (DEV_BYPASS_AUTH) return <Outlet />

  if (isLoading) return <AppShellSkeleton />

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  const denied =
    (requirePermissions   && !hasPermission(...requirePermissions))      ||
    (requireAnyPermission && !hasAnyPermission(...requireAnyPermission)) ||
    (requireRole          && !hasRole(requireRole))

  if (denied) return <Navigate to="/403" replace />

  return <Outlet />
}