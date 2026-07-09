import { DollarSign, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface FinancialSummary {
  label:      string
  amount:     number
  currency:   string
  changePercent: number
}

export default function RevenueMTDWidget() {
  const [data, setData]       = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<FinancialSummary>('/api/finance/summary/revenue-mtd')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  const positive = (data?.changePercent ?? 0) >= 0

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <DollarSign size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">
          {data?.label ?? 'Revenue MTD'}
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-[var(--color-neutral-100)] rounded animate-pulse" />
      ) : (
        <>
          <div className="text-2xl font-bold text-[var(--color-neutral-900)] leading-none">
            {data ? `${data.currency} ${data.amount.toLocaleString()}` : '—'}
          </div>
          {data && (
            <div className={`flex items-center gap-1 mt-2 text-[11px] font-medium ${positive ? 'text-[var(--color-success-700)]' : 'text-[var(--color-danger-700)]'}`}>
              <TrendingUp size={11} aria-hidden="true" />
              {positive ? '+' : ''}{data.changePercent}% vs last month
            </div>
          )}
        </>
      )}
    </div>
  )
}