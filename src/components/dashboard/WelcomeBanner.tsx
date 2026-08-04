import { Search } from 'lucide-react'
import { Button } from '../ui/Button'

interface WelcomeBannerProps {
  productName?: string
  tenantName?: string
  onSearch?: () => void
}

export function WelcomeBanner({
  productName = 'KingFisher Tech Gold',
  tenantName,
  onSearch,
}: WelcomeBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap py-2">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-[9px] text-center leading-tight shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          KFTG
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-[var(--color-neutral-900)] truncate">
            Welcome to {productName}
          </h2>
          <p className="text-xs text-[var(--color-neutral-600)] mt-0.5">
            Track and manage quotations, jobs, and accounts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {tenantName ? (
          <span className="text-xs font-semibold text-[var(--color-primary)] px-3 py-1.5 rounded-md bg-[var(--color-surface)]">
            {tenantName}
          </span>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onSearch} aria-label="Search">
          <Search size={15} className="text-[var(--color-neutral-600)]" />
        </Button>
      </div>
    </div>
  )
}
