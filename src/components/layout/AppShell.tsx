import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FooterStatusBar } from './FooterStatusBar';
import { useApplyTheme } from '../../hooks/useApplyTheme';
import { useAuthStore } from '@/store/authStore';

export function AppShell({ title }: { title: string }) {
  useApplyTheme();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-[var(--color-neutral-50)] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar {...({ title } as any)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <FooterStatusBar
          info={{
            userEmail: user?.email ?? 'Not signed in',
            timestamp: new Date().toLocaleString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            poweredBy: title,
          }}
        />
      </div>
    </div>
  );
}