import { CheckSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'

interface TaskItem {
  id:          string
  title:       string
  dueDate:     string
  priority:    'low' | 'medium' | 'high'
}

const PRIORITY_COLOR: Record<TaskItem['priority'], string> = {
  low:    'var(--color-info-500)',
  medium: 'var(--color-warning-500)',
  high:   'var(--color-danger-500)',
}

export default function PendingTasksWidget() {
  const [data, setData]       = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<TaskItem[]>('/api/tasks/pending')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)' }}>
          <CheckSquare size={14} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">Pending Tasks</span>
        {!loading && (
          <span className="ml-auto text-xs font-semibold text-[var(--color-neutral-700)]">
            {data.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 bg-[var(--color-neutral-100)] rounded animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-xs text-[var(--color-neutral-400)]">No pending tasks.</p>
      ) : (
        <ul className="space-y-2">
          {data.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-2 text-xs">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: PRIORITY_COLOR[task.priority] }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-[var(--color-neutral-700)]">{task.title}</span>
              <span className="text-[var(--color-neutral-400)] shrink-0">
                {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}