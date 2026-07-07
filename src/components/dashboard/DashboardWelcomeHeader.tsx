import { Search, Plane } from 'lucide-react'

interface DashboardWelcomeHeaderProps {
  productName?: string
  tenantName?: string
}

export function DashboardWelcomeHeader({
  productName = 'KingFisher Tech Gold',
  tenantName = 'KingFisher Wings',
}: DashboardWelcomeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3.5">
        <div
          className="w-[54px] h-[54px] rounded-lg flex items-center justify-center text-white font-extrabold text-[10px] text-center leading-tight shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-500))' }}
        >
          KINGFISHER
          <br />
          TECH GOLD
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-neutral-900)]">
            Welcome to {productName}
          </h1>
          <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
            Track and Manage Sales, Shipments, Jobs and Accounts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-bg)] text-xs font-bold text-[var(--color-primary)]">
          <Plane size={14} className="text-[var(--color-secondary)]" aria-hidden="true" />
          {tenantName}
        </div>
        <button
          type="button"
          aria-label="Search"
          className="w-[30px] h-[30px] rounded-full border border-[var(--color-neutral-200)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-neutral-50)]"
        >
          <Search size={14} />
        </button>
      </div>
    </div>
  )
}
