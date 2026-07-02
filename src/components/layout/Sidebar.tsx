import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Plane,
  Ship,
  FileText,
  Wallet,
  Building2,
  UserCircle,
  Settings,
  Shield,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { AuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { PermissionKey } from '@/types/auth.types'

interface NavItem {
  label:      string
  path:       string
  Icon:       LucideIcon
  permission: PermissionKey | null
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     path: '/dashboard',       Icon: LayoutDashboard, permission: 'menu_dashboard' },
  { label: 'Customers',     path: '/customers',       Icon: Users,           permission: 'menu_customers' },
  { label: 'Quotations',    path: '/quotations',      Icon: MessageSquare,   permission: 'menu_quotations' },
  { label: 'Air Export',    path: '/jobs/air-export', Icon: Plane,           permission: 'menu_jobs_air_export' },
  { label: 'Sea Export',    path: '/jobs/sea-export', Icon: Ship,            permission: 'menu_jobs_sea_export' },
  { label: 'Sea Import',    path: '/jobs/sea-import', Icon: Ship,            permission: 'menu_jobs_sea_import' },
  { label: 'Documentation', path: '/documentation',   Icon: FileText,        permission: 'menu_documentation' },
  { label: 'Finance',       path: '/finance',         Icon: Wallet,          permission: 'menu_finance' },
  { label: 'NVOCC',         path: '/nvocc',           Icon: Building2,       permission: 'menu_nvocc' },
  { label: 'HR',            path: '/hr',              Icon: UserCircle,      permission: 'menu_hr' },
  { label: 'Masters',       path: '/masters',         Icon: Settings,        permission: 'menu_masters' },
  { label: 'Reports',       path: '/reports',         Icon: BarChart3,       permission: 'menu_reports' },
  { label: 'Audit Log', path: '/audit-log', Icon: Shield, permission: 'menu_settings' },
]

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore()

  // ── Prefer AuthContext (full RBAC), fall back to authStore (auth without backend) ──
  const authCtx    = useContext(AuthContext)
  const storeUser  = useAuthStore((s) => s.user)

  const user        = authCtx?.user ?? storeUser
  const isLoading   = authCtx?.isLoading ?? false

  // When AuthContext is available AND has finished loading AND has a user,
  // filter by permissions. Otherwise show all items (dev / no-backend mode).
  const visibleItems = (() => {
    if (authCtx && !isLoading && authCtx.user) {
      return NAV_ITEMS.filter(
        (item) => item.permission === null || authCtx.hasPermission(item.permission),
      )
    }
    // No AuthContext or still loading — show everything so sidebar isn't empty
    return NAV_ITEMS
  })()

  const displayName = user?.name ?? 'User'
  const roleName    = (user as { role?: { name?: string } } | null)?.role?.name ?? ''

  return (
    <aside
      className={cn(
        'flex flex-col h-screen transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          FG
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm text-white">KingFisher Tech Gold</span>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5"
        aria-label="Main navigation"
      >
        {visibleItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/65 hover:text-white hover:bg-white/10',
              )
            }
          >
            <Icon size={16} className="shrink-0" aria-hidden="true" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User strip — expanded */}
      {user && !sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            {displayName[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{displayName}</p>
            {roleName && (
              <p className="text-[10px] text-white/40 truncate">{roleName}</p>
            )}
          </div>
        </div>
      )}

      {/* User strip — collapsed */}
      {user && sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-white/10 flex justify-center">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            title={displayName}
          >
            {displayName[0].toUpperCase()}
          </div>
        </div>
      )}
    </aside>
  )
}