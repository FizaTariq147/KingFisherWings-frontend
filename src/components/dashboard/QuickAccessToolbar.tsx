import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Plane,
  Receipt,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { PermissionKey } from '@/types/auth.types'

interface ToolbarLink {
  label: string
  to: string
  Icon: LucideIcon
  permission?: PermissionKey
  permissionAny?: PermissionKey[]
}

/** Real ERP shortcuts — filtered by the same menu_* keys as the sidebar. */
const LINKS: ToolbarLink[] = [
  { label: 'Quotations', to: '/quotations/all', Icon: FileText, permission: 'menu_quotations' },
  {
    label: 'Jobs',
    to: '/jobs/air-export',
    Icon: Plane,
    permissionAny: ['menu_jobs_air_export', 'menu_jobs_sea_export', 'menu_jobs_sea_import'],
  },
  { label: 'Invoices', to: '/invoices', Icon: Receipt, permission: 'menu_finance' },
  { label: 'Finance', to: '/finance', Icon: Wallet, permission: 'menu_finance' },
  { label: 'Customers', to: '/customers', Icon: Users, permission: 'menu_customers' },
  { label: 'Settings', to: '/settings', Icon: Settings, permission: 'menu_settings' },
]

export function QuickAccessToolbar() {
  const { hasPermission, hasAnyPermission } = useAuth()

  const visible = LINKS.filter((link) => {
    if (link.permissionAny?.length) return hasAnyPermission(...link.permissionAny)
    if (link.permission) return hasPermission(link.permission)
    return true
  })

  if (!visible.length) return null

  return (
    <div className="flex items-center gap-2 flex-wrap py-1">
      {visible.map(({ label, to, Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-bg)] text-xs font-medium text-[var(--color-neutral-900)] hover:bg-[var(--color-surface)] transition-colors"
        >
          {label}
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: 'var(--color-secondary)' }}
          >
            <Icon size={12} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}
