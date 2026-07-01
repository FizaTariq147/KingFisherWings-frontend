import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { PermissionKey } from '@/types/auth.types'

interface ProtectedRouteProps {
  /** Redirect to this path if not authenticated. Defaults to /login */
  redirectTo?: string
  /** All of these permissions must be present — renders 403 if not */
  requirePermissions?: PermissionKey[]
  /** Any one of these permissions must be present — renders 403 if not */
  requireAnyPermission?: PermissionKey[]
  /** Role slug must match — renders 403 if not */
  requireRole?: string
}

export default function ProtectedRoute({
  redirectTo = '/login',
  requirePermissions,
  requireAnyPermission,
  requireRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasRole } = useAuth()
  const location = useLocation()

  // ── Auth loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-neutral-50)]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }}
            aria-label="Loading"
            role="status"
          />
          <span className="text-xs text-[var(--color-neutral-400)]">Verifying session…</span>
        </div>
      </div>
    )
  }

  // ── Not authenticated — redirect to login preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // ── Permission checks ──────────────────────────────────────────────────
  const permissionDenied =
    (requirePermissions && !hasPermission(...requirePermissions)) ||
    (requireAnyPermission && !hasAnyPermission(...requireAnyPermission)) ||
    (requireRole && !hasRole(requireRole))

  if (permissionDenied) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}