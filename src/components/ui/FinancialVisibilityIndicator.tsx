import type { FinancialVisibility } from '@/types/homepage.types'

interface FinancialVisibilityIndicatorProps {
  visibility: FinancialVisibility
}

const FLAG_CONFIG: {
  key: keyof FinancialVisibility
  label: string
}[] = [
  { key: 'canSeeRevenue',   label: 'Rev' },
  { key: 'canSeeGP',        label: 'GP' },
  { key: 'canSeeARBalance', label: 'AR' },
  { key: 'canSeeAPBalance', label: 'AP' },
]

export function FinancialVisibilityIndicator({
  visibility,
}: FinancialVisibilityIndicatorProps) {
  const anyEnabled = FLAG_CONFIG.some(({ key }) => visibility[key])

  if (!anyEnabled) return null

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-medium text-[var(--color-neutral-400)] uppercase tracking-widest">
        Financial access
      </p>
      <div className="flex items-center gap-1.5">
        {FLAG_CONFIG.map(({ key, label }) => {
          const enabled = visibility[key]
          return (
            <span
              key={key}
              title={enabled ? `${label}: visible` : `${label}: hidden`}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={
                enabled
                  ? { background: 'var(--color-success-100)', color: 'var(--color-success-700)' }
                  : { background: 'var(--color-neutral-100)', color: 'var(--color-neutral-400)' }
              }
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}