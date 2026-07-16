import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { SAVED_REPORT_ROUTE_PREFIX } from '../api/savedReport.api';
import {
  DEFAULT_SAVED_REPORT_PAGE_SIZE,
  SAVED_REPORT_TYPE_LABELS,
  SAVED_REPORT_TYPES,
  type SavedReportType,
} from '../constants/savedReport.constants';
import { useSavedReports } from '../hooks/useSavedReports';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function SavedReportListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [reportType, setReportType] = useState<SavedReportType | 'all'>('all');
  const [sharedOnly, setSharedOnly] = useState<'all' | 'yes' | 'no'>('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, reportType, sharedOnly]);

  const listParams = {
    report_type: reportType === 'all' ? undefined : reportType,
    shared_only: sharedOnly === 'all' ? undefined : sharedOnly === 'yes',
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useSavedReports(listParams);

  const filtered = useMemo(() => {
    let items = data ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false),
    );
  }, [data, debouncedSearch]);

  const pageSize = DEFAULT_SAVED_REPORT_PAGE_SIZE;
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/accounts')}
          >
            ← Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">My Reports</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Saved and shared report configurations (filters + type).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${SAVED_REPORT_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            Save report
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            placeholder="Search name or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as SavedReportType | 'all')}
          >
            <option value="all">All report types</option>
            {SAVED_REPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {SAVED_REPORT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={sharedOnly}
            onChange={(e) => setSharedOnly(e.target.value as 'all' | 'yes' | 'no')}
          >
            <option value="all">All reports</option>
            <option value="yes">Shared only</option>
            <option value="no">Private only</option>
          </select>
        </div>

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load saved reports.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <>
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-[var(--color-neutral-400)] py-10"
                    >
                      No saved reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <button
                          type="button"
                          className="text-left hover:underline font-medium"
                          onClick={() => navigate(`${SAVED_REPORT_ROUTE_PREFIX}/${r.id}`)}
                        >
                          {r.name}
                        </button>
                        {r.description ? (
                          <div className="text-xs text-[var(--color-neutral-400)]">
                            {r.description}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>{SAVED_REPORT_TYPE_LABELS[r.report_type]}</TableCell>
                      <TableCell>{r.is_shared ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{r.updated_at || r.created_at || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {total > pageSize && (
              <div className="flex items-center justify-between gap-2 text-sm text-[var(--color-neutral-500)]">
                <span>
                  Page {page} of {totalPages} ({total} reports)
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
