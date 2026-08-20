import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Settings,
  UserCircle,
  KeyRound,
  Shield,
  ChevronDown,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';
import { GlobalSearch } from '@/features/search/components/GlobalSearch';
import { useNotificationUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useShellLogout } from './useShellLogout';

interface TopbarProps {
  onLogout?: () => void;
}

export function Topbar({ onLogout }: TopbarProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSuperAdminAuthenticated = useSuperAdminAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { handleLogout, loggingOut } = useShellLogout(onLogout);

  const isSuperAdminArea =
    location.pathname.startsWith('/superadmin') && !location.pathname.includes('/login');

  const unread = useNotificationUnreadCount();
  const notificationCount = unread.data ?? 0;

  const canChangePassword = isAuthenticated && Boolean(user) && !isSuperAdminArea;
  const passwordLabel = isTenantUserManagerRole(resolveAuthRoleSlug(user?.role))
    ? 'Tenant password'
    : 'Password';

  const handleMenuClick = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      openMobileSidebar();
      return;
    }
    toggleSidebar();
  };

  const onLogoutClick = () => {
    if (onLogout) {
      void handleLogout();
      return;
    }
    void handleLogout();
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-neutral-200)] bg-white px-3 sm:px-4 md:h-16">
      <button
        type="button"
        onClick={handleMenuClick}
        aria-label="Toggle navigation"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
      >
        <Menu size={20} />
      </button>

      {isAuthenticated && !isSuperAdminArea ? (
        <div className="hidden min-w-0 flex-1 md:block">
          <GlobalSearch variant="inline" />
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-neutral-800)]">
            {isSuperAdminArea ? 'KingFisher Platform Console' : 'KingFisher Wings LLC'}
          </p>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {isAuthenticated && !isSuperAdminArea ? (
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
          >
            <Bell size={18} />
            {notificationCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[10px] font-bold text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            ) : null}
          </Link>
        ) : null}

        <div ref={settingsRef} className="relative">
          <button
            type="button"
            aria-label="Settings menu"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
          >
            <Settings size={18} />
          </button>
          {settingsOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close settings menu"
                onClick={() => setSettingsOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white py-1 shadow-lg">
                {!isSuperAdminArea && isAuthenticated ? (
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <Settings size={15} />
                    Settings
                  </Link>
                ) : null}
                {canChangePassword ? (
                  <Link
                    to="/change-password"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <KeyRound size={15} />
                    {passwordLabel}
                  </Link>
                ) : null}
                {isAuthenticated ? (
                  <Link
                    to="/settings/sessions"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <Shield size={15} />
                    Sessions
                  </Link>
                ) : null}
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => {
                    setSettingsOpen(false);
                    onLogoutClick();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)] disabled:opacity-60"
                >
                  {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                  {loggingOut ? 'Signing out…' : 'Log out'}
                </button>
              </div>
            </>
          ) : null}
        </div>

        {isSuperAdminArea && isSuperAdminAuthenticated ? (
          <span
            className="hidden items-center gap-1.5 rounded-full bg-[var(--color-neutral-50)] px-3 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] md:inline-flex"
            title="Superadmin"
          >
            <UserCircle size={16} />
            Superadmin
          </span>
        ) : null}

        {!isSuperAdminArea && isAuthenticated ? (
          <Link
            to="/profile"
            className={cn(
              'hidden items-center gap-2 rounded-full bg-[var(--color-neutral-50)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] sm:inline-flex',
            )}
            title="My profile"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-semibold text-white">
              {(user?.name ?? 'U')[0]?.toUpperCase()}
            </span>
            <span className="max-w-[8rem] truncate">{user?.name ?? 'User'}</span>
            <ChevronDown size={12} className="text-[var(--color-neutral-400)]" />
          </Link>
        ) : null}

        {isAuthenticated && !isSuperAdminArea ? (
          <div className="md:hidden">
            <GlobalSearch variant="compact" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
