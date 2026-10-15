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
    'inline-flex items-center gap-1.5 rounded-sm border border-[var(--btn-create-border,#061B2C)] bg-[var(--btn-create-bg,#0A2942)] px-3 py-1.5 text-[13px] font-medium text-[var(--btn-create-text,#FFFFFF)] transition-colors hover:bg-[var(--btn-create-hover,#163E60)]',
} as const;

export const listShell = {
  page: 'space-y-2.5',
  /** Card chrome aligned with Enquiry Sheet (`border-gray-200 rounded-md`). */
  card: 'bg-white border border-gray-200 rounded-md shadow-none',
  header:
    'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-3 border-b border-gray-200 bg-white',
  toolbar:
    'flex flex-wrap items-center justify-between gap-2 px-5 py-2 border-b border-gray-200 bg-white',
  table: 'w-full text-[13px]',
  row: 'border-b border-[#e8edf2] hover:bg-[var(--fresa-row-hover,#F5F9FC)]',
  empty: 'text-center py-10 text-[13px] text-gray-500',
} as const;

export const erpTable = {
  th: 'text-left font-semibold text-[var(--fresa-header-text,#0A2942)] px-3 py-2 whitespace-nowrap text-[11px] uppercase tracking-wide border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-thead-bg,#E9EEF2)]',
  td: 'px-3 py-1.5 text-[13px] text-[#334155] align-middle',
  row: 'border-b border-[#e8edf2] hover:bg-[var(--fresa-row-hover,#F5F9FC)]',
} as const;
