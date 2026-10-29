import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FullPageSpinner } from '@/components/skeletons/SkeletonPrimitives';
import { PORTAL_VERIFICATION_PATH } from '@/features/party-verification/api/partyVerification.api';
import {
  isPortalVerificationAllowlisted,
  portalUserNeedsVerification,
} from '@/features/party-verification/utils/verificationAllowlist';
import { clearPortalQueryCache } from '@/features/portal-shared/clearPortalQueryCache';
import { useIdleSessionLogout } from '@/hooks/useIdleSessionLogout';
import { usePortalAuthBootstrap } from '../../hooks/usePortalAuthBootstrap';
import { PORTAL_CHANGE_PASSWORD_PATH } from '../../api/portalAuth.api';
import { portalAuthService } from '../../services/portalAuth.service';
import { usePortalAuthStore } from '../../store/portalAuthStore';

/** Guards customer portal routes — requires a valid portal token + /me check. */
export function PortalProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ready, accessToken } = usePortalAuthBootstrap();
  const logout = usePortalAuthStore((s) => s.logout);
  const setUser = usePortalAuthStore((s) => s.setUser);
  const user = usePortalAuthStore((s) => s.user);
  const mustChangePassword = Boolean(user?.mustChangePassword);
  const needsVerification = portalUserNeedsVerification(user);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  const logoutDueToIdle = useCallback(() => {
    void (async () => {
      try {
        await portalAuthService.logout();
      } catch {
        /* still clear local session */
      } finally {
        logout();
        clearPortalQueryCache();
        navigate('/portal/login', {
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
        const me = await portalAuthService.me();
        if (!cancelled) {
          setUser(me);
          setSessionOk(true);
        }
      } catch {
        if (!cancelled) {
          clearPortalQueryCache();
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

  // Temporary-password users must set their own password before using the portal.
  if (mustChangePassword && location.pathname !== PORTAL_CHANGE_PASSWORD_PATH) {
    return <Navigate to={PORTAL_CHANGE_PASSWORD_PATH} replace />;
  }

  // Party KYC gate — VAT + license must be approved before quotes/bookings (1A/2B).
  if (
    needsVerification &&
    !isPortalVerificationAllowlisted(location.pathname)
  ) {
    return <Navigate to={PORTAL_VERIFICATION_PATH} replace />;
  }

  return <Outlet />;
}
