// PASTE THIS AT: src/components/templates/ListPageTemplate.tsx
// (new folder — sits alongside components/layout, components/ui, etc.)
//
// NOTE: this renders its own <table> markup rather than assuming your
// components/ui/Table's exact prop API, since that wasn't visible from here.
// If your Table already handles sorting/pagination, swap the <table> block
// below for <Table columns={columns} data={data} /> and keep everything else.

import { type ReactNode, useState } from 'react';

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
  filters?: ReactNode; // slot for module-specific filter controls
  emptyLabel?: string;
}

export function ListPageTemplate<T>({
  title, subtitle, columns, data, isLoading, rowKey, onRowClick,
  primaryAction, statusTabs, activeStatus, onStatusChange,
  searchPlaceholder = 'Search…', searchValue, onSearchChange,
  filters, emptyLabel = 'No records found',
}: ListPageTemplateProps<T>) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-navy">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="rounded-lg bg-brandOrange hover:bg-brandOrange-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + {primaryAction.label}
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        {(statusTabs || onSearchChange || filters) && (
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            {statusTabs && (
              <div className="flex gap-1 rounded-lg bg-surface p-1">
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
            <div className="flex items-center gap-3 ml-auto">
              {filters}
              {onSearchChange && (
                <input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brandOrange/30 focus:border-brandOrange w-56"
                />
              )}
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              {columns.map((c) => (
                <th key={c.key} className={`pb-2 font-medium ${c.className ?? ''}`}>{c.label}</th>
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
                className={`border-b border-slate-50 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`py-3 text-slate-700 ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : String((row as any)[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}