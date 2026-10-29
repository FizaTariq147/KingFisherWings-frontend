import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FullPageSpinner } from '@/components/skeletons/SkeletonPrimitives';
import { VENDOR_VERIFICATION_PATH } from '@/features/party-verification/api/partyVerification.api';
import {
  isVendorVerificationAllowlisted,
  vendorUserNeedsVerification,
} from '@/features/party-verification/utils/verificationAllowlist';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { isVendorApiUnavailable } from '@/features/vendor-shared/vendorUnavailable';
import { useIdleSessionLogout } from '@/hooks/useIdleSessionLogout';
import { VENDOR_CHANGE_PASSWORD_PATH } from '../api/vendorAuth.api';
import { useVendorAuthBootstrap } from '../hooks/useVendorAuthBootstrap';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export function VendorProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ready, accessToken } = useVendorAuthBootstrap();
  const logout = useVendorAuthStore((s) => s.logout);
  const setUser = useVendorAuthStore((s) => s.setUser);
  const user = useVendorAuthStore((s) => s.user);
  const mustChangePassword = Boolean(user?.mustChangePassword);
  const needsVerification = vendorUserNeedsVerification(user);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  const logoutDueToIdle = useCallback(() => {
    void (async () => {
      try {
        await vendorAuthService.logout();
      } catch {
        /* still clear local session */
      } finally {
        logout();
        clearVendorQueryCache();
        navigate('/vendor/login', {
          replace: true,
          state: { reason: 'idle' },
        });
      }
    })();
  }, [logout, navigate]);

  useIdleSessionLogout({
    enabled: Boolean(accessToken) && sessionOk === true,
    onIdle: logoutDueToIdle,
  });

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
          // Soft-allow only in local DEV when vendor /me is stubbed (404/501).
          if (
            import.meta.env.DEV &&
            isVendorApiUnavailable(err) &&
            useVendorAuthStore.getState().user
          ) {
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

  // Temporary-password users must set their own password before using the vendor portal.
  if (mustChangePassword && location.pathname !== VENDOR_CHANGE_PASSWORD_PATH) {
    return <Navigate to={VENDOR_CHANGE_PASSWORD_PATH} replace />;
  }

  if (needsVerification && !isVendorVerificationAllowlisted(location.pathname)) {
    return <Navigate to={VENDOR_VERIFICATION_PATH} replace />;
  }

  return <Outlet />;
}
