import { Briefcase } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface OpenJobsSummary {
  total:      number
  airExport:  number
  seaExport:  number
  seaImport:  number
}

export default function OpenJobsWidget() {
  const [data, setData]       = useState<OpenJobsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<OpenJobsSummary>('/api/jobs/summary/open')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <Briefcase size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">Open Jobs</span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-[var(--color-neutral-100)] rounded animate-pulse" />
      ) : (
        <>
          <div className="text-2xl font-bold text-[var(--color-neutral-900)] leading-none">
            {data?.total ?? '—'}
          </div>
          <div className="flex gap-3 mt-2">
            {[
              { label: 'Air', value: data?.airExport },
              { label: 'Sea Ex', value: data?.seaExport },
              { label: 'Sea Im', value: data?.seaImport },
            ].map(({ label, value }) => (
              <span key={label} className="text-[10px] text-[var(--color-neutral-400)]">
                {label}: <strong className="text-[var(--color-neutral-700)]">{value ?? '—'}</strong>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}