import { type ReactNode } from 'react';

export interface ListColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface StatusTab {
  value: string;
  label: string;
}

interface ListPageTemplateProps<T> {
  title: string;
  subtitle?: string;
  columns: ListColumn<T>[];
  data: T[];
  isLoading?: boolean;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  primaryAction?: { label: string; onClick: () => void };
  statusTabs?: StatusTab[];
  activeStatus?: string;
  onStatusChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  emptyLabel?: string;
}

export function ListPageTemplate<T>({
  title, subtitle, columns, data, isLoading, rowKey, onRowClick,
  primaryAction, statusTabs, activeStatus, onStatusChange,
  searchPlaceholder = 'Search…', searchValue, onSearchChange,
  filters, emptyLabel = 'No records found',
}: ListPageTemplateProps<T>) {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-navy">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="w-full sm:w-auto rounded-lg bg-brandOrange hover:bg-brandOrange-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + {primaryAction.label}
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6">
        {(statusTabs || onSearchChange || filters) && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            {statusTabs && (
              <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1">
                {statusTabs.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onStatusChange?.(t.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeStatus === t.value ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto w-full sm:w-auto">
              {filters}
              {onSearchChange && (
                <input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full sm:w-56 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brandOrange/30 focus:border-brandOrange"
                />
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                {columns.map((c) => (
                  <th key={c.key} className={`pb-2 font-medium whitespace-nowrap ${c.className ?? ''}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={columns.length} className="py-8 text-center text-sm text-slate-400">Loading…</td></tr>
              )}
              {!isLoading && data.length === 0 && (
                <tr><td colSpan={columns.length} className="py-8 text-center text-sm text-slate-400">{emptyLabel}</td></tr>
              )}
              {!isLoading && data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (!onRowClick) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRowClick(row)
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  className={`border-b border-slate-50 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface' : ''}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`py-3 text-slate-700 ${c.className ?? ''}`}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
