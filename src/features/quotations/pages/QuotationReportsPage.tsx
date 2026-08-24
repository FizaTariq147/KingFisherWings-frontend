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
import { STATUS_LABELS, JOB_TYPE_LABELS, type JobType, type QuotationStatus } from '../constants/quotation.constants';
import {
  useQuotationAnalytics,
  useQuotationChargewiseReport,
  useQuotationConversion,
  useQuotationLostReasons,
  useQuotationResponseTime,
} from '../hooks/useQuotationReports';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  columnsFromRows,
  extractReportMetrics,
  extractReportRows,
  formatReportCell,
  formatReportLabel,
  normalizeChargewiseRows,
} from '../utils/normalizeQuotationReports';

type ReportTab =
  | 'chargewise'
  | 'analytics'
  | 'conversion'
  | 'lost-reasons'
  | 'response-time';

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'chargewise', label: 'Chargewise' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'conversion', label: 'Conversion' },
  { key: 'lost-reasons', label: 'Lost reasons' },
  { key: 'response-time', label: 'Response time' },
];

function displayCell(key: string, value: unknown): string {
  if (key === 'status' && typeof value === 'string') {
    return STATUS_LABELS[value as QuotationStatus] ?? formatReportLabel(value);
  }
  if ((key === 'job_type' || key === 'service_type') && typeof value === 'string') {
    return JOB_TYPE_LABELS[value as JobType] ?? formatReportLabel(value);
  }
  return formatReportCell(value);
}

function ReportState({
  loading,
  error,
  empty,
  children,
}: {
  loading: boolean;
  error: unknown;
  empty: boolean;
  children: ReactNode;
}) {
  if (loading) {
    return <p className="text-sm text-[var(--color-neutral-400)] py-6">Loading…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-[var(--color-danger-600)] py-4">{getErrorMessage(error)}</p>
    );
  }
  if (empty) {
    return <p className="text-sm text-[var(--color-neutral-400)] py-6">No data for the selected filters.</p>;
  }
  return <>{children}</>;
}

function MetricCards({ metrics }: { metrics: Array<{ key: string; label: string; value: string }> }) {
  if (metrics.length === 0) return null;

  const cardStyles = [
    'border-sky-200 bg-sky-50 text-sky-900',
    'border-emerald-200 bg-emerald-50 text-emerald-900',
    'border-amber-200 bg-amber-50 text-amber-900',
    'border-violet-200 bg-violet-50 text-violet-900',
    'border-rose-200 bg-rose-50 text-rose-900',
    'border-cyan-200 bg-cyan-50 text-cyan-900',
    'border-orange-200 bg-orange-50 text-orange-900',
    'border-indigo-200 bg-indigo-50 text-indigo-900',
  ];
  const labelStyles = [
    'text-sky-700',
    'text-emerald-700',
    'text-amber-700',
    'text-violet-700',
    'text-rose-700',
    'text-cyan-700',
    'text-orange-700',
    'text-indigo-700',
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {metrics.map((metric, index) => {
        const style = cardStyles[index % cardStyles.length]!;
        const labelStyle = labelStyles[index % labelStyles.length]!;
        return (
          <div
            key={metric.key}
            className={`rounded-lg border px-3 py-3 shadow-sm ${style}`}
          >
            <p className={`text-[11px] font-medium uppercase tracking-wide ${labelStyle}`}>
              {metric.label}
            </p>
            <p className="mt-1 text-base font-semibold tabular-nums">{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}

function ReportTable({
  rows,
  preferredColumns = [],
}: {
  rows: Record<string, unknown>[];
  preferredColumns?: string[];
}) {
  const columns = useMemo(
    () => columnsFromRows(rows, preferredColumns),
    [rows, preferredColumns],
  );

  if (rows.length === 0 || columns.length === 0) return null;

  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead key={col}>{formatReportLabel(col)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={String(row.id ?? index)}>
            {columns.map((col) => (
              <TableCell key={col} mono={typeof row[col] === 'number'}>
                {displayCell(col, row[col])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AnalyticsPanel({
  data,
  loading,
  error,
  preferredColumns = [],
}: {
  data: unknown;
  loading: boolean;
  error: unknown;
  preferredColumns?: string[];
}) {
  const metrics = useMemo(() => extractReportMetrics(data), [data]);
  const rows = useMemo(() => extractReportRows(data), [data]);
  const empty = !loading && !error && metrics.length === 0 && rows.length === 0;

  return (
    <ReportState loading={loading} error={error} empty={empty}>
      <div className="space-y-4">
        <MetricCards metrics={metrics} />
        <ReportTable rows={rows} preferredColumns={preferredColumns} />
      </div>
    </ReportState>
  );
}

export default function QuotationReportsPage() {
  const [tab, setTab] = useState<ReportTab>('chargewise');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filters = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const chargewise = useQuotationChargewiseReport(
    { ...filters, page: 1, limit: 50, order: 'desc' },
    tab === 'chargewise',
  );
  const analytics = useQuotationAnalytics(filters, tab === 'analytics');
  const conversion = useQuotationConversion(filters, tab === 'conversion');
  const lostReasons = useQuotationLostReasons(filters, tab === 'lost-reasons');
  const responseTime = useQuotationResponseTime(filters, tab === 'response-time');

  const chargewiseRows = useMemo(
    () => normalizeChargewiseRows(chargewise.data?.items ?? []),
    [chargewise.data?.items],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <ReportsBackButton fallbackTo="/quotations" fallbackLabel="Back to Quotations" />
          <h2 className="text-sm font-semibold text-[var(--color-neutral-800)]">
            Quotation reports
          </h2>
          <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
            Chargewise listing, conversion, lost reasons, and response time.
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="space-y-1">
            <span className="text-xs text-[var(--color-neutral-500)]">From</span>
            <input
              type="date"
              className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-[var(--color-neutral-500)]">To</span>
            <input
              type="date"
              className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void chargewise.refetch();
              void analytics.refetch();
              void conversion.refetch();
              void lostReasons.refetch();
              void responseTime.refetch();
            }}
          >
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[var(--color-neutral-200)] pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                tab === t.key
                  ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-medium'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'chargewise' && (
          <div className="space-y-3">
            {chargewise.data?.meta ? (
              <p className="text-xs text-[var(--color-neutral-500)]">
                Showing {chargewiseRows.length} row(s)
                {typeof chargewise.data.meta.total === 'number'
                  ? ` · ${chargewise.data.meta.total} total`
                  : ''}
              </p>
            ) : null}
            <ReportState
              loading={chargewise.isLoading}
              error={chargewise.error}
              empty={chargewiseRows.length === 0}
            >
              <ReportTable
                rows={chargewiseRows}
                preferredColumns={[
                  'quotation_number',
                  'customer',
                  'status',
                  'job_type',
                  'date',
                  'charge',
                  'qty',
                  'sale_rate',
                  'amount',
                  'currency',
                  'total',
                  'gp',
                ]}
              />
            </ReportState>
          </div>
        )}

        {tab === 'analytics' && (
          <AnalyticsPanel
            data={analytics.data}
            loading={analytics.isLoading}
            error={analytics.error}
          />
        )}

        {tab === 'conversion' && (
          <AnalyticsPanel
            data={conversion.data}
            loading={conversion.isLoading}
            error={conversion.error}
            preferredColumns={['status', 'count', 'rate', 'percentage', 'job_type']}
          />
        )}

        {tab === 'lost-reasons' && (
          <AnalyticsPanel
            data={lostReasons.data}
            loading={lostReasons.isLoading}
            error={lostReasons.error}
            preferredColumns={['reason', 'lost_reason', 'count', 'total', 'percentage', 'rate']}
          />
        )}

        {tab === 'response-time' && (
          <AnalyticsPanel
            data={responseTime.data}
            loading={responseTime.isLoading}
            error={responseTime.error}
            preferredColumns={['metric', 'hours', 'avg_hours', 'average_hours', 'count']}
          />
        )}
      </Card>
    </div>
  );
}
