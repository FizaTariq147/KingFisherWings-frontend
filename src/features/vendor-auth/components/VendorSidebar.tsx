import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalAutoAnimate } from '@/features/portal-auth/components/portal-ui';
import { useVendorBrand } from '../hooks/useVendorBrand';
import { VENDOR_NAV } from '../nav';
import { useVendorAuthStore } from '../store/vendorAuthStore';

type VendorSidebarProps = {
  onLogout: () => void;
};

export function VendorSidebar({ onLogout }: VendorSidebarProps) {
  const user = useVendorAuthStore((s) => s.user);
  const { companyName, portalLabel, companyInitial } = useVendorBrand();
  const firstLetter = (user?.fullName || user?.email || 'V').charAt(0).toUpperCase();
  const [navRef] = usePortalAutoAnimate();

  const linkClass = (isActive: boolean) =>
    cn(
      'relative group flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-200 pl-[18px] pr-4',
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-white/75 hover:text-white hover:bg-white/5 hover:translate-x-0.5',
    );

  return (
    <aside
      className="hidden lg:flex lg:w-[268px] shrink-0 sticky top-0 h-screen max-h-screen flex-col overflow-hidden"
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      <div className="px-5 py-6 border-b border-white/10 portal-page-enter">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-700)] flex items-center justify-center shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105">
              <span className="font-bold text-base text-white">{companyInitial}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--color-sidebar-text-muted)]">
              {portalLabel}
            </div>
            <div
              className="mt-0.5 text-sm font-semibold leading-snug text-white break-words whitespace-normal"
              title={companyName}
            >
              {companyName}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto py-3 scrollbar-none" aria-label="Vendor portal navigation">
        <p className="px-[18px] pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Accounts payable
        </p>
        <div ref={navRef} className="space-y-0.5 portal-nav-stagger">
          {VENDOR_NAV.map(({ label, to, Icon }) => (
            <div key={to}>
              <NavLink to={to} end={to === '/vendor'} className={({ isActive }) => linkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        className="absolute inset-y-0 left-0 w-[3px] rounded-r bg-[var(--color-secondary)] transition-all duration-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon
                      size={18}
                      className="shrink-0 opacity-90 transition-transform duration-200 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </div>
          ))}
        </div>
      </nav>

      <div className="px-4 pb-5 shrink-0">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm portal-page-enter">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 ring-1 ring-[var(--color-secondary)]/40 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{firstLetter}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate text-white">
                {user?.fullName || user?.email || 'Vendor'}
              </div>
              <div className="text-xs text-[var(--color-sidebar-text-muted)] truncate">
                {user?.party?.name || portalLabel}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            <LogOut size={14} aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
