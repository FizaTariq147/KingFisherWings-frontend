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

interface ToolbarLink {
  label: string
  to: string
  Icon: LucideIcon
}

/** Real ERP shortcuts — no placeholder social/integration actions. */
const LINKS: ToolbarLink[] = [
  { label: 'Quotations', to: '/quotations/all', Icon: FileText },
  { label: 'Jobs', to: '/jobs/air-export', Icon: Plane },
  { label: 'Invoices', to: '/invoices', Icon: Receipt },
  { label: 'Finance', to: '/finance', Icon: Wallet },
  { label: 'Customers', to: '/customers', Icon: Users },
  { label: 'Settings', to: '/settings', Icon: Settings },
]

export function QuickAccessToolbar() {
  return (
    <div className="flex items-center gap-2 flex-wrap py-1">
      {LINKS.map(({ label, to, Icon }) => (
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
