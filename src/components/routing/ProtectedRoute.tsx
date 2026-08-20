import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShellSkeleton } from '@/components/skeletons/AppShellSkeleton'
import { useAuthStore } from '@/store/authStore'
import { isTenantUserManagerRole } from '@/features/users/constants/userPermissions'
import type { PermissionKey } from '@/types/auth.types'

const CHANGE_PASSWORD_PATH = '/change-password'
const TWO_FACTOR_PATH = '/settings/two-factor'

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
  const storeUser = useAuthStore((s) => s.user)
  const mustChangePassword = Boolean(storeUser?.mustChangePassword)
  const location = useLocation()

  // ── Auth still resolving — show full shell skeleton so layout doesn't flash
  if (isLoading) {
    return <AppShellSkeleton />
  }

  // ── Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Staff with a temporary password must set their own before using the app.
  if (mustChangePassword && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />
  }

  // Tenant Admin must enroll TOTP 2FA before using the rest of the ERP.
  const isTenantAdmin = isTenantUserManagerRole(storeUser?.role)
  if (
    isTenantAdmin &&
    !storeUser?.twoFactorEnabled &&
    location.pathname !== TWO_FACTOR_PATH &&
    location.pathname !== CHANGE_PASSWORD_PATH
  ) {
    return <Navigate to={TWO_FACTOR_PATH} replace />
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
