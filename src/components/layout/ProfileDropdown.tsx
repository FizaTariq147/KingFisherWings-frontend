import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { FinancialVisibilityIndicator } from '@/components/ui/FinancialVisibilityIndicator'
import type { FinancialVisibility } from '@/types/homepage.types'

// ── Avatar ─────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}

function Avatar({ name, avatarUrl, size = 'sm' }: AvatarProps) {
  const dim = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    )
  }

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

// ── ProfileDropdown ────────────────────────────────────────────────────────
export default function ProfileDropdown() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [open, setOpen]   = useState(false)
  const dropdownRef       = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  // FinancialVisibility lives on AuthUser in your auth context;
  // cast to the shape FinancialVisibilityIndicator expects
  const financialVisibility: FinancialVisibility = {
    canSeeRevenue:   (user as unknown as { canSeeRevenue?: boolean }).canSeeRevenue   ?? false,
    canSeeGP:        (user as unknown as { canSeeGP?: boolean }).canSeeGP             ?? false,
    canSeeARBalance: (user as unknown as { canSeeARBalance?: boolean }).canSeeARBalance ?? false,
    canSeeAPBalance: (user as unknown as { canSeeAPBalance?: boolean }).canSeeAPBalance ?? false,
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-neutral-100)] transition-colors"
      >
        <Avatar name={user.name} />
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-medium text-[var(--color-neutral-800)] max-w-[120px] truncate">
            {user.name}
          </span>
          <span className="text-[10px] text-[var(--color-neutral-400)] max-w-[120px] truncate">
            {user.role.name}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={`text-[var(--color-neutral-400)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-[var(--color-neutral-200)] shadow-lg z-50 overflow-hidden"
          style={{ boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
        >
          {/* User info header */}
          <div className="flex items-start gap-3 px-4 py-4 border-b border-[var(--color-neutral-100)]">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[var(--color-neutral-400)] truncate mb-2">
                {user.email}
              </p>
              <RoleBadge role={user.role} size="xs" />
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
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <User size={14} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
              My profile
            </Link>
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <Settings size={14} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-[var(--color-neutral-100)] py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-danger-700)] hover:bg-[var(--color-danger-100)] transition-colors"
            >
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}