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
  BarChart3,
  Percent,
  Shield,
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
  { label: 'Sales',         path: '/sales',             Icon: Percent,       permission: 'menu_sales' as PermissionKey },
  { label: 'Settings',      path: '/settings',        Icon: Settings,        permission: 'menu_settings' },
  { label: 'Audit Log',     path: '/audit-log',       Icon: Shield,          permission: 'menu_settings' },
]

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore()

  const authCtx    = useContext(AuthContext)
  const storeUser  = useAuthStore((s) => s.user)

  const user        = authCtx?.user ?? storeUser
  const isLoading   = authCtx?.isLoading ?? false

  const visibleItems = (() => {
    if (authCtx && !isLoading && authCtx.user) {
      return NAV_ITEMS.filter(
        (item) => item.permission === null || authCtx.hasPermission(item.permission),
      )
    }
    return NAV_ITEMS
  })()

  const displayName = user?.name ?? 'User'
  const roleName    = (user as { role?: { name?: string } } | null)?.role?.name ?? ''

  return (
    <aside
      className={cn(
        'flex flex-col h-screen transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-[250px]',
      )}
      style={{ background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      {/* overflow-y-auto keeps it scrollable if the nav list grows taller
          than the viewport; scrollbar-none hides the visible scrollbar
          track/thumb (webkit + Firefox + IE/Edge) without disabling scroll */}
      <nav
        className="flex-1 overflow-y-auto py-2.5 scrollbar-none"
        aria-label="Main navigation"
      >
        {visibleItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 py-2.5 text-[15.5px] transition-colors border-l-[3px] border-transparent',
                sidebarCollapsed ? 'justify-center px-0' : 'pl-[18px] pr-4',
                isActive
                  ? 'bg-white/10 text-white font-medium border-l-[var(--color-secondary)]'
                  : 'text-white/80 hover:text-white hover:bg-white/5',
              )
            }
          >
            <Icon size={20} className="shrink-0 opacity-90" aria-hidden="true" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

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
            {roleName && <p className="text-[10px] text-white/40 truncate">{roleName}</p>}
          </div>
        </div>
      )}
    </aside>
  )
}