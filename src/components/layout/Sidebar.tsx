import { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  Shield,
  Globe,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore'
import { AuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions'
import type { PermissionKey } from '@/types/auth.types'

interface NavItem {
  label: string
  path: string
  Icon: LucideIcon
  permission: PermissionKey | null
  /** If set, item is visible when the user has any of these permissions. */
  permissionAny?: PermissionKey[]
  /** Shown only to Tenant Admin — never to User/Customer. */
  adminOnly?: boolean
}

/**
 * Ops / customer dashboard nav — same modules as before.
 * User Management is separate and admin-only.
 */
const OPS_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', Icon: LayoutDashboard, permission: 'menu_dashboard' },
  { label: 'Customers', path: '/customers', Icon: Users, permission: 'menu_customers' },
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
  { label: 'HR', path: '/hr', Icon: UserCircle, permission: 'menu_hr' },
  { label: 'Reports', path: '/reports', Icon: BarChart3, permission: 'menu_reports' },
  { label: 'Sales', path: '/sales', Icon: Percent, permission: 'menu_sales' as PermissionKey },
  { label: 'Settings', path: '/settings', Icon: Settings, permission: 'menu_settings' },
  { label: 'Audit Log', path: '/audit-log', Icon: Shield, permission: 'menu_settings' },
]

/** Tenant Admin only — not shown to User/Customer staff. */
const ADMIN_MASTERS_NAV_ITEM: NavItem = {
  label: 'Masters',
  path: '/masters',
  Icon: Settings,
  permission: null,
  adminOnly: true,
}

const ADMIN_USERS_NAV_ITEM: NavItem = {
  label: 'Users',
  path: '/admin/users',
  Icon: UserCog,
  permission: null,
  adminOnly: true,
}

const ADMIN_PARTIES_NAV_ITEM: NavItem = {
  label: 'Parties',
  path: '/parties',
  Icon: Briefcase,
  permission: null,
  adminOnly: true,
}

const ADMIN_ORGANIZATION_NAV_ITEM: NavItem = {
  label: 'Organization',
  path: '/organization',
  Icon: Building2,
  permission: null,
  adminOnly: true,
}

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Platform', path: '/superadmin/dashboard', Icon: Globe, permission: null },
  { label: 'Companies', path: '/superadmin/companies', Icon: Briefcase, permission: null },
  { label: 'Tenants', path: '/superadmin/tenants', Icon: Building2, permission: null },
]

interface SidebarProps {
  mobile?: boolean
  onNavigate?: () => void
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const { sidebarCollapsed } = useUIStore()
  const collapsed = mobile ? false : sidebarCollapsed
  const location = useLocation()
  const isSuperAdminArea = location.pathname.startsWith('/superadmin')

  const authCtx = useContext(AuthContext)
  const storeUser = useAuthStore((s) => s.user)
  const isSuperAdmin = useSuperAdminAuthStore((s) => s.isAuthenticated)

  const user = authCtx?.user ?? storeUser

  const roleSlug =
    resolveAuthRoleSlug(authCtx?.user?.role) ||
    resolveAuthRoleSlug(storeUser?.role)

  const isTenantAdmin =
    isTenantUserManagerRole(roleSlug) ||
    (authCtx ? TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => authCtx.hasRole(s)) : false)

  const visibleItems = (() => {
    if (isSuperAdminArea) return []

    // Tenant Admin owns the workspace — show full ops nav (Quotations + Tariffs, etc.).
    // Staff are filtered by menu_* when /auth/me returns a permissions list.
    if (isTenantAdmin) return OPS_NAV_ITEMS

    const perms = authCtx?.user?.permissions
    // When /auth/me omits permissions, keep full ops nav (existing behaviour).
    if (!perms || perms.length === 0) return OPS_NAV_ITEMS

    return OPS_NAV_ITEMS.filter((item) => {
      if (!item.permission && !item.permissionAny) return true
      if (item.permissionAny?.length) {
        return item.permissionAny.some((p) => authCtx?.hasPermission(p) ?? false)
      }
      return authCtx?.hasPermission(item.permission!) ?? false
    })
  })()

  // Users + Masters only for Tenant Admin — staff/customer do not see these.
  const showTenantAdminNav = !isSuperAdminArea && isTenantAdmin

  const displayName = user?.name ?? 'User'
  const roleName =
    (user as { role?: { name?: string } | string } | null)?.role &&
    typeof (user as { role?: unknown }).role === 'object'
      ? ((user as { role: { name?: string } }).role.name ?? '')
      : typeof (user as { role?: string } | null)?.role === 'string'
        ? String((user as { role: string }).role)
        : ''

  const linkClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-2.5 py-2.5 text-[15.5px] transition-colors border-l-[3px] border-transparent',
      collapsed ? 'justify-center px-0' : 'pl-[18px] pr-4',
      isActive
        ? 'bg-white/10 text-white font-medium border-l-[var(--color-secondary)]'
        : 'text-white/80 hover:text-white hover:bg-white/5',
    )

  const showPlatformNav = isSuperAdminArea && isSuperAdmin
  const UsersNavIcon = ADMIN_USERS_NAV_ITEM.Icon
  const MastersNavIcon = ADMIN_MASTERS_NAV_ITEM.Icon
  const PartiesNavIcon = ADMIN_PARTIES_NAV_ITEM.Icon
  const OrganizationNavIcon = ADMIN_ORGANIZATION_NAV_ITEM.Icon

  return (
    <aside
      className={cn(
        'flex flex-col h-full md:h-screen transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-[min(250px,85vw)] md:w-[250px]',
      )}
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      <nav className="flex-1 overflow-y-auto py-2.5 scrollbar-none" aria-label="Main navigation">
        {visibleItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            onClick={onNavigate}
            className={({ isActive }) => linkClass(isActive)}
          >
            <Icon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {showTenantAdminNav && (
          <>
            {!collapsed && (
              <p className="px-[18px] pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Tenant Admin
              </p>
            )}
            <NavLink
              to={ADMIN_MASTERS_NAV_ITEM.path}
              title={collapsed ? ADMIN_MASTERS_NAV_ITEM.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) => linkClass(isActive)}
            >
              <MastersNavIcon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
              {!collapsed && <span>{ADMIN_MASTERS_NAV_ITEM.label}</span>}
            </NavLink>
            <NavLink
              to={ADMIN_ORGANIZATION_NAV_ITEM.path}
              title={collapsed ? ADMIN_ORGANIZATION_NAV_ITEM.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                linkClass(
                  isActive || location.pathname.startsWith('/organization'),
                )
              }
            >
              <OrganizationNavIcon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
              {!collapsed && <span>{ADMIN_ORGANIZATION_NAV_ITEM.label}</span>}
            </NavLink>
            <NavLink
              to={ADMIN_PARTIES_NAV_ITEM.path}
              title={collapsed ? ADMIN_PARTIES_NAV_ITEM.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) => linkClass(isActive)}
            >
              <PartiesNavIcon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
              {!collapsed && <span>{ADMIN_PARTIES_NAV_ITEM.label}</span>}
            </NavLink>
            <NavLink
              to={ADMIN_USERS_NAV_ITEM.path}
              title={collapsed ? ADMIN_USERS_NAV_ITEM.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) => linkClass(isActive)}
            >
              <UsersNavIcon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
              {!collapsed && <span>{ADMIN_USERS_NAV_ITEM.label}</span>}
            </NavLink>
          </>
        )}

        {showPlatformNav && (
          <>
            {!collapsed && (
              <p className="px-[18px] pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Platform Admin
              </p>
            )}
            {SUPER_ADMIN_NAV_ITEMS.map(({ label, path, Icon }) => (
              <NavLink
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                onClick={onNavigate}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {user && !collapsed && (
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            {displayName[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{displayName}</p>
            {roleName && <p className="text-[10px] text-white/40 truncate">{roleName}</p>}
          </div>
        </div>
      )}
    </aside>
  )
}
