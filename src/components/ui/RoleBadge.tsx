import type { Role } from '@/types/auth.types'

interface RoleBadgeProps {
  role: Role
  size?: 'sm' | 'xs'
}

// Maps role slug → badge color tokens
// Extend as new roles are added on the backend
const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin:     { bg: 'var(--color-danger-100)',   text: 'var(--color-danger-700)' },
  manager:   { bg: 'var(--color-warning-100)',  text: 'var(--color-warning-700)' },
  operator:  { bg: 'var(--color-info-100)',     text: 'var(--color-info-500)' },
  finance:   { bg: 'var(--color-success-100)',  text: 'var(--color-success-700)' },
  viewer:    { bg: 'var(--color-neutral-100)',  text: 'var(--color-neutral-600)' },
}

const FALLBACK = { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-600)' }

export function RoleBadge({ role, size = 'xs' }: RoleBadgeProps) {
  const styles = ROLE_STYLES[role.slug] ?? FALLBACK

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium leading-none ${
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={{ background: styles.bg, color: styles.text }}
    >
      {role.name}
    </span>
  )
}