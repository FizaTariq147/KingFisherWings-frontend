/** Compact ERP form chrome — Fresa-inspired operational forms. */
export const erpForm = {
  input:
    'h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2.5 text-[13px] text-[var(--color-neutral-800)] outline-none transition-colors placeholder:text-[var(--color-neutral-400)] focus:border-[var(--fresa-action,#0A2942)] focus:ring-1 focus:ring-[var(--fresa-action-soft,#E9EEF2)]',
  textarea:
    'min-h-[4.5rem] w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2.5 py-1.5 text-[13px] text-[var(--color-neutral-800)] outline-none focus:border-[var(--fresa-action,#0A2942)] focus:ring-1 focus:ring-[var(--fresa-action-soft,#E9EEF2)]',
  label: 'mb-1 block text-[12px] font-medium text-[#334155]',
  labelInline: 'text-[12px] font-medium text-[#334155]',
  fieldError: 'mt-0.5 text-[11px] text-[var(--fresa-danger-text,var(--color-danger-700))]',
  secondaryBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm border border-[var(--fresa-secondary-border,#C9D3DF)] bg-[var(--fresa-secondary-bg,#FFFFFF)] px-3 text-[13px] font-medium text-[var(--color-neutral-800)] hover:bg-[var(--fresa-page-bg,#F4F6F9)] disabled:opacity-50',
  section:
    'overflow-hidden rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white',
  sectionHeader:
    'border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-header-bg,#E9EEF2)] px-3 py-2 text-[13px] font-semibold text-[var(--fresa-header-text,#0A2942)]',
  sectionBody: 'space-y-3 p-3',
  sectionTitle: 'text-[13px] font-semibold text-[var(--fresa-header-text,#0A2942)]',
  sectionDesc: 'mt-0.5 text-[11px] text-[var(--color-neutral-500)]',
  grid2: 'grid gap-x-4 gap-y-2.5 sm:grid-cols-2',
  grid3: 'grid gap-x-4 gap-y-2.5 sm:grid-cols-3',
  grid4: 'grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4',
  footer:
    'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2.5',
  toolbar:
    'flex flex-wrap items-center gap-1.5 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-toolbar-bg,#EEF3F9)] px-2.5 py-2',
  primaryBtn:
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm bg-[var(--fresa-action,#0A2942)] px-3 text-[13px] font-medium text-white hover:bg-[var(--fresa-action-hover,#163E60)] disabled:opacity-50',
} as const;
