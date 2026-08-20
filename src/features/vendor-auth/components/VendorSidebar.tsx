import { useMemo, useState, type CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
import { usePortalAutoAnimate } from '@/features/portal-auth/components/portal-ui';
import { useVendorBrand } from '../hooks/useVendorBrand';
import { VENDOR_NAV, VENDOR_NAV_SECTIONS, type VendorNavIconStyle } from '../nav';
import { useVendorAuthStore } from '../store/vendorAuthStore';

type VendorSidebarProps = {
  onLogout: () => void;
  collapsed?: boolean;
};

function accentTint(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function SidebarSectionLabel({ title, color }: { title: string; color: string }) {
  return (
    <div className="mx-4 mb-1.5 mt-2.5 flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <p
        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color }}
      >
        {title}
      </p>
      <div className="h-px min-w-0 flex-1" style={{ backgroundColor: color }} />
    </div>
  );
}

function VendorNavIcon({
  Icon,
  iconStyle,
  active,
  size = 'md',
}: {
  Icon: LucideIcon;
  iconStyle: VendorNavIconStyle;
  active?: boolean;
  size?: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-lg transition-colors duration-200', box)}
      style={{
        background: active ? accentTint(iconStyle.color, 0.28) : iconStyle.bg,
        boxShadow: active ? `inset 0 0 0 1px ${accentTint(iconStyle.color, 0.45)}` : undefined,
      }}
    >
      <Icon size={iconSize} style={{ color: iconStyle.color }} strokeWidth={2.1} aria-hidden="true" />
    </span>
  );
}

function VendorNavLink({
  to,
  label,
  Icon,
  iconStyle,
  collapsed,
}: {
  to: string;
  label: string;
  Icon: LucideIcon;
  iconStyle: VendorNavIconStyle;
  collapsed?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/vendor'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 py-2 text-[13px] transition-all duration-200',
          collapsed
            ? 'mx-2 justify-center rounded-lg px-0'
            : 'mx-2 rounded-lg border-l-[3px] pl-2.5 pr-3',
          isActive
            ? 'font-medium text-white'
            : cn(
                'text-white/70 hover:text-white',
                collapsed
                  ? 'hover:[background-color:color-mix(in_srgb,var(--nav-accent)_14%,transparent)]'
                  : 'border-transparent hover:[border-left-color:var(--nav-accent)] hover:[background-color:color-mix(in_srgb,var(--nav-accent)_12%,transparent)]',
              ),
        )
      }
      style={({ isActive }) => {
        const baseStyle = { '--nav-accent': iconStyle.color } as CSSProperties;
        if (isActive) {
          return collapsed
            ? { ...baseStyle, backgroundColor: accentTint(iconStyle.color, 0.18) }
            : {
                ...baseStyle,
                borderLeftColor: iconStyle.color,
                backgroundColor: accentTint(iconStyle.color, 0.14),
              };
        }
        if (collapsed) return baseStyle;
        return { ...baseStyle, borderLeftColor: 'transparent' };
      }}
    >
      {({ isActive }) => (
        <>
          <VendorNavIcon Icon={Icon} iconStyle={iconStyle} active={isActive} />
          {!collapsed ? <span className="truncate">{label}</span> : null}
        </>
      )}
    </NavLink>
  );
}

export function VendorSidebar({ onLogout, collapsed = false }: VendorSidebarProps) {
  const navigate = useNavigate();
  const user = useVendorAuthStore((s) => s.user);
  const { companyName, portalLabel } = useVendorBrand();
  const displayName = user?.fullName || user?.email || 'Vendor';
  const firstLetter = displayName.charAt(0).toUpperCase();
  const [navRef] = usePortalAutoAnimate();
  const [moduleQuery, setModuleQuery] = useState('');

  const moduleMatches = useMemo(() => {
    const q = moduleQuery.trim().toLowerCase();
    if (!q) return [];
    return VENDOR_NAV.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [moduleQuery]);

  const jumpToModule = (path: string) => {
    setModuleQuery('');
    navigate(path);
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex shrink-0 sticky top-0 h-screen max-h-screen flex-col overflow-hidden transition-all duration-300',
        collapsed ? 'lg:w-[72px]' : 'lg:w-[272px]',
      )}
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      {collapsed ? (
        <div className="flex justify-center border-b border-white/8 px-2 py-3">
          <img
            src={logo}
            alt="KingFisher Wings"
            className="h-9 w-9 rounded-lg bg-white object-contain p-0.5"
          />
        </div>
      ) : (
        <div className="border-b border-white/8 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
            {portalLabel}
          </p>
          <div className="mt-2 flex items-start gap-3">
            <img
              src={logo}
              alt="KingFisher Wings"
              className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-white break-words" title={companyName}>
                {companyName}
              </p>
            </div>
          </div>
        </div>
      )}

      {!collapsed ? (
        <div className="border-b border-white/8 px-4 pb-4">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              value={moduleQuery}
              onChange={(e) => setModuleQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && moduleMatches[0]) jumpToModule(moduleMatches[0].to);
                if (e.key === 'Escape') setModuleQuery('');
              }}
              placeholder="Jump to module"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/6 pl-8 pr-3 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/20"
            />
            {moduleMatches.length > 0 ? (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0A2942] shadow-lg">
                {moduleMatches.map((item) => (
                  <li key={item.to}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white/85 hover:bg-white/8"
                      onClick={() => jumpToModule(item.to)}
                    >
                      <VendorNavIcon Icon={item.Icon} iconStyle={item.iconStyle} size="sm" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <nav
        ref={navRef}
        className="flex-1 min-h-0 overflow-y-auto py-3 scrollbar-none"
        aria-label="Vendor portal navigation"
      >
        {VENDOR_NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-2">
            {!collapsed ? <SidebarSectionLabel title={section.title} color={section.color} /> : null}
            {section.items.map((item) => (
              <VendorNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                Icon={item.Icon}
                iconStyle={item.iconStyle}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        {!collapsed ? (
          <>
            <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/6 px-3 py-2.5">
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5B3A2E] text-sm font-semibold text-white">
                  {firstLetter}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#051523] bg-[var(--color-success-500)]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-[10px] uppercase tracking-wide text-white/40">
                  {user?.party?.name || portalLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-medium text-white/85 transition-colors hover:bg-white/8"
            >
              <LogOut size={16} aria-hidden="true" />
              Log out
            </button>
          </>
        ) : (
          <button
            type="button"
            title="Log out"
            onClick={onLogout}
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/8"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
}
