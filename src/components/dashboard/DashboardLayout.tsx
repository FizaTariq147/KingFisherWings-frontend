import { Suspense, useState } from 'react'
import { Settings, X, Eye, EyeOff } from 'lucide-react'
import { useHomepageConfig } from '@/hooks/useHomepageConfig'
import { getWidgetMeta } from './widgetRegistry'
import type { WidgetConfig } from '@/types/homepage.types'

// ── Widget skeleton for Suspense fallback ──────────────────────────────────
function WidgetSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 animate-pulse">
      <div className="h-3 w-24 bg-[var(--color-neutral-100)] rounded mb-4" />
      <div className="h-8 w-16 bg-[var(--color-neutral-100)] rounded" />
    </div>
  )
}

// ── Customise panel ────────────────────────────────────────────────────────
interface CustomisePanelProps {
  widgets: WidgetConfig[]
  onToggle: (id: WidgetConfig['id'], visible: boolean) => Promise<void>
  onClose: () => void
}

function CustomisePanel({ widgets, onToggle, onClose }: CustomisePanelProps) {
  return (
    <div className="mb-6 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-neutral-800)]">
          Customise dashboard
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close customise panel"
          className="p-1 rounded text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] transition-colors"
        >
          <X size={15} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {widgets.map((w) => {
          const meta = getWidgetMeta(w.id)
          if (!meta) return null
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onToggle(w.id, !w.visible)}
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                w.visible
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                  : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:border-[var(--color-neutral-300)]',
              ].join(' ')}
            >
              {w.visible
                ? <Eye size={12} aria-hidden="true" />
                : <EyeOff size={12} aria-hidden="true" />}
              {meta.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── DashboardLayout ────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const { config, isLoading, error, toggleWidget } = useHomepageConfig()
  const [customising, setCustomising] = useState(false)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <WidgetSkeleton key={i} />)}
      </div>
    )
  }

  if (!config) return null

  const colClass: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  // Sorted, visible, and financial-visibility-gated widgets
  const renderableWidgets = config.widgets
    .filter((w) => {
      if (!w.visible) return false
      const meta = getWidgetMeta(w.id)
      if (!meta) return false
      if (meta.financial && !config.financialVisibility[meta.financial]) return false
      return true
    })
    .sort((a, b) => a.position - b.position)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-[var(--color-neutral-900)]">Dashboard</h1>
          {error && (
            <p className="text-xs text-[var(--color-danger-500)] mt-0.5">{error}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCustomising((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-neutral-200)] text-xs font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <Settings size={13} aria-hidden="true" />
          Customise
        </button>
      </div>

      {/* Customise panel */}
      {customising && (
        <CustomisePanel
          widgets={config.widgets}
          onToggle={toggleWidget}
          onClose={() => setCustomising(false)}
        />
      )}

      {/* Widget grid */}
      <div className={`grid ${colClass[config.columns] ?? colClass[3]} gap-4`}>
        {renderableWidgets.map((w) => {
          const meta = getWidgetMeta(w.id)
          if (!meta) return null
          const { Component } = meta
          return (
            <div
              key={w.id}
              className={w.size === 'full' ? 'col-span-full' : ''}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <Component />
              </Suspense>
            </div>
          )
        })}
        {renderableWidgets.length === 0 && !customising && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[var(--color-neutral-400)] mb-3">
              No widgets visible. Customise your dashboard to add some.
            </p>
            <button
              type="button"
              onClick={() => setCustomising(true)}
              className="text-xs font-medium text-[var(--color-primary-600)] hover:underline"
            >
              Open customise panel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}