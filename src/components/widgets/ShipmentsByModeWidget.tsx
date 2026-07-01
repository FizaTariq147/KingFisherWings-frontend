import { Ship } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface ModeBreakdown {
  mode:    string
  count:   number
  percent: number
}

interface ShipmentsSummary {
  total:      number
  breakdown:  ModeBreakdown[]
}

const MODE_COLORS: Record<string, string> = {
  'Air Export':  'var(--color-mode-air)',
  'Sea Export':  'var(--color-mode-sea)',
  'Sea Import':  'var(--color-mode-sea)',
  'Road':        'var(--color-mode-road)',
}

export default function ShipmentsByModeWidget() {
  const [data, setData]       = useState<ShipmentsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<ShipmentsSummary>('/api/jobs/summary/by-mode')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <Ship size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">Shipments by Mode</span>
        {!loading && data && (
          <span className="ml-auto text-xs font-semibold text-[var(--color-neutral-700)]">
            {data.total} total
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-[var(--color-neutral-100)] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.breakdown ?? []).map(({ mode, count, percent }) => (
            <div key={mode}>
              <div className="flex justify-between text-xs text-[var(--color-neutral-600)] mb-1">
                <span>{mode}</span>
                <span className="font-medium">{count} ({percent}%)</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, background: MODE_COLORS[mode] ?? 'var(--color-primary-500)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}