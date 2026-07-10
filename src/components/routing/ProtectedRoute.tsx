import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShellSkeleton } from '@/components/skeletons/AppShellSkeleton'
import type { PermissionKey } from '@/types/auth.types'

interface ProtectedRouteProps {
  redirectTo?:           string
  requirePermissions?:   PermissionKey[]
  requireAnyPermission?: PermissionKey[]
  requireRole?:          string
  /** Pass if any of these role slugs is enough (e.g. admin | tenant_admin). */
  requireAnyRole?:       string[]
}

export default function ProtectedRoute({
  redirectTo = '/login',
  requirePermissions,
  requireAnyPermission,
  requireRole,
  requireAnyRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasRole } = useAuth()
  const location = useLocation()

  // ── Auth still resolving — show full shell skeleton so layout doesn't flash
  if (isLoading) {
    return <AppShellSkeleton />
  }

  // ── Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  const roleDenied = requireAnyRole
    ? !requireAnyRole.some((slug) => hasRole(slug))
    : requireRole
      ? !hasRole(requireRole)
      : false

  // ── Permission / role check
  const denied =
    (requirePermissions   && !hasPermission(...requirePermissions))   ||
    (requireAnyPermission && !hasAnyPermission(...requireAnyPermission)) ||
    roleDenied

  if (denied) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}