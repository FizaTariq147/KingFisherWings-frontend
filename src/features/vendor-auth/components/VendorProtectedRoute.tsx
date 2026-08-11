import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '@/components/skeletons/SkeletonPrimitives';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { isVendorApiUnavailable } from '@/features/vendor-shared/vendorUnavailable';
import { useVendorAuthBootstrap } from '../hooks/useVendorAuthBootstrap';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export function VendorProtectedRoute() {
  const location = useLocation();
  const { ready, accessToken } = useVendorAuthBootstrap();
  const logout = useVendorAuthStore((s) => s.logout);
  const setUser = useVendorAuthStore((s) => s.setUser);
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
        const me = await vendorAuthService.me();
        if (!cancelled) {
          setUser(me);
          setSessionOk(true);
        }
      } catch (err) {
        if (!cancelled) {
          if (isVendorApiUnavailable(err) && useVendorAuthStore.getState().user) {
            setSessionOk(true);
            return;
          }
          clearVendorQueryCache();
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
    return <FullPageSpinner message="Checking vendor session…" />;
  }

  if (!accessToken || sessionOk === false) {
    return <Navigate to="/vendor/login" state={{ from: location }} replace />;
  }

  if (sessionOk !== true) {
    return <FullPageSpinner message="Checking vendor session…" />;
  }

  return <Outlet />;
}
