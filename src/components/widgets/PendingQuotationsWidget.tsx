import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface QuotationSummary {
  total:    number
  expiring: number   // expiring within 48h
}

export default function PendingQuotationsWidget() {
  const [data, setData]       = useState<QuotationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<QuotationSummary>('/api/quotations/summary/pending')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <FileText size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">Pending Quotations</span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-[var(--color-neutral-100)] rounded animate-pulse" />
      ) : (
        <>
          <div className="text-2xl font-bold text-[var(--color-neutral-900)] leading-none">
            {data?.total ?? '—'}
          </div>
          {(data?.expiring ?? 0) > 0 && (
            <div className="mt-2 text-[11px] font-medium text-[var(--color-warning-700)]">
              {data?.expiring} expiring within 48h
            </div>
          )}
        </>
      )}
    </div>
  )
}