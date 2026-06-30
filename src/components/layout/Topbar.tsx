import { useState } from 'react'
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { ThemeSwitcher } from './ThemeSwitcher'

export function Topbar({ title }: { title: string }) {
  const { toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)] transition-colors"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <h1 className="text-sm font-semibold text-[var(--color-neutral-800)]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="h-8 w-48 rounded-md border border-[var(--color-neutral-200)] pl-8 pr-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
          />
        </div>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)] transition-colors"
        >
          <Bell size={17} aria-hidden="true" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-danger-500)] text-white text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="User menu"
            className="flex items-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.name?.[0] ?? 'U'}
            </div>
            <ChevronDown size={13} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-[var(--color-neutral-200)] shadow-lg z-20 py-2"
              >
                <div className="px-3 pb-2 mb-1 border-b border-[var(--color-neutral-100)]">
                  <p className="text-sm font-medium text-[var(--color-neutral-900)] truncate">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)] truncate">
                    {user?.email ?? ''}
                  </p>
                </div>

                <a
                  href="/profile"
                  role="menuitem"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
                >
                  <User size={14} aria-hidden="true" />
                  My profile
                </a>
                <a
                  href="/settings"
                  role="menuitem"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
                >
                  <Settings size={14} aria-hidden="true" />
                  Settings
                </a>

                {/* Theme switcher */}
                <div className="px-3 py-2.5 mt-1 border-t border-[var(--color-neutral-100)]">
                  <p className="text-xs font-medium text-[var(--color-neutral-400)] mb-2">Theme</p>
                  <ThemeSwitcher />
                </div>

                <div className="border-t border-[var(--color-neutral-100)] mt-1 pt-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger-700)] hover:bg-[var(--color-danger-100)]"
                  >
                    <LogOut size={14} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}