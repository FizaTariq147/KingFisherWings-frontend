import { Outlet, useNavigate } from 'react-router-dom';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { portalAuthService } from '../services/portalAuth.service';
import { PortalSidebar } from '../components/PortalSidebar/PortalSidebar';
import { usePortalAuthStore } from '../store/portalAuthStore';

/** Minimal customer portal chrome — auth only for this phase. */
export function PortalShell() {
  useApplyTheme();
  const navigate = useNavigate();
  const unreadCount = 0;
  const logoutStore = usePortalAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await portalAuthService.logout();
    } catch {
      /* still clear local session */
    } finally {
      logoutStore();
      navigate('/portal', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex">
      <PortalSidebar onLogout={() => void handleLogout()} unreadCount={unreadCount} />
      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-[1180px] px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
