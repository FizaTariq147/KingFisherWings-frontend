import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '@/components/skeletons/SkeletonPrimitives';
import { usePortalAuthBootstrap } from '../../hooks/usePortalAuthBootstrap';
import { portalAuthService } from '../../services/portalAuth.service';
import { usePortalAuthStore } from '../../store/portalAuthStore';

/** Guards customer portal routes — requires a valid portal token + /me check. */
export function PortalProtectedRoute() {
  const location = useLocation();
  const { ready, accessToken } = usePortalAuthBootstrap();
  const logout = usePortalAuthStore((s) => s.logout);
  const setUser = usePortalAuthStore((s) => s.setUser);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!accessToken) {
      setSessionOk(false);
      return;
    }

    let cancelled = false;
    setSessionOk(null);

    void (async () => {
      try {
        const me = await portalAuthService.me();
        if (!cancelled) {
          setUser(me);
          setSessionOk(true);
        }
      } catch {
        if (!cancelled) {
          logout();
          setSessionOk(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, accessToken, logout, setUser]);

  if (!ready) {
    return <FullPageSpinner message="Checking portal session…" />;
  }

  if (!accessToken || sessionOk === false) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (sessionOk !== true) {
    return <FullPageSpinner message="Checking portal session…" />;
  }

  return <Outlet />;
}
