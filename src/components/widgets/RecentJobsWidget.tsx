import { Briefcase } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface RecentJob {
  jobNumber: string
  customer:  string
  mode:      string
  status:    string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'var(--color-info-500)',
  'Completed':   'var(--color-success-500)',
  'On Hold':     'var(--color-warning-500)',
  'Cancelled':   'var(--color-danger-500)',
}

export default function RecentJobsWidget() {
  const [data, setData]       = useState<RecentJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<RecentJob[]>('/api/jobs/recent?limit=5')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <Briefcase size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">Recent Jobs</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-[var(--color-neutral-100)] rounded animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-xs text-[var(--color-neutral-400)]">No recent jobs.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-neutral-100)]">
                {['Job No.', 'Customer', 'Mode', 'Status'].map((h) => (
                  <th key={h} className="pb-2 text-left font-medium text-[var(--color-neutral-400)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((job) => (
                <tr key={job.jobNumber} className="border-b border-[var(--color-neutral-100)] last:border-0">
                  <td className="py-2 font-mono text-[var(--color-neutral-700)]">{job.jobNumber}</td>
                  <td className="py-2 text-[var(--color-neutral-600)] max-w-[100px] truncate">{job.customer}</td>
                  <td className="py-2 text-[var(--color-neutral-600)]">{job.mode}</td>
                  <td className="py-2">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: STATUS_COLORS[job.status] ?? 'var(--color-neutral-500)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'currentColor' }} aria-hidden="true" />
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}