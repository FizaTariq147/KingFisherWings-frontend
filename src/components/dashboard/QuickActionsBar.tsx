import type { LucideIcon } from 'lucide-react'
import { MessageCircle, Heart, ThumbsUp, Megaphone, Handshake, Calendar } from 'lucide-react'

interface QuickAction {
  label: string
  Icon: LucideIcon
  bg: string
  onClick?: () => void
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Comments', Icon: MessageCircle, bg: 'var(--color-primary)' },
  { label: 'Favorites', Icon: Heart, bg: 'var(--color-danger-500)' },
  { label: 'Likes', Icon: ThumbsUp, bg: 'var(--color-success-500)' },
  { label: 'Notification', Icon: Megaphone, bg: 'var(--color-primary-500)' },
  { label: 'Follow Up', Icon: Handshake, bg: 'var(--color-primary-500)' },
  { label: 'Calendar', Icon: Calendar, bg: 'var(--color-secondary)' },
]

export function QuickActionsBar() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-4">
      {QUICK_ACTIONS.map(({ label, Icon, bg, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-bg)] text-xs text-[var(--color-neutral-900)] hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <span
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white"
            style={{ background: bg }}
          >
            <Icon size={13} aria-hidden="true" />
          </span>
          {label}
        </button>
      ))}

      {/* Social links — decorative placeholders; wire to real company profile links */}
      <div className="flex items-center gap-2 ml-auto">
        {['WA', 'in', 'f', '▶', '𝕏'].map((glyph, i) => (
          <span
            key={i}
            className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-white text-xs font-bold"
            style={{
              background: [
                'var(--color-success-500)',
                'var(--color-primary-500)',
                'var(--color-primary)',
                'var(--color-danger-500)',
                'var(--color-neutral-900)',
              ][i],
            }}
          >
            {glyph}
          </span>
        ))}
      </div>
    </div>
  )
}
