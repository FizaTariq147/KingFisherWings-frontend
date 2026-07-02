import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown, User, Settings } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { ThemeSwitcher } from './ThemeSwitcher'
import { RoleBadge } from '../ui/RoleBadge'
import { FinancialVisibilityIndicator } from '../ui/FinancialVisibilityIndicator'
import { LogoutButton } from './LogoutButton'
import type { FinancialVisibility } from '../../types/homepage.types'

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ background: 'var(--color-primary-600)' }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function Topbar({ title }: { title: string }) {
  const { toggleSidebar }             = useUIStore()
  const { user }                      = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef                   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setProfileOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [profileOpen])

  const financialVisibility: FinancialVisibility = {
    canSeeRevenue:   (user as unknown as Record<string, boolean>)?.canSeeRevenue   ?? false,
    canSeeGP:        (user as unknown as Record<string, boolean>)?.canSeeGP        ?? false,
    canSeeARBalance: (user as unknown as Record<string, boolean>)?.canSeeARBalance ?? false,
    canSeeAPBalance: (user as unknown as Record<string, boolean>)?.canSeeAPBalance ?? false,
  }

  return (
    <header className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center justify-between px-6">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)] transition-colors"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">{title}</h3>
      </div>

      {/* Right */}
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
            className="h-8 w-48 rounded-md border border-[var(--color-neutral-200)] pl-8 pr-3 text-sm outline-none focus:border-[var(--color-primary-500)]"
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
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="User menu"
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            {user && <Avatar name={user.name} />}
            <div className="hidden sm:flex flex-col items-start leading-tight ml-1">
              <span className="text-xs font-medium text-[var(--color-neutral-800)] max-w-[100px] truncate">
                {user?.name ?? 'User'}
              </span>
              <span className="text-[10px] text-[var(--color-neutral-400)] max-w-[100px] truncate">
                {user?.role?.name ?? ''}
              </span>
            </div>
            <ChevronDown
              size={13}
              className={`text-[var(--color-neutral-400)] transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-[var(--color-neutral-200)] shadow-lg z-50 overflow-hidden"
              style={{ boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
            >
              {/* User info */}
              <div className="flex items-start gap-3 px-4 py-4 border-b border-[var(--color-neutral-100)]">
                {user && <Avatar name={user.name} size="md" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)] truncate mb-2">
                    {user?.email ?? ''}
                  </p>
                  {user?.role && <RoleBadge role={user.role} />}
                </div>
              </div>

              {/* Financial visibility */}
              <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
                <FinancialVisibilityIndicator visibility={financialVisibility} />
              </div>

              {/* Nav items */}
              <div className="py-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors"
                >
                  <User size={14} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
                  My profile
                </Link>
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors"
                >
                  <Settings size={14} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
                  Settings
                </Link>
              </div>

              {/* Theme switcher */}
              <div className="px-4 py-3 border-t border-[var(--color-neutral-100)]">
                <p className="text-[10px] font-medium text-[var(--color-neutral-400)] uppercase tracking-widest mb-2">
                  Theme
                </p>
                <ThemeSwitcher />
              </div>

              {/* Logout — now uses LogoutButton for spinner state */}
              <div className="border-t border-[var(--color-neutral-100)] py-1">
                <LogoutButton onClick={() => setProfileOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}