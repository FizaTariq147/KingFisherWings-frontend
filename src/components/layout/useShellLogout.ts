import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';
import { superAdminAuthService } from '@/features/superadmin/services/superAdminAuth.service';

export function useShellLogout(onAfterLogout?: () => void) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const superAdminLogout = useSuperAdminAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const isSuperAdminArea =
    location.pathname.startsWith('/superadmin') && !location.pathname.includes('/login');

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      if (isSuperAdminArea) {
        try {
          await superAdminAuthService.logout();
        } catch {
          // clear local session regardless
        } finally {
          superAdminLogout();
          navigate('/superadmin/login', { replace: true });
        }
        onAfterLogout?.();
        return;
      }
      await logout();
      onAfterLogout?.();
    } finally {
      setLoggingOut(false);
    }
  };

  return { handleLogout, loggingOut, isSuperAdminArea };
}
