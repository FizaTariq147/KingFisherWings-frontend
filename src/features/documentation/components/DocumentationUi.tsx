import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import type { DocumentationRecord } from '../types/documentation.types';
import {
  columnsFromRecords,
  displayRecordValue,
  formatColumnLabel,
} from '../utils/normalizeDocumentation';

export function DocumentationListState({
  loading,
  error,
  empty,
  emptyMessage = 'No records found.',
}: {
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-red-600">
        {extractAxiosErrorDetail(error)}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  return null;
}

export function DocumentationRecordTable({
  rows,
  preferredColumns = [],
  actionColumn,
}: {
  rows: DocumentationRecord[];
  preferredColumns?: string[];
  actionColumn?: (row: DocumentationRecord) => ReactNode;
}) {
  const columns = columnsFromRecords(rows, preferredColumns);
  if (rows.length === 0 || columns.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {formatColumnLabel(col)}
              </th>
            ))}
            {actionColumn ? (
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm text-gray-700">
                  {displayRecordValue(row[col])}
                </td>
              ))}
              {actionColumn ? <td className="px-4 py-2 text-sm">{actionColumn(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const documentationThClass =
  'px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500';
export const documentationTdClass = 'px-4 py-2 text-sm text-gray-700';
