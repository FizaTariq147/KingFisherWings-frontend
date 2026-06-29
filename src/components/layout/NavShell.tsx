import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  BarChart2,
  Settings,
  Maximize2,
  Minimize2,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

// ── Lightweight tooltip fallback ────────────────────────────────────────
function Tooltip({ children }: { children: ReactNode }) {
  return <div className="group relative inline-flex">{children}</div>
}

function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function TooltipTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  void asChild
  return <>{children}</>
}

function TooltipContent({
  children,
  side,
}: {
  children: ReactNode
  side?: string
}) {
  void side
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      {children}
    </span>
  )
}

// ── Nav item definition ────────────────────────────────────────────────────
interface NavItem {
  label: string
  to: string
  Icon: React.ElementType
  permission: string | null
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   to: '/dashboard',   Icon: LayoutDashboard, permission: null },
  { label: 'Jobs',        to: '/jobs',        Icon: Briefcase,       permission: 'menu_jobs' },
  { label: 'Quotations',  to: '/quotations',  Icon: FileText,        permission: 'menu_quotations' },
  { label: 'Accounts',    to: '/accounts',    Icon: DollarSign,      permission: 'menu_accounts' },
  { label: 'Sales',       to: '/sales',       Icon: TrendingUp,      permission: 'menu_sales' },
  { label: 'HR',          to: '/hr',          Icon: Users,           permission: 'menu_hr' },
  { label: 'Reports',     to: '/reports',     Icon: BarChart2,       permission: 'menu_reports' },
  { label: 'Settings',    to: '/settings',    Icon: Settings,        permission: 'menu_settings' },
]

// ── Fullscreen hook ────────────────────────────────────────────────────────
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        /* browser may deny — swallow */
      })
    } else {
      document.exitFullscreen()
    }
  }

  return { isFullscreen, toggle }
}

// ── User avatar initials ───────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ── Props ──────────────────────────────────────────────────────────────────
interface NavShellProps {
  children: ReactNode
}

// ── Component ──────────────────────────────────────────────────────────────
export default function NavShell({ children }: NavShellProps) {
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()
  const { isFullscreen, toggle }  = useFullscreen()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const permissions: Record<string, boolean> =
    (user as { permissions?: Record<string, boolean> })?.permissions ?? {}

  const visibleNav = NAV_ITEMS.filter(
    (item) => item.permission === null || permissions[item.permission],
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    ].join(' ')

  const Sidebar = (
    <aside className="flex flex-col h-full w-56 bg-white border-r border-gray-200 py-4 px-3">
      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-1 mb-6"
        onClick={() => setSidebarOpen(false)}
      >
        <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">F</span>
        </div>
        <span className="text-gray-900 font-semibold text-base tracking-tight">
          Fresa Gold
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5" aria-label="Main navigation">
        {visibleNav.map(({ label, to, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user mini card */}
      {user && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {initials(user.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-shrink-0">{Sidebar}</div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 flex-shrink-0">{Sidebar}</div>
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 flex-shrink-0">
            {/* Left: mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="hidden md:block" /> {/* spacer */}

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Notifications */}
              <button
                type="button"
                aria-label="Notifications"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <Bell size={17} />
              </button>

              {/* Fullscreen toggle — desktop only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    className="hidden md:flex p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                </TooltipContent>
              </Tooltip>

              {/* Profile dropdown */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user ? initials(user.name) : '?'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-gray-900 leading-none">
                      {user?.name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400 leading-none mt-0.5">
                      {user?.role ?? '—'}
                    </p>
                  </div>
                  <ChevronDown size={13} className="text-gray-400" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-0 mt-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-20 py-1"
                      role="menu"
                      aria-label="User menu"
                    >
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Users size={14} />
                        My profile
                      </Link>
                      <Link
                        to="/settings"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings size={14} />
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}