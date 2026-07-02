import { Suspense, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useHomepageConfig } from '@/hooks/useHomepageConfig'
import { getWidgetMeta } from './widgetRegistry'
import { WidgetSettingsPanel } from './WidgetSettingsPanel'

function WidgetSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 animate-pulse">
      <div className="h-3 w-24 bg-[var(--color-neutral-100)] rounded mb-4" />
      <div className="h-8 w-16 bg-[var(--color-neutral-100)] rounded" />
    </div>
  )
}

export default function DashboardLayout() {
  const { config, isLoading, error } = useHomepageConfig()
  const [settingsOpen, setSettingsOpen] = useState(false)

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
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-neutral-200)] text-xs font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <SlidersHorizontal size={13} aria-hidden="true" />
          Customise
        </button>
      </div>

      {/* Widget grid */}
      <div className={`grid ${colClass[config.columns] ?? colClass[3]} gap-4`}>
        {renderableWidgets.map((w) => {
          const meta = getWidgetMeta(w.id)
          if (!meta) return null
          const { Component } = meta
          return (
            <div key={w.id} className={w.size === 'full' ? 'col-span-full' : ''}>
              <Suspense fallback={<WidgetSkeleton />}>
                <Component />
              </Suspense>
            </div>
          )
        })}

        {renderableWidgets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[var(--color-neutral-400)] mb-3">
              No widgets visible. Customise your dashboard to add some.
            </p>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="text-xs font-medium text-[var(--color-primary-600)] hover:underline"
            >
              Open widget settings
            </button>
          </div>
        )}
      </div>

      {/* Slide-in settings panel */}
      <WidgetSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}