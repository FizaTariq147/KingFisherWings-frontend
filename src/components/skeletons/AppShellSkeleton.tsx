import { SkeletonBlock } from './SkeletonPrimitives'

/** Renders a full AppShell-shaped skeleton matching Sidebar + Topbar + content area.
 *  Drop this wherever <AppShell> would render but auth/user data isn't ready yet.
 */
export function AppShellSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-neutral-50)]" aria-hidden="true">

      {/* Sidebar skeleton */}
      <aside
        className="hidden md:flex flex-col w-60 h-screen shrink-0 py-5 px-3 gap-4"
        style={{ background: 'var(--color-sidebar-bg)' }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-2.5 px-1 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 shrink-0" />
          <div className="h-3.5 w-24 rounded bg-white/15" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1.5 flex-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-4 h-4 rounded bg-white/15 shrink-0" />
              <div
                className="h-3 rounded bg-white/15"
                style={{ width: `${48 + (i % 3) * 16}px` }}
              />
            </div>
          ))}
        </div>

        {/* User strip */}
        <div className="flex items-center gap-2.5 px-1 pt-3 border-t border-white/10">
          <div className="w-7 h-7 rounded-full bg-white/20 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-20 rounded bg-white/15" />
            <div className="h-2 w-14 rounded bg-white/10" />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar skeleton */}
        <div className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded bg-[var(--color-neutral-100)]" />
            <div className="h-3.5 w-24 rounded bg-[var(--color-neutral-100)]" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-44 rounded-lg bg-[var(--color-neutral-100)]" />
            <div className="w-5 h-5 rounded bg-[var(--color-neutral-100)]" />
            <div className="w-8 h-8 rounded-full bg-[var(--color-neutral-100)]" />
          </div>
        </div>

        {/* Content skeleton */}
        <main className="flex-1 overflow-hidden p-4 md:p-6">
          <PageContentSkeleton />
        </main>
      </div>
    </div>
  )
}

/** Reusable content area skeleton — generic card + table layout */
export function PageContentSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-hidden="true">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="h-3 w-52" />
        </div>
        <SkeletonBlock className="h-8 w-28 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[var(--color-neutral-200)] p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <SkeletonBlock className="w-7 h-7 rounded-lg" />
              <SkeletonBlock className="h-2.5 w-20" />
            </div>
            <SkeletonBlock className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[var(--color-neutral-200)] overflow-hidden">
        {/* Table header */}
        <div className="flex gap-8 px-4 py-3 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
          {[80, 120, 64, 96, 80].map((w, i) => (
            <div key={i} className="shrink-0" style={{ width: w }}>
              <SkeletonBlock className="h-2.5 rounded" />
            </div>
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-8 px-4 py-3.5 border-b border-[var(--color-neutral-100)] last:border-0"
          >
            {[80, 120, 64, 96, 80].map((w, j) => (
              <div key={j} className="shrink-0" style={{ width: w - (i % 2) * 12 }}>
                <SkeletonBlock className="h-3 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}