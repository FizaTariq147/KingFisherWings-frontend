import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FooterStatusBar } from './FooterStatusBar';
import { useApplyTheme } from '../../hooks/useApplyTheme';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';
import { OnboardingSteps } from '@/features/platform/components/OnboardingSteps';
import { AppMotionStyles, AppPageTransition } from '@/components/motion';

export function AppShell({ title }: { title: string }) {
  useApplyTheme();
  const user = useAuthStore((s) => s.user);
  const isSuperAdminAuthenticated = useSuperAdminAuthStore((s) => s.isAuthenticated);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const location = useLocation();
  const isSuperAdminArea =
    location.pathname.startsWith('/superadmin') && !location.pathname.includes('/login');

  const footerUserLabel = isSuperAdminArea
    ? isSuperAdminAuthenticated
      ? 'Superadmin'
      : 'Not signed in'
    : (user?.email ?? 'Not signed in');

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        closeMobileSidebar();
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [closeMobileSidebar]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex h-[100dvh] bg-[var(--color-neutral-50)] overflow-hidden">
      <AppMotionStyles />
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="fixed inset-0 bg-black/40 app-mobile-backdrop"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          />
          <div className="relative z-10 h-full shadow-xl app-mobile-drawer">
            <Sidebar mobile onNavigate={closeMobileSidebar} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {isSuperAdminArea && (
            <div className="mb-4">
              <OnboardingSteps />
            </div>
          )}
          <AppPageTransition />
        </main>
        <FooterStatusBar
          info={{
            userEmail: footerUserLabel,
            timestamp: new Date().toLocaleString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            poweredBy: title,
          }}
        />
      </div>
    </div>
  );
}
