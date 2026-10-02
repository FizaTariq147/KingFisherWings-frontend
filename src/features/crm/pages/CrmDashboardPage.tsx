import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  CRM_REPORT_TYPES,
  crmLabel,
  type CrmReportType,
} from '../constants/crm.constants';
import { useCrmDashboard, useCrmReport } from '../hooks/useCrmDashboard';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, TextInput } from '../components/CrmUi';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  crmReportColumns,
  crmReportSummaryMetrics,
  filterCrmReportRows,
  formatCrmReportCell,
  normalizeCrmReportRows,
} from '../utils/normalizeCrmReport';
import type { DashboardParams } from '../types/crm.types';

const PERIOD_OPTIONS = [
  { value: '30d', label: 'Last 30 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'custom', label: 'Custom range' },
] as const;

function isReportType(value: string | null): value is CrmReportType {
  return Boolean(value && (CRM_REPORT_TYPES as readonly string[]).includes(value));
}

export default function CrmDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReport = searchParams.get('report');

  const [period, setPeriod] = useState<'7d' | '30d' | 'mtd' | 'custom'>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [selected, setSelected] = useState<CrmReportType | null>(
    isReportType(initialReport) ? initialReport : null,
  );
  const [reportRaw, setReportRaw] = useState<unknown>(null);

  const dashboardParams: DashboardParams = useMemo(() => {
    const params: DashboardParams = {
      salesperson_id: salesperson || undefined,
    };
    if (period === 'custom') {
      params.period = 'custom';
      params.from = from || undefined;
      params.to = to || undefined;
    } else {
      params.period = period;
    }
    return params;
  }, [period, from, to, salesperson]);

  const query = useCrmDashboard(dashboardParams);
  const report = useCrmReport();

  const reportRows = useMemo(() => normalizeCrmReportRows(reportRaw), [reportRaw]);
  const filteredRows = useMemo(
    () => filterCrmReportRows(reportRows, tableSearch),
    [reportRows, tableSearch],
  );
  const columns = useMemo(() => crmReportColumns(filteredRows), [filteredRows]);
  const summaryMetrics = useMemo(() => crmReportSummaryMetrics(reportRaw), [reportRaw]);

  const run = async (type: CrmReportType) => {
    setSelected(type);
    setTableSearch('');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('report', type);
        return next;
      },
      { replace: true },
    );
    try {
      const data = await report.mutateAsync({
        type,
        ...dashboardParams,
      });
      setReportRaw(data);
    } catch {
      setReportRaw(null);
    }
  };

  useEffect(() => {
    if (isReportType(initialReport) && !reportRaw && !report.isPending) {
      void run(initialReport);
    }
    // Auto-run once when landing with ?report=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Sales Dashboard"
        description="Monitor CRM activity, conversion, pipeline, and sales performance."
      />
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Period">
            <select
              className="w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          {period === 'custom' ? (
            <>
              <Field label="From">
                <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="To">
                <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </>
          ) : null}
          <CrmSalespersonSelect
            label="Salesperson"
            placeholder="All salespeople"
            value={salesperson}
            onChange={setSalesperson}
          />
        </div>
      </Card>

      {query.isLoading || query.isError ? (
        <Card>
          <CrmEmpty
            loading={query.isLoading}
            error={query.isError ? getErrorMessage(query.error) : undefined}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(query.data?.metrics ?? []).map((metric) => (
            <Card className="p-4" key={metric.label}>
              <p className="text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                {crmLabel(metric.label)}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-neutral-800)]">
                {metric.value}
              </p>
            </Card>
          ))}
          {(query.data?.metrics.length ?? 0) === 0 ? (
            <Card className="p-4 sm:col-span-2 xl:col-span-4">
              <p className="text-sm text-[var(--color-neutral-500)]">No dashboard metrics for this period.</p>
            </Card>
          ) : null}
        </div>
      )}

      <Card className="p-4 space-y-3">
        <div>
          <h2 className="font-semibold">Sales reports</h2>
          <p className="text-sm text-[var(--color-neutral-500)]">
            Run a CRM report with the filters above. Results render as a table (not raw JSON).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CRM_REPORT_TYPES.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selected === type ? 'primary' : 'secondary'}
              disabled={report.isPending}
              onClick={() => void run(type)}
            >
              {crmLabel(type)}
            </Button>
          ))}
        </div>

        {report.isError && (
          <CrmAlert>{getErrorMessage(report.error)}</CrmAlert>
        )}

        {report.isPending && (
          <p className="text-sm text-[var(--color-neutral-500)]">Loading report…</p>
        )}

        {reportRaw != null && !report.isPending && (
          <div className="space-y-3 border-t border-[var(--color-neutral-100)] pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {selected ? crmLabel(selected) : 'Report'}
                {filteredRows.length > 0 ? (
                  <span className="ml-2 text-xs font-normal text-[var(--color-neutral-500)]">
                    ({filteredRows.length} row{filteredRows.length === 1 ? '' : 's'})
                  </span>
                ) : null}
              </h3>
              <Input
                className="max-w-xs"
                placeholder="Filter rows…"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>

            {summaryMetrics.length > 0 && reportRows.length <= 1 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                      {crmLabel(metric.label)}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{formatCrmReportCell(metric.value)}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {filteredRows.length === 0 ? (
              <p className="text-sm text-[var(--color-neutral-500)]">No rows to display for this report.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-600)] whitespace-nowrap"
                        >
                          {crmLabel(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]"
                      >
                        {columns.map((col) => (
                          <td key={col} className="px-3 py-2 whitespace-nowrap text-[var(--color-neutral-800)]">
                            {formatCrmReportCell(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
