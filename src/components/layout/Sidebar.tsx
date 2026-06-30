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
  type LucideIcon,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

interface NavItem {
  label: string
  Icon: LucideIcon
  path: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard',     Icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Customers',     Icon: Users,           path: '/customers' },
  { label: 'Quotations',    Icon: MessageSquare,   path: '/quotations' },
  { label: 'Air Export',    Icon: Plane,           path: '/jobs/air-export' },
  { label: 'Sea Export',    Icon: Ship,            path: '/jobs/sea-export' },
  { label: 'Sea Import',    Icon: Ship,            path: '/jobs/sea-import' },
  { label: 'Documentation', Icon: FileText,        path: '/documentation' },
  { label: 'Finance',       Icon: Wallet,          path: '/finance' },
  { label: 'NVOCC',         Icon: Building2,       path: '/nvocc' },
  { label: 'HR',            Icon: UserCircle,      path: '/hr' },
  { label: 'Masters',       Icon: Settings,        path: '/masters' },
  { label: 'Reports',       Icon: BarChart3,       path: '/reports' },
]

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)] transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          FG
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm text-white">Fresa Gold</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(({ label, Icon, path }) => (
          <a
            key={path}
            href={path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon size={16} className="shrink-0" aria-hidden="true" />
            {!sidebarCollapsed && <span>{label}</span>}
          </a>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
        {!sidebarCollapsed && 'Kingfisher Wings LLC'}
      </div>
    </aside>
  )
}