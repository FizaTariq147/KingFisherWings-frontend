import { useMemo, useState, type ReactNode } from 'react';
import { ReportsBackButton } from '@/features/reports/components/ReportsBackButton';
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
import {
  useDocumentationEtaFollowupReport,
  useDocumentationEtdFollowupReport,
  useDocumentationJobsListReport,
  useDocumentationManifestStatusReport,
  useDocumentationReportSummary,
} from '@/features/documentation/hooks/useDocumentationReports';
import {
  columnsFromRows,
  extractReportMetrics,
  extractReportRows,
  formatReportCell,
  formatReportLabel,
} from '@/features/documentation/utils/normalizeDocumentation';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

type ReportTab = 'summary' | 'jobs-list' | 'eta' | 'etd' | 'manifest';

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'jobs-list', label: 'Jobs list' },
  { key: 'eta', label: 'ETA follow-up' },
  { key: 'etd', label: 'ETD follow-up' },
  { key: 'manifest', label: 'Manifest status' },
];

function ReportState({ loading, error, empty, children }: { loading: boolean; error: unknown; empty: boolean; children: ReactNode }) {
  if (loading) return <p className="py-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  if (error) return <p className="py-4 text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>;
  if (empty) return <p className="py-6 text-sm text-[var(--color-neutral-400)]">No data for the selected filters.</p>;
  return <>{children}</>;
}

function AnalyticsPanel({ data, loading, error }: { data: unknown; loading: boolean; error: unknown }) {
  const metrics = useMemo(() => extractReportMetrics(data), [data]);
  const rows = useMemo(() => extractReportRows(data), [data]);
  const columns = useMemo(() => columnsFromRows(rows), [rows]);
  const empty = !loading && !error && metrics.length === 0 && rows.length === 0;

  return (
    <ReportState loading={loading} error={error} empty={empty}>
      <div className="space-y-4">
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.key} className="rounded-lg border px-3 py-3">
                <p className="text-[11px] uppercase text-gray-500">{m.label}</p>
                <p className="mt-1 text-base font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {rows.length > 0 && columns.length > 0 ? (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{formatReportLabel(col)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col}>{formatReportCell(row[col])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </ReportState>
  );
}

export default function DocumentationReportsPage() {
  const [tab, setTab] = useState<ReportTab>('summary');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const filters = { from_date: fromDate || undefined, to_date: toDate || undefined, page: 1, limit: 50 };

  const summary = useDocumentationReportSummary(filters, tab === 'summary');
  const jobsList = useDocumentationJobsListReport(filters, tab === 'jobs-list');
  const eta = useDocumentationEtaFollowupReport(filters, tab === 'eta');
  const etd = useDocumentationEtdFollowupReport(filters, tab === 'etd');
  const manifest = useDocumentationManifestStatusReport(filters, tab === 'manifest');

  const active =
    tab === 'summary' ? summary : tab === 'jobs-list' ? jobsList : tab === 'eta' ? eta : tab === 'etd' ? etd : manifest;

  return (
    <div className="space-y-4">
      <ReportsBackButton fallbackTo="/documentation" fallbackLabel="Back to Documentation" />
      <h2 className="text-sm font-semibold text-[var(--color-neutral-800)]">Documentation reports</h2>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="text-xs text-gray-500">From</span>
            <input type="date" className="h-9 rounded-md border px-3 text-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">To</span>
            <input type="date" className="h-9 rounded-md border px-3 text-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <Button type="button" variant="secondary" onClick={() => void active.refetch()}>Refresh</Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-sm ${tab === t.key ? 'bg-[var(--color-primary-100)] font-medium text-[var(--color-primary-700)]' : 'text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnalyticsPanel data={active.data} loading={active.isLoading} error={active.error} />
      </Card>
    </div>
  );
}
