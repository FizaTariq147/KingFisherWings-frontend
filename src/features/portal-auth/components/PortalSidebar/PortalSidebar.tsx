import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ClipboardList, Package, Route, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { usePortalBrand } from '../../hooks/usePortalBrand';
import { usePortalAuthStore } from '../../store/portalAuthStore';

type PortalSidebarProps = {
  onLogout: () => void;
  unreadCount?: number;
};

const NAV = [
  { label: 'Dashboard', to: '/portal', Icon: ClipboardList },
  { label: 'Book', to: '/portal/book', Icon: BookOpen },
  { label: 'Track', to: '/portal/track', Icon: Route },
  { label: 'Shipments', to: '/portal/shipments', Icon: Package },
  { label: 'Quotes', to: '/portal/quotes', Icon: Bell },
  { label: 'Alerts', to: '/portal/alerts', Icon: Bell },
  { label: 'Account', to: '/portal/account', Icon: User },
] as const;

export function PortalSidebar({ onLogout, unreadCount = 0 }: PortalSidebarProps) {
  const navigate = useNavigate();
  const user = usePortalAuthStore((s) => s.user);
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const { companyName, portalLabel, companyInitial } = usePortalBrand();
  const firstLetter = (user?.fullName || user?.email || 'G').charAt(0).toUpperCase();

  const linkClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 py-2.5 text-sm font-medium transition-colors border-l-[3px] border-transparent pl-[18px] pr-4',
      isActive
        ? 'bg-white/10 text-white font-medium border-l-[var(--color-secondary)]'
        : 'text-white/80 hover:text-white hover:bg-white/5',
    );

  return (
    <aside
      className="hidden lg:flex lg:w-[250px] shrink-0 flex-col"
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-sidebar-text-muted)]">
          {companyName}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center">
            <span className="font-bold text-sm text-white">{companyInitial}</span>
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{portalLabel}</div>
            <div className="text-xs text-[var(--color-sidebar-text-muted)] leading-tight truncate max-w-[170px]">
              {companyName}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2.5" aria-label="Customer portal navigation">
        <div className="space-y-0.5">
          {NAV.map(({ label, to, Icon }) => (
            <NavLink key={to} to={to} end={to === '/portal'} className={({ isActive }) => linkClass(isActive)}>
              <Icon size={18} className="shrink-0 opacity-90" aria-hidden="true" />
              <span className="truncate">{label}</span>
              {label === 'Alerts' && unreadCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center min-w-6 h-5 px-1 rounded-full bg-[var(--color-secondary)] text-white text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">{firstLetter}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {user?.fullName || user?.email || 'Guest'}
                </div>
                <div className="text-xs text-[var(--color-sidebar-text-muted)] truncate">
                  {user?.party?.name || portalLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-[var(--color-sidebar-text-muted)]">EN</div>
            {accessToken ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={onLogout}
              >
                Log out
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/portal/login')}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
