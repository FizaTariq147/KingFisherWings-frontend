import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { InlineSpinner } from '@/components/skeletons/SkeletonPrimitives'

interface LogoutButtonProps {
  onClick?: () => void   // optional: called after logout (e.g. close dropdown)
}

/**
 * Drop-in replacement for the sign-out button in Topbar/ProfileDropdown.
 * Shows an inline spinner during the logout API call.
 */
export function LogoutButton({ onClick }: LogoutButtonProps) {
  const { logout }          = useAuth()
  const navigate            = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      onClick?.()
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
      style={{ color: 'var(--color-danger-700)' }}
    >
      {loading
        ? <InlineSpinner size={14} />
        : <LogOut size={14} aria-hidden="true" />}
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}