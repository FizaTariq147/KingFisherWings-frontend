import type { LucideIcon } from 'lucide-react'
import { MessageCircle, Heart, ThumbsUp, Bell, Handshake, Calendar, Share2, Link2, Rss } from 'lucide-react'

interface ToolbarAction {
  label: string
  Icon: LucideIcon
  onClick?: () => void
}

const ACTIONS: ToolbarAction[] = [
  { label: 'Comments', Icon: MessageCircle },
  { label: 'Favorites', Icon: Heart },
  { label: 'Likes', Icon: ThumbsUp },
  { label: 'Notification', Icon: Bell },
  { label: 'Follow Up', Icon: Handshake },
  { label: 'Calendar', Icon: Calendar },
]

// Kept minimal/neutral rather than brand-colored per integration — the
// original per-item rainbow (WhatsApp green, LinkedIn blue, etc.) fights
// the "color should be purposeful" rule, so these render as one quiet
// neutral cluster instead. Swap in real provider icons/links as integrations land.
const INTEGRATIONS: { label: string; Icon: LucideIcon }[] = [
  { label: 'Share', Icon: Share2 },
  { label: 'Connected apps', Icon: Link2 },
  { label: 'Feed', Icon: Rss },
]

export function QuickAccessToolbar() {
  return (
    <div className="flex items-center gap-2 flex-wrap py-1">
      {ACTIONS.map(({ label, Icon, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-bg)] text-xs font-medium text-[var(--color-neutral-900)] hover:bg-[var(--color-surface)] transition-colors"
        >
          {label}
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: 'var(--color-secondary)' }}
          >
            <Icon size={12} aria-hidden="true" />
          </span>
        </button>
      ))}

      <div className="flex items-center gap-1.5 ml-auto pl-2 border-l border-[var(--color-neutral-200)]">
        {INTEGRATIONS.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-neutral-600)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
