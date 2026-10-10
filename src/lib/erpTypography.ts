/**
 * Shared ERP typography — Fresa-inspired continuum chrome.
 */
export const appType = {
  pageTitle: 'text-[17px] font-medium text-[#1E293B]',
  pageSubtitle: 'mt-0.5 text-sm text-gray-500',
  sectionTitle: 'text-[17px] font-medium text-[#1E293B]',
  cardTitle: 'text-sm font-semibold text-[#1E293B]',
  modalTitle: 'text-[17px] font-medium text-[#1E293B]',
  backLink:
    'text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors',
  body: 'text-sm text-gray-700',
  tableHead:
    'text-left font-semibold text-[var(--fresa-header-text,#0A2942)] px-4 py-2.5 whitespace-nowrap text-sm',
  listCreateBtn:
    'inline-flex items-center gap-1.5 bg-[var(--fresa-action,#0A2942)] hover:bg-[var(--fresa-action-hover,#163E60)] text-white text-[13px] px-3 py-1.5 rounded-sm transition-colors',
} as const;

export const listShell = {
  page: 'space-y-2.5',
  card: 'bg-white border border-[var(--fresa-border,#C9D3DF)] rounded-sm shadow-none',
  header:
    'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2.5 border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)]',
  toolbar:
    'flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--fresa-border,#C9D3DF)] bg-white',
  table: 'w-full text-[13px]',
  row: 'border-b border-[#e8edf2] hover:bg-[var(--fresa-row-hover,#F5F9FC)]',
  empty: 'text-center py-10 text-[13px] text-gray-500',
} as const;

export const erpTable = {
  th: 'text-left font-semibold text-[var(--fresa-header-text,#0A2942)] px-3 py-2 whitespace-nowrap text-[11px] uppercase tracking-wide border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-thead-bg,#E9EEF2)]',
  td: 'px-3 py-1.5 text-[13px] text-[#334155] align-middle',
  row: 'border-b border-[#e8edf2] hover:bg-[var(--fresa-row-hover,#F5F9FC)]',
} as const;
