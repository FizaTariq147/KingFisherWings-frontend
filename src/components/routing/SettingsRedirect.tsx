import { Navigate, useLocation } from 'react-router-dom';

/** Old `/settings/users/*` bookmarks → `/admin/users/*`. */
export function LegacySettingsUsersRedirect() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/settings\/users/, '') || '';
  return <Navigate to={`/admin/users${suffix}${location.search}`} replace />;
}
