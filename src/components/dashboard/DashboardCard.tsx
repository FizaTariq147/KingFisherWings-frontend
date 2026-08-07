import type { ReactNode } from 'react'
import { UserCircle, ChevronRight, Plus, Inbox } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

/**
 * ASSUMED component API (actual Card/Button source wasn't in context —
 * adjust this file if the real props differ):
 *   <Card className?>{children}</Card>
 *   <Button variant="ghost" size="icon" onClick? aria-label?>{children}</Button>
 */

export type CardAccent = 'primary' | 'secondary' | 'primaryTint' | 'neutral'

const ACCENT_COLOR: Record<CardAccent, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  primaryTint: 'var(--color-primary-500)',
  neutral: 'var(--color-neutral-400)',
}

interface DashboardCardProps {
  title: string
  accent?: CardAccent
  onAdd?: () => void
  onExpand?: () => void
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  /** Internal scroll body max height, so the 2x2 grid never grows the page */
  maxBodyHeight?: string
  /** Owner avatar button in the header (default true for ERP dashboard cards) */
  showOwnerIcon?: boolean
  children: ReactNode
}

function CardSkeleton() {
  return (
    <div className="p-4 space-y-2.5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-[var(--color-neutral-100)]" style={{ width: `${85 - i * 8}%` }} />
      ))}
    </div>
  )
}

function CardEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <Inbox size={22} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
      <p className="text-xs text-[var(--color-neutral-400)]">{message}</p>
    </div>
  )
}

export function DashboardCard({
  title,
  accent = 'primary',
  onAdd,
  onExpand,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'Nothing to show yet.',
  maxBodyHeight = '320px',
  showOwnerIcon = true,
  children,
}: DashboardCardProps) {
  return (
    <Card className="overflow-hidden !p-0">
      {/* Single accent bar — replaces the old full-saturation colored banner */}
      <div className="h-[3px] w-full" style={{ background: ACCENT_COLOR[accent] }} />

      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutral-200)]">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: ACCENT_COLOR[accent] }}
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {showOwnerIcon ? (
            <Button variant="ghost" size="sm" aria-label={`${title} owner`}>
              <UserCircle size={15} className="text-[var(--color-neutral-400)]" />
            </Button>
          ) : null}
          {onExpand ? (
            <Button variant="ghost" size="sm" onClick={onExpand} aria-label={`View all — ${title}`}>
              <ChevronRight size={15} style={{ color: ACCENT_COLOR[accent] }} />
            </Button>
          ) : null}
          {onAdd ? (
            <Button variant="ghost" size="sm" onClick={onAdd} aria-label={`Add — ${title}`}>
              <Plus size={15} style={{ color: ACCENT_COLOR[accent] }} />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: maxBodyHeight }}>
        {isLoading ? <CardSkeleton /> : isEmpty ? <CardEmptyState message={emptyMessage} /> : children}
      </div>
    </Card>
  )
}
