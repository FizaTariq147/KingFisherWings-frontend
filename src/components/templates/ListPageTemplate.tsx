import { type ReactNode } from 'react';
import { AppLoadingState, AppFetchBar } from '@/components/motion';
import { appType, listShell } from '@/lib/erpTypography';

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
  isFetching?: boolean;
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

/** List chrome aligned with HR Employees List (`/hr/employee-master`). */
export function ListPageTemplate<T>({
  title,
  subtitle,
  columns,
  data,
  isLoading,
  isFetching,
  rowKey,
  onRowClick,
  primaryAction,
  statusTabs,
  activeStatus,
  onStatusChange,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters,
  emptyLabel = 'No data found',
}: ListPageTemplateProps<T>) {
  return (
    <div className={listShell.page}>
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>{title}</h2>
            {subtitle ? <p className={appType.pageSubtitle}>{subtitle}</p> : null}
          </div>
          {primaryAction ? (
            <button type="button" onClick={primaryAction.onClick} className={appType.listCreateBtn}>
              + {primaryAction.label}
            </button>
          ) : null}
        </div>

        {(statusTabs || onSearchChange || filters) && (
          <div className={listShell.toolbar}>
            {statusTabs ? (
              <div className="flex flex-wrap gap-1">
                {statusTabs.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => onStatusChange?.(t.value)}
                    className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeStatus === t.value
                        ? 'bg-[#0A2942] text-white'
                        : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ) : (
              <div />
            )}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto w-full sm:w-auto">
              {filters}
              {onSearchChange ? (
                <input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full sm:w-56 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
                />
              ) : null}
            </div>
          </div>
        )}

        <AppFetchBar active={Boolean(isFetching && !isLoading)} />
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="px-5 py-10">
              <AppLoadingState />
            </div>
          ) : (
            <table className={listShell.table}>
              <thead>
                <tr className="border-b border-gray-200">
                  {columns.map((c) => (
                    <th key={c.key} className={`${appType.tableHead} ${c.className ?? ''}`}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className={listShell.empty}>
                      {emptyLabel}
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr
                      key={rowKey(row)}
                      onClick={() => onRowClick?.(row)}
                      onKeyDown={(e) => {
                        if (!onRowClick) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }}
                      tabIndex={onRowClick ? 0 : undefined}
                      role={onRowClick ? 'button' : undefined}
                      className={`${listShell.row} ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={`px-4 py-2 ${appType.body} ${c.className ?? ''}`}
                        >
                          {c.render
                            ? c.render(row)
                            : String((row as Record<string, unknown>)[c.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
