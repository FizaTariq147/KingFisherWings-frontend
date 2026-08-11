import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { cn } from '@/lib/utils';
import {
  PortalPageTransition,
  portalAnimationStyles,
  usePortalAutoAnimate,
} from '@/features/portal-auth/components/portal-ui';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { VendorSidebar } from '../components/VendorSidebar';
import { useVendorBrand } from '../hooks/useVendorBrand';
import { VENDOR_NAV } from '../nav';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export function VendorShell() {
  useApplyTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavRef] = usePortalAutoAnimate();
  const logoutStore = useVendorAuthStore((s) => s.logout);
  const user = useVendorAuthStore((s) => s.user);
  const { companyName, portalLabel, companyInitial } = useVendorBrand();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="portal-shell min-h-screen flex items-start bg-[var(--color-surface)]">
      <style>{portalAnimationStyles}</style>

      <div
        className="portal-shell-ambient pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(900px 420px at 12% -10%, color-mix(in srgb, var(--color-secondary) 16%, transparent), transparent 60%), radial-gradient(700px 360px at 100% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 55%)',
        }}
        aria-hidden="true"
      />

      <VendorSidebar onLogout={() => void handleLogout()} />

      <div className="relative flex-1 min-w-0 min-h-screen flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 border-b border-[var(--color-neutral-200)] bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold shrink-0">
                {companyInitial}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                  {portalLabel}
                </div>
                <div className="text-[11px] text-[var(--color-neutral-500)] truncate">
                  {user?.party?.name || companyName}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {mobileOpen ? (
          <div className="lg:hidden fixed inset-0 z-40">
            <button
              type="button"
              className="portal-mobile-backdrop absolute inset-0 bg-[var(--color-primary-900)]/45"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <div className="portal-mobile-drawer absolute right-0 top-0 h-full w-[min(320px,88vw)] bg-[var(--color-sidebar-bg)] text-white shadow-xl flex flex-col">
              <div className="flex items-start justify-between gap-3 px-4 py-4 border-b border-white/10">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-sm font-semibold">{portalLabel}</div>
                  <div className="mt-0.5 text-xs text-white/60 break-words whitespace-normal leading-snug">
                    {companyName}
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
              <nav
                ref={mobileNavRef}
                className="flex-1 overflow-y-auto py-3 px-2 portal-nav-stagger"
                aria-label="Mobile vendor navigation"
              >
                {VENDOR_NAV.map(({ label, to, Icon }) => (
                  <div key={to}>
                    <NavLink
                      to={to}
                      end={to === '/vendor'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-white/10 text-white border-l-[3px] border-[var(--color-secondary)]'
                            : 'text-white/80 hover:bg-white/5 hover:text-white',
                        )
                      }
                    >
                      <Icon size={18} className="opacity-90" aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  </div>
                ))}
              </nav>
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/15"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="relative mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <PortalPageTransition />
        </main>
      </div>
    </div>
  );
}
