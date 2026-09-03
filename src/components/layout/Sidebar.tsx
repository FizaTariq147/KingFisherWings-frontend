import { useContext, useMemo, useState, type CSSProperties } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  MessageSquare,
  Shapes,
  Plane,
  Ship,
  FileText,
  Wallet,
  DollarSign,
  Building2,
  UserCircle,
  Settings,
  BarChart3,
  Percent,
  Globe,
  Briefcase,
  Truck,
  Warehouse,
  LogOut,
  Loader2,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';
import { AuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useAppAutoAnimate } from '@/components/motion';
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions';
import type { PermissionKey } from '@/types/auth.types';
import { useShellLogout } from './useShellLogout';
import logo from '@/assets/logo.png';

interface NavIconStyle {
  bg: string;
  color: string;
}

interface NavItem {
  label: string;
  path: string;
  Icon: LucideIcon;
  permission: PermissionKey | null;
  permissionAny?: PermissionKey[];
  adminOnly?: boolean;
  iconStyle?: NavIconStyle;
  /** Highlight when pathname starts with this prefix (e.g. sub-routes). */
  activePrefix?: string;
}

type NavGroupId = 'workspace' | 'operations' | 'business';

interface NavGroup {
  id: NavGroupId;
  title: string;
  /** Section label + top rule color (matches design snippet). */
  color: string;
  items: NavItem[];
}

const SECTION_COLORS = {
  workspace: '#FF751F',
  operations: '#67E8F9',
  business: '#A3E635',
  tenantAdmin: '#C4B5FD',
  platformAdmin: '#7DD3FC',
} as const;

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

const DEFAULT_ICON_STYLE: NavIconStyle = { bg: 'rgba(255, 117, 31, 0.18)', color: '#FF751F' };

function accentTint(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function navStyle(color: string): NavIconStyle {
  return { color, bg: accentTint(color, 0.2) };
}

/** One unique accent per nav path — no shared icon colors */
const SIDEBAR_ICON_STYLES: Record<string, NavIconStyle> = {
  '/dashboard': navStyle('#FF751F'),
  '/customers': navStyle('#E879F9'),
  '/vendors': navStyle('#D97706'),
  '/quotations': navStyle('#818CF8'),
  '/management': navStyle('#84CC16'),
  '/jobs/air-export': navStyle('#60A5FA'),
  '/jobs/sea-export': navStyle('#1E3A8A'),
  '/jobs/sea-import': navStyle('#14B8A6'),
  '/documentation': navStyle('#FACC15'),
  '/finance': navStyle('#059669'),
  '/accounts': navStyle('#22D3EE'),
  '/nvocc': navStyle('#9333EA'),
  '/hr': navStyle('#DB2777'),
  '/reports': navStyle('#DC2626'),
  '/sales': navStyle('#F43F5E'),
  '/settings': navStyle('#64748B'),
  '/masters': navStyle('#A855F7'),
  '/warehouse': navStyle('#0D9488'),
  '/organization': navStyle('#06B6D4'),
  '/parties': navStyle('#CA8A04'),
  '/admin/users': navStyle('#C026D3'),
  '/superadmin/dashboard': navStyle('#0284C7'),
  '/superadmin/companies': navStyle('#B45309'),
  '/superadmin/tenants': navStyle('#4ADE80'),
};

function productBadge(product?: string): string {
  if (!product) return 'GOLD';
  if (product.includes('Gold')) return 'GOLD';
  if (product.includes('Global')) return 'GLOBAL';
  if (product.includes('Analytics')) return 'ANALYTICS';
  return 'APP';
}

function iconStyleFor(path: string, itemStyle?: NavIconStyle): NavIconStyle {
  return itemStyle ?? SIDEBAR_ICON_STYLES[path] ?? DEFAULT_ICON_STYLE;
}

function SidebarNavIcon({
  path,
  Icon,
  itemStyle,
  active = false,
  size = 'md',
}: {
  path: string;
  Icon: LucideIcon;
  itemStyle?: NavIconStyle;
  active?: boolean;
  size?: 'sm' | 'md';
}) {
  const style = iconStyleFor(path, itemStyle);
  const box = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-lg transition-colors duration-200', box)}
      style={{
        background: active ? accentTint(style.color, 0.28) : style.bg,
        boxShadow: active ? `inset 0 0 0 1px ${accentTint(style.color, 0.45)}` : undefined,
      }}
    >
      <Icon size={iconSize} style={{ color: style.color }} strokeWidth={2.1} aria-hidden="true" />
    </span>
  );
}

function SidebarNavLink({
  path,
  label,
  Icon,
  iconStyle,
  collapsed,
  onNavigate,
  resolveActive,
}: {
  path: string;
  label: string;
  Icon: LucideIcon;
  iconStyle?: NavIconStyle;
  collapsed: boolean;
  onNavigate?: () => void;
  resolveActive?: (isActive: boolean) => boolean;
}) {
  const accent = iconStyleFor(path, iconStyle);

  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) => {
        const active = resolveActive ? resolveActive(isActive) : isActive;
        return cn(
          'group flex items-center gap-2.5 py-2 text-[13px] transition-all duration-200',
          collapsed
            ? 'mx-2 justify-center rounded-lg px-0'
            : 'mx-2 rounded-lg border-l-[3px] pl-2.5 pr-3',
          active
            ? 'font-medium text-white'
            : cn(
                'text-white/70 hover:text-white',
                collapsed
                  ? 'hover:[background-color:color-mix(in_srgb,var(--nav-accent)_14%,transparent)]'
                  : 'border-transparent hover:[border-left-color:var(--nav-accent)] hover:[background-color:color-mix(in_srgb,var(--nav-accent)_12%,transparent)]',
              ),
        );
      }}
      style={({ isActive }) => {
        const active = resolveActive ? resolveActive(isActive) : isActive;
        const baseStyle = { '--nav-accent': accent.color } as CSSProperties;

        if (active) {
          return collapsed
            ? { ...baseStyle, backgroundColor: accentTint(accent.color, 0.18) }
            : {
                ...baseStyle,
                borderLeftColor: accent.color,
                backgroundColor: accentTint(accent.color, 0.14),
              };
        }

        if (collapsed) return baseStyle;
        return { ...baseStyle, borderLeftColor: 'transparent' };
      }}
    >
      {({ isActive }) => {
        const active = resolveActive ? resolveActive(isActive) : isActive;
        return (
          <>
            <SidebarNavIcon path={path} Icon={Icon} itemStyle={iconStyle} active={active} />
            {!collapsed && <span>{label}</span>}
          </>
        );
      }}
    </NavLink>
  );
}

function SidebarBrand({
  collapsed,
  product,
}: {
  collapsed: boolean;
  product?: string;
}) {
  if (collapsed) {
    return (
      <div className="flex justify-center border-b border-white/8 px-2 py-3">
        <img src={logo} alt="KingFisher Wings" className="h-9 w-9 rounded-lg object-contain" />
      </div>
    );
  }

  return (
    <div className="border-b border-white/8 px-4 py-4">
      <div className="flex items-start gap-3">
        <img
          src={logo}
          alt="KingFisher Wings"
          className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">KingFisher Wings LLC</p>
            <span className="shrink-0 rounded bg-[var(--color-secondary)] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
              {productBadge(product)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-white/45">Freight operations workspace</p>
        </div>
      </div>
    </div>
  );
}

const OPS_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', Icon: LayoutDashboard, permission: 'menu_dashboard' },
  { label: 'Customers', path: '/customers', Icon: Users, permission: 'menu_customers' },
  { label: 'Vendors', path: '/vendors', Icon: Truck, permission: 'menu_vendors' },
  { label: 'Quotations', path: '/quotations', Icon: MessageSquare, permission: 'menu_quotations' },
  { label: 'Management', path: '/management', Icon: Shapes, permission: 'menu_management' as PermissionKey },
  { label: 'Air Export', path: '/jobs/air-export', Icon: Plane, permission: 'menu_jobs_air_export' },
  { label: 'Sea Export', path: '/jobs/sea-export', Icon: Ship, permission: 'menu_jobs_sea_export' },
  { label: 'Sea Import', path: '/jobs/sea-import', Icon: Ship, permission: 'menu_jobs_sea_import' },
  { label: 'Documentation', path: '/documentation', Icon: FileText, permission: 'menu_documentation' },
  { label: 'Finance', path: '/finance', Icon: Wallet, permission: 'menu_finance' },
  {
    label: 'Accounts',
    path: '/accounts',
    Icon: DollarSign,
    permission: 'menu_accounts',
    permissionAny: ['menu_accounts', 'menu_finance'],
  },
  { label: 'NVOCC', path: '/nvocc', Icon: Building2, permission: 'menu_nvocc' },
  { label: 'HR', path: '/hr', Icon: UserCircle, permission: 'menu_hr', activePrefix: '/hr' },
  {
    label: 'Warehouse',
    path: '/warehouse',
    Icon: Warehouse,
    permission: 'menu_hr',
    activePrefix: '/warehouse',
  },
  { label: 'Reports', path: '/reports', Icon: BarChart3, permission: 'menu_reports' },
  { label: 'Sales', path: '/sales', Icon: Percent, permission: 'menu_sales' as PermissionKey },
  { label: 'Settings', path: '/settings', Icon: Settings, permission: 'menu_settings' },
];

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'workspace',
    title: 'Workspace',
    color: SECTION_COLORS.workspace,
    items: OPS_NAV_ITEMS.slice(0, 5),
  },
  {
    id: 'operations',
    title: 'Operations',
    color: SECTION_COLORS.operations,
    items: OPS_NAV_ITEMS.slice(5, 10),
  },
  {
    id: 'business',
    title: 'Business',
    color: SECTION_COLORS.business,
    items: OPS_NAV_ITEMS.slice(10),
  },
];

const ADMIN_MASTERS_NAV_ITEM: NavItem = {
  label: 'Masters',
  path: '/masters',
  Icon: Settings,
  permission: null,
  adminOnly: true,
};

const ADMIN_USERS_NAV_ITEM: NavItem = {
  label: 'Users',
  path: '/admin/users',
  Icon: UserCog,
  permission: null,
  adminOnly: true,
};

const ADMIN_PARTIES_NAV_ITEM: NavItem = {
  label: 'Parties',
  path: '/parties',
  Icon: Briefcase,
  permission: null,
  adminOnly: true,
};

const ADMIN_ORGANIZATION_NAV_ITEM: NavItem = {
  label: 'Organization',
  path: '/organization',
  Icon: Building2,
  permission: null,
  adminOnly: true,
};

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Platform', path: '/superadmin/dashboard', Icon: Globe, permission: null },
  { label: 'Companies', path: '/superadmin/companies', Icon: Briefcase, permission: null },
  { label: 'Tenants', path: '/superadmin/tenants', Icon: Building2, permission: null },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const { sidebarCollapsed } = useUIStore();
  const collapsed = mobile ? false : sidebarCollapsed;
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdminArea = location.pathname.startsWith('/superadmin');
  const [moduleQuery, setModuleQuery] = useState('');

  const authCtx = useContext(AuthContext);
  const storeUser = useAuthStore((s) => s.user);
  const isSuperAdmin = useSuperAdminAuthStore((s) => s.isAuthenticated);
  const { handleLogout, loggingOut } = useShellLogout(onNavigate);

  const user = authCtx?.user ?? storeUser;

  const roleSlug =
    resolveAuthRoleSlug(authCtx?.user?.role) || resolveAuthRoleSlug(storeUser?.role);

  const isTenantAdmin =
    isTenantUserManagerRole(roleSlug) ||
    (authCtx ? TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => authCtx.hasRole(s)) : false);

  const visibleGroups = useMemo(() => {
    if (isSuperAdminArea) return [];
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isTenantAdmin) return true;
        if (!item.permission && !item.permissionAny) return true;
        if (item.permissionAny?.length) {
          return item.permissionAny.some((p) => authCtx?.hasPermission(p) ?? false);
        }
        return authCtx?.hasPermission(item.permission!) ?? false;
      }),
    })).filter((group) => group.items.length > 0);
  }, [authCtx, isSuperAdminArea, isTenantAdmin]);

  const flatNavItems = useMemo(
    () => visibleGroups.flatMap((g) => g.items),
    [visibleGroups],
  );

  const moduleMatches = useMemo(() => {
    const q = moduleQuery.trim().toLowerCase();
    if (!q) return [];
    return flatNavItems.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [flatNavItems, moduleQuery]);

  const showTenantAdminNav = !isSuperAdminArea && isTenantAdmin;
  const showPlatformNav = isSuperAdminArea && isSuperAdmin;

  const displayName = user?.name ?? 'User';
  const roleName =
    (user as { role?: { name?: string } | string } | null)?.role &&
    typeof (user as { role?: unknown }).role === 'object'
      ? ((user as { role: { name?: string } }).role.name ?? '')
      : typeof (user as { role?: string } | null)?.role === 'string'
        ? String((user as { role: string }).role)
        : '';
  const product = (user as { product?: string } | null)?.product ?? 'KingFisher Tech Gold';

  const [navRef] = useAppAutoAnimate();

  const jumpToModule = (path: string) => {
    setModuleQuery('');
    onNavigate?.();
    navigate(path);
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col md:h-screen shrink-0 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[min(272px,85vw)] md:w-[272px]',
      )}
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      <SidebarBrand collapsed={collapsed} product={product} />
      {!collapsed && (
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
                if (e.key === 'Enter' && moduleMatches[0]) jumpToModule(moduleMatches[0].path);
                if (e.key === 'Escape') setModuleQuery('');
              }}
              placeholder="Jump to module"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/6 pl-8 pr-3 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/20"
            />
            {moduleMatches.length > 0 ? (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0A2942] shadow-lg">
                {moduleMatches.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white/85 hover:bg-white/8"
                      onClick={() => jumpToModule(item.path)}
                    >
                      <SidebarNavIcon path={item.path} Icon={item.Icon} size="sm" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      )}

      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto py-3 scrollbar-none app-nav-stagger"
        aria-label="Main navigation"
      >
        {visibleGroups.map((group) => (
          <div key={group.id} className="mb-2">
            {!collapsed && <SidebarSectionLabel title={group.title} color={group.color} />}
            {group.items.map((item) => (
              <SidebarNavLink
                key={item.path}
                path={item.path}
                label={item.label}
                Icon={item.Icon}
                iconStyle={item.iconStyle}
                collapsed={collapsed}
                onNavigate={onNavigate}
                resolveActive={(isActive) =>
                  isActive ||
                  Boolean(item.activePrefix && location.pathname.startsWith(item.activePrefix))
                }
              />
            ))}
          </div>
        ))}

        {showTenantAdminNav && (
          <div className="mb-2">
            {!collapsed && (
              <SidebarSectionLabel title="Tenant Admin" color={SECTION_COLORS.tenantAdmin} />
            )}
            {[ADMIN_MASTERS_NAV_ITEM, ADMIN_ORGANIZATION_NAV_ITEM, ADMIN_PARTIES_NAV_ITEM, ADMIN_USERS_NAV_ITEM].map(
              (item) => (
                <SidebarNavLink
                  key={item.path}
                  path={item.path}
                  label={item.label}
                  Icon={item.Icon}
                  iconStyle={item.iconStyle}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  resolveActive={(isActive) =>
                    isActive ||
                    (item.path === '/organization' && location.pathname.startsWith('/organization'))
                  }
                />
              ),
            )}
          </div>
        )}

        {showPlatformNav && (
          <div className="mb-2">
            {!collapsed && (
              <SidebarSectionLabel title="Platform Admin" color={SECTION_COLORS.platformAdmin} />
            )}
            {SUPER_ADMIN_NAV_ITEMS.map((item) => (
              <SidebarNavLink
                key={item.path}
                path={item.path}
                label={item.label}
                Icon={item.Icon}
                iconStyle={item.iconStyle}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-3">
          {!collapsed ? (
            <>
              <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/6 px-3 py-2.5">
                <div className="relative shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                    {displayName[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#051523] bg-[var(--color-success-500)]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{displayName}</p>
                  <p className="truncate text-[10px] uppercase tracking-wide text-white/40">
                    {roleName || 'Staff user'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-medium text-white/85 transition-colors hover:bg-white/8 disabled:opacity-60"
              >
                {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                {loggingOut ? 'Signing out…' : 'Logout'}
              </button>
            </>
          ) : (
            <button
              type="button"
              title="Logout"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/8"
            >
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
