/** Compact ERP form chrome — Fresa-inspired operational forms. */
export const erpForm = {
  input:
    'h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2.5 text-[13px] text-[var(--color-neutral-800)] outline-none transition-colors placeholder:text-[var(--color-neutral-400)] focus:border-[var(--fresa-action,#0A2942)] focus:ring-1 focus:ring-[var(--fresa-action-soft,#E9EEF2)]',
  textarea:
    'min-h-[4.5rem] w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2.5 py-1.5 text-[13px] text-[var(--color-neutral-800)] outline-none focus:border-[var(--fresa-action,#0A2942)] focus:ring-1 focus:ring-[var(--fresa-action-soft,#E9EEF2)]',
  label: 'mb-1 block text-[12px] font-medium text-[#334155]',
  labelInline: 'text-[12px] font-medium text-[#334155]',
  fieldError: 'mt-0.5 text-[11px] text-[var(--fresa-danger-text,var(--color-danger-700))]',
  /** Prefer `<Button variant="secondary" />` when possible; kept for raw `<button>` chrome. */
  secondaryBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-3 text-[13px] font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-secondary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]',
  section:
    'overflow-hidden rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white',
  sectionHeader:
    'border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-header-bg,#E9EEF2)] px-3 py-2 text-[13px] font-semibold text-[var(--fresa-header-text,#0A2942)]',
  sectionBody: 'space-y-3 p-3',
  sectionTitle: 'text-[13px] font-semibold text-[var(--fresa-header-text,#0A2942)]',
  sectionDesc: 'mt-0.5 text-[11px] text-[var(--color-neutral-500)]',
  grid2: 'grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2',
  /** Fresa Show All / detail fields — three columns on tablet+. */
  grid3: 'grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3',
  grid4: 'grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4',
  footer:
    'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2.5',
  toolbar:
    'flex flex-wrap items-center gap-1.5 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-toolbar-bg,#EEF3F9)] px-2.5 py-2',
  /** Prefer `<Button variant="primary" />` when possible; kept for raw `<button>` chrome. */
  primaryBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-primary-bg)] px-3 text-[13px] font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] active:bg-[var(--btn-primary-active)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]',
  successBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-success-bg)] px-3 text-[13px] font-medium text-[var(--btn-success-text)] transition-colors hover:bg-[var(--btn-success-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-success-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]',
  warningBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-warning-bg)] px-3 text-[13px] font-medium text-[var(--btn-warning-text)] transition-colors hover:bg-[var(--btn-warning-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-warning-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]',
  dangerBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-danger-bg)] px-3 text-[13px] font-medium text-[var(--btn-danger-text)] transition-colors hover:bg-[var(--btn-danger-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-danger-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]',
} as const;
