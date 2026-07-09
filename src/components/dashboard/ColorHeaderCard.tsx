import type { ReactNode } from 'react'
import { UserCircle, ChevronRight, Plus, CheckCircle2 } from 'lucide-react'

export type CardColorVariant = 'primary' | 'secondary' | 'primaryTint' | 'secondaryTint'

const VARIANT_BG: Record<CardColorVariant, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  primaryTint: 'var(--color-primary-500)',
  secondaryTint: 'var(--color-secondary-700)',
}

interface ColorHeaderCardProps {
  title: string
  color?: CardColorVariant
  /** Shows a checkmark icon instead of the user icon (used by Todo List) */
  showCheckIcon?: boolean
  /** Called when the "+" action is clicked */
  onAdd?: () => void
  /** Called when the chevron / "view all" action is clicked */
  onViewAll?: () => void
  children: ReactNode
}

export function ColorHeaderCard({
  title,
  color = 'primary',
  showCheckIcon = false,
  onAdd,
  onViewAll,
  children,
}: ColorHeaderCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-bg)] overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2.5 text-white"
        style={{ background: VARIANT_BG[color] }}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-3 opacity-95">
          {showCheckIcon ? (
            <CheckCircle2 size={15} aria-hidden="true" />
          ) : (
            <UserCircle size={15} aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={onViewAll}
            aria-label={`View all ${title}`}
            className="hover:opacity-80"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add to ${title}`}
            className="hover:opacity-80"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
