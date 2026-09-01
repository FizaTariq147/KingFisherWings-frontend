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
import { NVOCC_VOYAGE_STATUSES } from '@/features/nvocc/constants/nvocc.constants';
import { useNvoccVoyages } from '@/features/nvocc/hooks/useNvocc';
import {
  useNvoccEnquiryAnalytics,
  useNvoccTradeLaneReport,
  useNvoccUtilizationReport,
  useNvoccVoyagePnl,
} from '@/features/nvocc/hooks/useNvoccReports';
import type { NvoccVoyageStatus } from '@/features/nvocc/constants/nvocc.constants';
import { nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import {
  columnsFromRows,
  extractReportMetrics,
  extractReportRows,
  formatReportCell,
  formatReportLabel,
} from '@/features/nvocc/utils/normalizeNvoccReports';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

type ReportTab = 'trade-lane' | 'utilization' | 'enquiries' | 'voyage-pnl';

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'trade-lane', label: 'Trade lane profitability' },
  { key: 'utilization', label: 'Voyage utilization' },
  { key: 'enquiries', label: 'Enquiry analytics' },
  { key: 'voyage-pnl', label: 'Voyage P&L' },
];

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
  ];
  const labelStyles = [
    'text-sky-700',
    'text-emerald-700',
    'text-amber-700',
    'text-violet-700',
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {metrics.map((metric, index) => {
        const style = cardStyles[index % cardStyles.length]!;
        const labelStyle = labelStyles[index % labelStyles.length]!;
        return (
          <div key={metric.key} className={`rounded-lg border px-3 py-3 shadow-sm ${style}`}>
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
                {formatReportCell(row[col])}
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

export default function NvoccReportsPage() {
  const [tab, setTab] = useState<ReportTab>('trade-lane');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [voyageStatus, setVoyageStatus] = useState<NvoccVoyageStatus | ''>('');
  const [selectedVoyageId, setSelectedVoyageId] = useState('');

  const tradeLaneFilters = {
    from: fromDate || undefined,
    to: toDate || undefined,
    group_by: groupBy || undefined,
  };

  const utilizationFilters = {
    from: fromDate || undefined,
    voyage_status: voyageStatus || undefined,
  };

  const enquiryFilters = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const tradeLane = useNvoccTradeLaneReport(tradeLaneFilters, tab === 'trade-lane');
  const utilization = useNvoccUtilizationReport(utilizationFilters, tab === 'utilization');
  const enquiries = useNvoccEnquiryAnalytics(enquiryFilters, tab === 'enquiries');
  const voyages = useNvoccVoyages({}, { enabled: tab === 'voyage-pnl' });
  const voyagePnl = useNvoccVoyagePnl(selectedVoyageId, {
    enabled: tab === 'voyage-pnl' && Boolean(selectedVoyageId),
  });

  const voyageOptions = voyages.data?.items ?? [];

  const refresh = () => {
    void tradeLane.refetch();
    void utilization.refetch();
    void enquiries.refetch();
    if (selectedVoyageId) void voyagePnl.refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <ReportsBackButton fallbackTo="/nvocc" fallbackLabel="Back to NVOCC" />
          <h2 className="text-sm font-semibold text-[var(--color-neutral-800)]">NVOCC reports</h2>
          <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
            Trade lane profitability, voyage utilization, enquiry analytics, and voyage P&L.
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          {(tab === 'trade-lane' || tab === 'utilization' || tab === 'enquiries') && (
            <>
              <label className="space-y-1">
                <span className="text-xs text-[var(--color-neutral-500)]">From</span>
                <input
                  type="date"
                  className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              {(tab === 'trade-lane' || tab === 'enquiries') && (
                <label className="space-y-1">
                  <span className="text-xs text-[var(--color-neutral-500)]">To</span>
                  <input
                    type="date"
                    className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </label>
              )}
            </>
          )}

          {tab === 'trade-lane' && (
            <label className="space-y-1">
              <span className="text-xs text-[var(--color-neutral-500)]">Group by</span>
              <input
                type="text"
                placeholder="e.g. pol, pod"
                className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              />
            </label>
          )}

          {tab === 'utilization' && (
            <label className="space-y-1">
              <span className="text-xs text-[var(--color-neutral-500)]">Voyage status</span>
              <select
                className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm min-w-[160px]"
                value={voyageStatus}
                onChange={(e) => setVoyageStatus(e.target.value as NvoccVoyageStatus | '')}
              >
                <option value="">All statuses</option>
                {NVOCC_VOYAGE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
          )}

          {tab === 'voyage-pnl' && (
            <label className="space-y-1 min-w-[240px]">
              <span className="text-xs text-[var(--color-neutral-500)]">Voyage</span>
              <select
                className="h-9 block w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                value={selectedVoyageId}
                onChange={(e) => setSelectedVoyageId(e.target.value)}
              >
                <option value="">Select voyage…</option>
                {voyageOptions.map((voyage) => (
                  <option key={voyage.id} value={voyage.id}>
                    {nvoccDisplayNumber(voyage, 'Voyage')}
                    {voyage.pol_name || voyage.pod_name
                      ? ` · ${voyage.pol_name ?? '—'} → ${voyage.pod_name ?? '—'}`
                      : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          <Button type="button" variant="secondary" onClick={refresh}>
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

        {tab === 'trade-lane' && (
          <AnalyticsPanel
            data={tradeLane.data}
            loading={tradeLane.isLoading}
            error={tradeLane.error}
            preferredColumns={[
              'trade_lane',
              'pol',
              'pod',
              'revenue',
              'cost',
              'profit',
              'margin',
              'teu',
              'bookings',
              'jobs',
            ]}
          />
        )}

        {tab === 'utilization' && (
          <AnalyticsPanel
            data={utilization.data}
            loading={utilization.isLoading}
            error={utilization.error}
            preferredColumns={[
              'voyage_number',
              'vessel',
              'pol',
              'pod',
              'allocated',
              'booked',
              'utilization',
              'status',
            ]}
          />
        )}

        {tab === 'enquiries' && (
          <AnalyticsPanel
            data={enquiries.data}
            loading={enquiries.isLoading}
            error={enquiries.error}
            preferredColumns={['status', 'count', 'rate', 'percentage', 'cargo_type', 'trade_lane']}
          />
        )}

        {tab === 'voyage-pnl' && (
          <>
            {!selectedVoyageId ? (
              <p className="text-sm text-[var(--color-neutral-400)] py-6">
                Select a voyage to view P&L.
              </p>
            ) : (
              <AnalyticsPanel
                data={voyagePnl.data}
                loading={voyagePnl.isLoading}
                error={voyagePnl.error}
                preferredColumns={[
                  'revenue',
                  'cost',
                  'profit',
                  'margin',
                  'currency',
                  'line_item',
                  'description',
                  'amount',
                ]}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
