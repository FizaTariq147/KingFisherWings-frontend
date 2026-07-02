import { Shield } from 'lucide-react'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { AuditFilters } from '@/components/audit/AuditFilters'
import { AuditTable } from '@/components/audit/AuditTable'

// ── Skeleton ───────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-neutral-200)] overflow-hidden">
      <div className="h-10 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-[var(--color-neutral-100)] animate-pulse">
          <div className="h-4 w-28 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-32 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-20 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AuditLogPage() {
  const { data, isLoading, error, page, filters, setPage, setFilters } = useAuditLogs()

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary-50)' }}
        >
          <Shield size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--color-neutral-900)]">Audit Trail</h1>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Full log of all system actions, edits, and access events
          </p>
        </div>
        {data && (
          <span className="ml-auto text-xs text-[var(--color-neutral-400)]">
            {data.total.toLocaleString()} total records
          </span>
        )}
      </div>

      {/* Filters */}
      <AuditFilters current={filters} onChange={setFilters} />

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border"
          style={{ background: 'var(--color-danger-100)', borderColor: '#FECACA', color: 'var(--color-danger-700)' }}
        >
          {error}
        </div>
      )}

      {/* Table / skeleton */}
      {isLoading ? (
        <TableSkeleton />
      ) : data ? (
        <AuditTable data={data} onPage={setPage} />
      ) : null}
    </div>
  )
}