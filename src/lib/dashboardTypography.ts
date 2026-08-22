/** Shared dashboard typography — admin, customer portal, and vendor portal use the same scale. */
export const dashType = {
  header: {
    date: 'text-[11px] font-semibold tracking-[0.14em] text-[var(--color-neutral-400)]',
    title:
      'mt-1 text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)] sm:text-[28px]',
    subtitle: 'mt-1 text-sm text-[var(--color-neutral-500)]',
    periodWrap:
      'inline-flex shrink-0 rounded-full border border-[var(--color-neutral-200)] bg-white p-1 shadow-sm',
    periodBtn: 'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
    periodBtnActive: 'bg-[var(--color-primary)] text-white',
    periodBtnIdle: 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]',
  },
  alertPill: {
    base: 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
    count: 'rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold',
  },
  kpi: {
    card:
      'flex h-full min-h-[148px] flex-col rounded-[20px] border p-5 shadow-[0_10px_30px_rgba(10,41,66,0.06)] transition-shadow hover:shadow-[0_12px_28px_rgba(10,41,66,0.1)]',
    label: 'text-[13px] font-medium',
    value: 'text-[32px] font-semibold leading-none tracking-tight',
    unit: 'text-[13px]',
    caption: 'mt-3 text-[11px] leading-4',
    badge: 'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
    iconWrap: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
  },
  panel: {
    title: 'text-sm font-semibold text-[var(--color-neutral-900)]',
    subtitle: 'mt-0.5 text-[11px] text-[var(--color-neutral-500)]',
    body: 'text-sm leading-snug text-[var(--color-neutral-600)]',
    meta: 'text-[11px] text-[var(--color-neutral-500)]',
    rowTitle: 'text-sm font-semibold text-[var(--color-neutral-900)]',
    rowMeta: 'mt-0.5 text-[11px] text-[var(--color-neutral-500)]',
    empty:
      'rounded-xl bg-[var(--color-neutral-50)] px-3 py-6 text-center text-sm text-[var(--color-neutral-500)]',
    linkAction: 'text-xs font-semibold',
    filterChip: 'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
  },
} as const;
