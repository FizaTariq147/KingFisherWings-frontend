import { Navigate, useLocation } from 'react-router-dom'

/**
 * `/settings` opens Organization (tenant profile / banks / number formats).
 * Users are managed by Tenant Admin at `/admin/users` only.
 */
export function SettingsRedirect() {
  return <Navigate to="/organization" replace />
}

/** Old `/settings/users/*` bookmarks → `/admin/users/*`. */
export function LegacySettingsUsersRedirect() {
  const location = useLocation()
  const suffix = location.pathname.replace(/^\/settings\/users/, '') || ''
  return <Navigate to={`/admin/users${suffix}${location.search}`} replace />
}
