import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface AuditDiffViewProps {
  before: Record<string, unknown> | null
  after:  Record<string, unknown> | null
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'

interface DiffRow {
  key:    string
  status: DiffStatus
  before: unknown
  after:  unknown
}

function buildDiff(
  before: Record<string, unknown> | null,
  after:  Record<string, unknown> | null,
): DiffRow[] {
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after  ?? {}),
  ])

  const rows: DiffRow[] = []
  for (const key of keys) {
    const b = before?.[key]
    const a = after?.[key]
    let status: DiffStatus = 'unchanged'
    if (b === undefined) status = 'added'
    else if (a === undefined) status = 'removed'
    else if (JSON.stringify(b) !== JSON.stringify(a)) status = 'changed'
    if (status !== 'unchanged') {
      rows.push({ key, status, before: b, after: a })
    }
  }
  return rows
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}

const STATUS_STYLES: Record<DiffStatus, { row: string; label: string; text: string }> = {
  added:     { row: 'bg-[var(--color-success-100)]', label: 'ADDED',   text: 'text-[var(--color-success-700)]' },
  removed:   { row: 'bg-[var(--color-danger-100)]',  label: 'REMOVED', text: 'text-[var(--color-danger-700)]' },
  changed:   { row: 'bg-[var(--color-warning-100)]', label: 'CHANGED', text: 'text-[var(--color-warning-700)]' },
  unchanged: { row: '',                               label: '',         text: '' },
}

export function AuditDiffView({ before, after }: AuditDiffViewProps) {
  const [expanded, setExpanded] = useState(false)
  const diff = buildDiff(before, after)

  if (diff.length === 0 && !before && !after) return null

  // For non-edit actions (CREATE/DELETE) show raw JSON
  if (!before || !after) {
    const raw = before ?? after
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-800)] transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {before ? 'View deleted values' : 'View created values'}
        </button>
        {expanded && (
          <pre className="mt-1.5 text-[11px] bg-[var(--color-neutral-100)] rounded-lg p-3 overflow-x-auto max-h-48 text-[var(--color-neutral-700)]">
            {JSON.stringify(raw, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-800)] transition-colors"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {diff.length} field{diff.length !== 1 ? 's' : ''} changed
      </button>

      {expanded && (
        <div className="mt-1.5 rounded-lg overflow-hidden border border-[var(--color-neutral-200)] text-[11px]">
          <div className="grid grid-cols-3 bg-[var(--color-neutral-100)] px-3 py-1.5 font-medium text-[var(--color-neutral-500)] uppercase tracking-wider text-[10px]">
            <span>Field</span>
            <span>Before</span>
            <span>After</span>
          </div>
          {diff.map(({ key, status, before: b, after: a }) => {
            const s = STATUS_STYLES[status]
            return (
              <div key={key} className={`grid grid-cols-3 px-3 py-2 border-t border-[var(--color-neutral-200)] ${s.row}`}>
                <span className="font-medium text-[var(--color-neutral-700)] flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold ${s.text}`}>{s.label}</span>
                  {key}
                </span>
                <span className="text-[var(--color-neutral-500)] font-mono break-all pr-2">
                  {status === 'added' ? '—' : formatValue(b)}
                </span>
                <span className="text-[var(--color-neutral-700)] font-mono break-all">
                  {status === 'removed' ? '—' : formatValue(a)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}