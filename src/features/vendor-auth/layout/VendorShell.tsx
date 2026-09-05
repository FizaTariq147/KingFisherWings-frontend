import { useEffect, useState, type CSSProperties } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
import {
  PortalPageTransition,
  portalAnimationStyles,
  usePortalAutoAnimate,
} from '@/features/portal-auth/components/portal-ui';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { useVendorNotificationUnreadCount } from '@/features/vendor-notifications/hooks/useVendorNotifications';
import { VendorSidebar } from '../components/VendorSidebar';
import { VendorTopbar } from '../components/VendorTopbar';
import { useVendorBrand } from '../hooks/useVendorBrand';
import { VENDOR_NAV_SECTIONS } from '../nav';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export function VendorShell() {
  useApplyTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavRef] = usePortalAutoAnimate();
  const logoutStore = useVendorAuthStore((s) => s.logout);
  const { companyName, portalLabel } = useVendorBrand();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const unread = useVendorNotificationUnreadCount();
  const notificationCount = unread.data ?? 0;

  const handleMenuClick = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setMobileOpen((v) => !v);
      return;
    }
    setSidebarCollapsed((v) => !v);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await vendorAuthService.logout();
    } catch {
      /* still clear local session */
    } finally {
      logoutStore();
      clearVendorQueryCache();
      navigate('/vendor/login', { replace: true });
    }
  };

  return (
    <div className="portal-shell flex min-h-screen bg-[#F4F7F9]">
      <style>{portalAnimationStyles}</style>

      <VendorSidebar onLogout={() => void handleLogout()} collapsed={sidebarCollapsed} />

      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <VendorTopbar notificationCount={notificationCount} onMenuClick={handleMenuClick} />

        {mobileOpen ? (
          <div className="lg:hidden fixed inset-0 z-40">
            <button
              type="button"
              className="portal-mobile-backdrop absolute inset-0 bg-[var(--color-primary-900)]/45"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <div className="portal-mobile-drawer absolute right-0 top-0 flex h-full w-[min(320px,88vw)] flex-col bg-[var(--color-sidebar-bg)] text-white shadow-xl">
              <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-4">
                <div className="flex min-w-0 flex-1 items-start gap-3 pr-2">
                  <img
                    src={logo}
                    alt="KingFisher Wings"
                    className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      {portalLabel}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-semibold">{companyName}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md p-2 hover:bg-white/10"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <nav ref={mobileNavRef} className="flex-1 overflow-y-auto py-3" aria-label="Mobile vendor navigation">
                {VENDOR_NAV_SECTIONS.map((section) => (
                  <div key={section.id} className="mb-2">
                    <div className="mx-4 mb-1.5 mt-2.5 flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: section.color }}
                        aria-hidden="true"
                      />
                      <p
                        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: section.color }}
                      >
                        {section.title}
                      </p>
                      <div className="h-px min-w-0 flex-1" style={{ backgroundColor: section.color }} />
                    </div>
                    {section.items.map(({ label, to, Icon, iconStyle }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={to === '/vendor'}
                        className={({ isActive }) =>
                          cn(
                            'mx-2 flex items-center gap-2.5 rounded-lg border-l-[3px] py-2 pl-2.5 pr-3 text-[13px] transition-all',
                            isActive
                              ? 'font-medium text-white'
                              : 'border-transparent text-white/70 hover:text-white',
                          )
                        }
                        style={({ isActive }) =>
                          ({
                            borderLeftColor: isActive ? iconStyle.color : 'transparent',
                            backgroundColor: isActive ? `${iconStyle.color}24` : undefined,
                          }) as CSSProperties
                        }
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: iconStyle.bg }}
                        >
                          <Icon size={16} style={{ color: iconStyle.color }} strokeWidth={2.1} aria-hidden="true" />
                        </span>
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                ))}
              </nav>
              <div className="border-t border-white/10 p-3">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-medium text-white/85 hover:bg-white/8"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="relative w-full flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <PortalPageTransition />
        </main>
      </div>
    </div>
  );
}
