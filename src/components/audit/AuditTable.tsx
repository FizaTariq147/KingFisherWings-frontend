import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AuditDiffView } from './AuditDiffView'
import type { AuditAction, AuditLogEntry, AuditLogPage } from '@/types/audit.types'

// ── Action badge ───────────────────────────────────────────────────────────
const ACTION_STYLES: Partial<Record<AuditAction, { bg: string; text: string }>> = {
  CREATE:             { bg: 'var(--color-success-100)',  text: 'var(--color-success-700)' },
  EDIT:               { bg: 'var(--color-info-100)',     text: 'var(--color-info-500)' },
  DELETE:             { bg: 'var(--color-danger-100)',   text: 'var(--color-danger-700)' },
  LOGIN:              { bg: 'var(--color-neutral-100)',  text: 'var(--color-neutral-600)' },
  LOGOUT:             { bg: 'var(--color-neutral-100)',  text: 'var(--color-neutral-600)' },
  LOGIN_FAILED:       { bg: 'var(--color-danger-100)',   text: 'var(--color-danger-700)' },
  DOCUMENT_GENERATED: { bg: 'var(--color-warning-100)', text: 'var(--color-warning-700)' },
  SETTINGS_CHANGED:   { bg: 'var(--color-warning-100)', text: 'var(--color-warning-700)' },
  PERMISSION_CHANGED: { bg: 'var(--color-danger-100)',  text: 'var(--color-danger-700)' },
}

const FALLBACK_STYLE = { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-600)' }

function ActionBadge({ action }: { action: AuditAction }) {
  const s = ACTION_STYLES[action] ?? FALLBACK_STYLE
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {action.replace(/_/g, ' ')}
    </span>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────
function AuditRow({ entry }: { entry: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const hasDiff = entry.before !== null || entry.after !== null

  const ts = new Date(entry.createdAt)
  const dateStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <>
      <tr
        className={`border-b border-[var(--color-neutral-100)] transition-colors ${hasDiff ? 'cursor-pointer hover:bg-[var(--color-neutral-50)]' : ''}`}
        onClick={() => hasDiff && setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (!hasDiff) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
        tabIndex={hasDiff ? 0 : undefined}
        role={hasDiff ? 'button' : undefined}
        aria-expanded={hasDiff ? expanded : undefined}
      >
        {/* Timestamp */}
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="text-xs text-[var(--color-neutral-700)]">{dateStr}</div>
          <div className="text-[10px] text-[var(--color-neutral-400)] font-mono">{timeStr}</div>
        </td>

        {/* User */}
        <td className="px-4 py-3">
          <div className="text-xs font-medium text-[var(--color-neutral-800)] truncate max-w-[120px]">
            {entry.userName}
          </div>
          <div className="text-[10px] text-[var(--color-neutral-400)] truncate max-w-[120px]">
            {entry.userEmail}
          </div>
        </td>

        {/* Action */}
        <td className="px-4 py-3 whitespace-nowrap">
          <ActionBadge action={entry.action} />
        </td>

        {/* Entity */}
        <td className="px-4 py-3">
          <div className="text-xs text-[var(--color-neutral-600)]">{entry.entity}</div>
          {entry.entityLabel && (
            <div className="text-[10px] font-mono text-[var(--color-neutral-400)]">{entry.entityLabel}</div>
          )}
        </td>

        {/* IP */}
        <td className="px-4 py-3">
          <span className="text-[11px] font-mono text-[var(--color-neutral-500)]">{entry.ipAddress}</span>
        </td>

        {/* Diff indicator */}
        <td className="px-4 py-3 text-center">
          {hasDiff && (
            <span className="text-[10px] text-[var(--color-primary-600)] font-medium">
              {expanded ? '▲ Hide' : '▼ Show'}
            </span>
          )}
        </td>
      </tr>

      {/* Expanded diff row */}
      {expanded && hasDiff && (
        <tr className="bg-[var(--color-neutral-50)]">
          <td colSpan={6} className="px-6 pb-4 pt-1">
            <AuditDiffView before={entry.before} after={entry.after} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────
interface PaginationProps {
  page:       number
  totalPages: number
  total:      number
  pageSize:   number
  onPage:     (p: number) => void
}

function Pagination({ page, totalPages, total, pageSize, onPage }: PaginationProps) {
  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-neutral-200)]">
      <span className="text-xs text-[var(--color-neutral-400)]">
        Showing {from}–{to} of {total} entries
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          // Show pages around current
          let p = i + 1
          if (totalPages > 7) {
            if (page <= 4)       p = i + 1
            else if (page >= totalPages - 3) p = totalPages - 6 + i
            else p = page - 3 + i
          }
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${
                p === page
                  ? 'text-white'
                  : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)]'
              }`}
              style={p === page ? { background: 'var(--color-primary-600)' } : {}}
            >
              {p}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────
interface AuditTableProps {
  data:    AuditLogPage
  onPage:  (p: number) => void
}

export function AuditTable({ data, onPage }: AuditTableProps) {
  const COLS = ['Timestamp', 'User', 'Action', 'Module / Record', 'IP Address', 'Changes']

  return (
    <div className="bg-white rounded-xl border border-[var(--color-neutral-200)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
              {COLS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-neutral-400)]">
                  No audit logs found for the selected filters.
                </td>
              </tr>
            ) : (
              data.data.map((entry) => <AuditRow key={entry.id} entry={entry} />)
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={data.pageSize}
        onPage={onPage}
      />
    </div>
  )
}