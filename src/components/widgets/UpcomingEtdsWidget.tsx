import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface EtdItem {
  jobNumber: string
  vessel:    string
  etd:       string   // ISO date string
  pol:       string
  pod:       string
}

export default function UpcomingEtdsWidget() {
  const [data, setData]       = useState<EtdItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<EtdItem[]>('/api/jobs/summary/upcoming-etds')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <Calendar size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">Upcoming ETDs (7 days)</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[var(--color-neutral-100)] rounded animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-xs text-[var(--color-neutral-400)]">No upcoming ETDs in the next 7 days.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.jobNumber} className="flex items-center justify-between text-xs">
              <span className="font-mono text-[var(--color-neutral-700)]">{item.jobNumber}</span>
              <span className="text-[var(--color-neutral-400)]">
                {item.pol} → {item.pod}
              </span>
              <span className="font-medium text-[var(--color-neutral-800)]">
                {new Date(item.etd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}