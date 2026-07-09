import { useEffect, useRef } from 'react'
import { X, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useHomepageConfig } from '@/hooks/useHomepageConfig'
import { getWidgetMeta } from './widgetRegistry'
import type { HomepageConfig, WidgetConfig } from '@/types/homepage.types'

// ── Widget group metadata for UI display ───────────────────────────────────
interface WidgetGroup {
  label:     string
  widgetIds: WidgetConfig['id'][]
  note?:     string   // shown when financial visibility blocks a widget
}

const WIDGET_GROUPS: WidgetGroup[] = [
  {
    label: 'Operations',
    widgetIds: ['open_jobs', 'upcoming_etds', 'recent_jobs', 'pending_tasks'],
  },
  {
    label: 'Sales',
    widgetIds: ['pending_quotations', 'shipments_by_mode'],
  },
  {
    label: 'Finance',
    widgetIds: ['revenue_mtd', 'gp_mtd', 'ar_balance', 'ap_balance'],
    note: 'Some widgets may be hidden by your financial visibility settings.',
  },
]

// ── Column selector ────────────────────────────────────────────────────────
const COLUMN_OPTIONS: { value: HomepageConfig['columns']; label: string }[] = [
  { value: 2, label: '2 columns' },
  { value: 3, label: '3 columns' },
  { value: 4, label: '4 columns' },
]

// ── Toggle row ─────────────────────────────────────────────────────────────
interface ToggleRowProps {
  widget:       WidgetConfig
  financiallyBlocked: boolean
  onToggle:     (id: WidgetConfig['id'], visible: boolean) => Promise<void>
}

function ToggleRow({ widget, financiallyBlocked, onToggle }: ToggleRowProps) {
  const meta = getWidgetMeta(widget.id)
  if (!meta) return null

  const blocked  = financiallyBlocked && !!meta.financial
  const enabled  = widget.visible && !blocked

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        enabled
          ? 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)]'
          : 'border-[var(--color-neutral-200)] bg-white'
      } ${blocked ? 'opacity-50' : ''}`}
    >
      <GripVertical
        size={14}
        className="text-[var(--color-neutral-300)] shrink-0 cursor-grab"
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            enabled
              ? 'text-[var(--color-primary-700)]'
              : 'text-[var(--color-neutral-600)]'
          }`}
        >
          {meta.label}
        </p>
        {blocked && (
          <p className="text-[10px] text-[var(--color-neutral-400)] mt-0.5">
            Requires financial visibility access
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={blocked}
        onClick={() => !blocked && onToggle(widget.id, !widget.visible)}
        aria-label={`${widget.visible ? 'Hide' : 'Show'} ${meta.label}`}
        aria-pressed={widget.visible}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] ${
          enabled
            ? 'bg-[var(--color-primary-500)]'
            : 'bg-[var(--color-neutral-200)]'
        } disabled:cursor-not-allowed`}
        style={{ height: '22px' }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
          aria-hidden="true"
        />
        <span className="sr-only">{widget.visible ? 'On' : 'Off'}</span>
      </button>

      {enabled
        ? <Eye size={13} className="text-[var(--color-primary-500)] shrink-0" aria-hidden="true" />
        : <EyeOff size={13} className="text-[var(--color-neutral-300)] shrink-0" aria-hidden="true" />
      }
    </div>
  )
}

// ── Panel ──────────────────────────────────────────────────────────────────
interface WidgetSettingsPanelProps {
  open:     boolean
  onClose:  () => void
}

export function WidgetSettingsPanel({ open, onClose }: WidgetSettingsPanelProps) {
  const { config, isLoading, toggleWidget, setColumns } = useHomepageConfig()
  const panelRef = useRef<HTMLDivElement>(null)

  // Trap Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const visibleCount = config?.widgets.filter((w) => w.visible).length ?? 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Widget settings"
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[var(--color-neutral-50)] shadow-2xl flex flex-col"
        style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[var(--color-neutral-200)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
              Dashboard widgets
            </h2>
            <p className="text-[11px] text-[var(--color-neutral-400)] mt-0.5">
              {isLoading ? 'Loading…' : `${visibleCount} of ${config?.widgets.length ?? 0} visible`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close widget settings"
            className="p-1.5 rounded-lg text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {isLoading || !config ? (
            // Skeleton
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-[var(--color-neutral-100)]"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Column layout selector */}
              <div>
                <p className="text-[10px] font-semibold text-[var(--color-neutral-500)] uppercase tracking-widest mb-2">
                  Layout columns
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {COLUMN_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setColumns(value)}
                      className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                        config.columns === value
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                          : 'border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-neutral-300)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget groups */}
              {WIDGET_GROUPS.map((group) => {
                const groupWidgets = group.widgetIds
                  .map((id) => config.widgets.find((w) => w.id === id))
                  .filter((w): w is WidgetConfig => Boolean(w))
                  .sort((a, b) => a.position - b.position)

                if (groupWidgets.length === 0) return null

                return (
                  <div key={group.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-[var(--color-neutral-500)] uppercase tracking-widest">
                        {group.label}
                      </p>
                      {/* Group toggle all */}
                      <button
                        type="button"
                        onClick={async () => {
                          const anyVisible = groupWidgets.some((w) => w.visible)
                          for (const w of groupWidgets) {
                            await toggleWidget(w.id, !anyVisible)
                          }
                        }}
                        className="text-[10px] text-[var(--color-primary-600)] hover:underline font-medium"
                      >
                        {groupWidgets.some((w) => w.visible) ? 'Hide all' : 'Show all'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {groupWidgets.map((widget) => {
                        const meta = getWidgetMeta(widget.id)
                        const financiallyBlocked = !!(
                          meta?.financial &&
                          !config.financialVisibility[meta.financial]
                        )
                        return (
                          <ToggleRow
                            key={widget.id}
                            widget={widget}
                            financiallyBlocked={financiallyBlocked}
                            onToggle={toggleWidget}
                          />
                        )
                      })}
                    </div>
                    {group.note && (
                      <p className="text-[10px] text-[var(--color-neutral-400)] mt-2 leading-relaxed">
                        {group.note}
                      </p>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-white border-t border-[var(--color-neutral-200)]">
          <p className="text-[11px] text-[var(--color-neutral-400)] text-center">
            Changes save automatically
          </p>
        </div>
      </div>
    </>
  )
}