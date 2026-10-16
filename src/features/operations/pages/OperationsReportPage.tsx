import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import {
  useClosedJobReport,
  useJobFinanceReport,
  useJobListSummary,
  useJobNotInvoicedDo,
  useOperationsExceptions,
  useOperationsKpiStatus,
  useOperationsMutations,
  useVoyageJobsShipments,
} from '../hooks/useOperations';
import type { OperationsListParams, OperationsReportKey } from '../types/operations.types';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

const REPORT_META: Record<
  OperationsReportKey,
  {
    title: string;
    showDateBasis?: boolean;
    dateBasisOptions?: { value: string; label: string }[];
    showGroupBy?: boolean;
    showVoyage?: boolean;
    showJobType?: boolean;
    downloadKey?:
      | 'downloadJobNotInvoicedDo'
      | 'downloadJobFinanceReport'
      | 'downloadExceptions'
      | 'downloadKpiStatus'
      | 'downloadJobListSummary'
      | 'downloadClosedJobReport';
  }
> = {
  'job-not-invoiced-do': {
    title: 'Job not invoiced against DO',
    showDateBasis: true,
    dateBasisOptions: [
      { value: 'do_issued', label: 'DO issued' },
      { value: 'job_date', label: 'Job date' },
    ],
    showJobType: true,
    downloadKey: 'downloadJobNotInvoicedDo',
  },
  'job-finance-report': {
    title: 'Job finance by shipment date',
    showDateBasis: true,
    dateBasisOptions: [
      { value: 'shipment_date', label: 'Shipment date' },
      { value: 'job_date', label: 'Job date' },
    ],
    showGroupBy: true,
    showJobType: true,
    downloadKey: 'downloadJobFinanceReport',
  },
  exceptions: {
    title: 'Exceptions',
    showJobType: true,
    downloadKey: 'downloadExceptions',
  },
  'kpi-status': {
    title: 'KPI status',
    showJobType: true,
    downloadKey: 'downloadKpiStatus',
  },
  'job-list-summary': {
    title: 'Job list summary',
    showDateBasis: true,
    dateBasisOptions: [
      { value: 'job_date', label: 'Job date' },
      { value: 'shipment_date', label: 'Shipment date' },
      { value: 'voucher_date', label: 'Voucher date' },
    ],
    showJobType: true,
    downloadKey: 'downloadJobListSummary',
  },
  'voyage-jobs-shipments': {
    title: 'Voyage jobs & shipments',
    showVoyage: true,
  },
  'closed-job-report': {
    title: 'Closed job report',
    downloadKey: 'downloadClosedJobReport',
  },
};

function formatCell(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString() : '—';
  }
  if (typeof value === 'string') return value.trim() || '—';
  if (Array.isArray(value)) {
    if (value.every((v) => v == null || ['string', 'number', 'boolean'].includes(typeof v))) {
      return value.map((v) => formatCell(v)).join(', ');
    }
    return `${value.length} item${value.length === 1 ? '' : 's'}`;
  }
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    const label = rec.name ?? rec.label ?? rec.code ?? rec.job_number ?? rec.id;
    if (label != null) return String(label);
  }
  return String(value);
}

function humanLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function preferredColumns(rows: Record<string, unknown>[]): string[] {
  const preferred = [
    'job_number',
    'shipment_numbers',
    'shipment_date',
    'job_date',
    'do_issued_at',
    'aging_days',
    'salesperson',
    'branch',
    'voyage_number',
    'vessel_name',
    'job_type',
    'status',
    'exception',
    'exception_type',
    'kpi_flag',
    'revenue',
    'cost',
    'gp',
    'gp_pct',
    'uninvoiced_sale',
    'uninvoiced_amount',
    'chargeable_units',
  ];
  const present = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key === 'id' || key === 'tenant_id') continue;
      if (typeof row[key] === 'object' && row[key] != null && !Array.isArray(row[key])) continue;
      present.add(key);
    }
  }
  const cols = preferred.filter((k) => present.has(k));
  if (cols.length > 0) return cols.slice(0, 12);
  return [...present].slice(0, 12);
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function defaultFromDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultToDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function OperationsReportPage() {
  const { reportKey } = useParams<{ reportKey: string }>();
  const key = (reportKey ?? '') as OperationsReportKey;
  const meta = REPORT_META[key];

  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [branchId, setBranchId] = useState('');
  const [jobType, setJobType] = useState('');
  const [dateBasis, setDateBasis] = useState(
    meta?.dateBasisOptions?.[0]?.value ?? 'job_date',
  );
  const [groupBy, setGroupBy] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [page, setPage] = useState(1);
  const [dlError, setDlError] = useState<string | null>(null);

  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const mutations = useOperationsMutations();

  const params: OperationsListParams = useMemo(
    () => ({
      page,
      limit: 50,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branchId || undefined,
      job_type: jobType || undefined,
      date_basis: dateBasis as OperationsListParams['date_basis'],
      group_by: (groupBy || undefined) as OperationsListParams['group_by'],
      voyage_number: voyageNumber.trim() || undefined,
      vessel_name: vesselName.trim() || undefined,
    }),
    [
      page,
      fromDate,
      toDate,
      branchId,
      jobType,
      dateBasis,
      groupBy,
      voyageNumber,
      vesselName,
    ],
  );

  const enabled = Boolean(meta);
  const notInvoiced = useJobNotInvoicedDo(params, enabled && key === 'job-not-invoiced-do');
  const finance = useJobFinanceReport(params, enabled && key === 'job-finance-report');
  const exceptions = useOperationsExceptions(params, enabled && key === 'exceptions');
  const kpi = useOperationsKpiStatus(params, enabled && key === 'kpi-status');
  const summary = useJobListSummary(params, enabled && key === 'job-list-summary');
  const voyage = useVoyageJobsShipments(params, enabled && key === 'voyage-jobs-shipments');
  const closed = useClosedJobReport(params, enabled && key === 'closed-job-report');

  const active =
    key === 'job-not-invoiced-do'
      ? notInvoiced
      : key === 'job-finance-report'
        ? finance
        : key === 'exceptions'
          ? exceptions
          : key === 'kpi-status'
            ? kpi
            : key === 'job-list-summary'
              ? summary
              : key === 'voyage-jobs-shipments'
                ? voyage
                : key === 'closed-job-report'
                  ? closed
                  : null;

  const items = active?.data?.items ?? [];
  const totals = active?.data?.totals;
  const columns = useMemo(() => preferredColumns(items), [items]);
  const totalPages = active?.data?.meta?.totalPages ?? 1;

  if (!meta) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">Unknown report.</p>
        <Link
          to="/operations/reports"
          className="text-sm text-[var(--color-primary-700)] hover:underline"
        >
          Back to operations reports
        </Link>
      </div>
    );
  }

  const download = async () => {
    if (!meta.downloadKey) return;
    setDlError(null);
    try {
      const dto = {
        from_date: fromDate,
        to_date: toDate,
        branch_id: branchId || undefined,
        job_type: jobType || undefined,
        date_basis: dateBasis || undefined,
        group_by: groupBy || undefined,
        format: 'xlsx' as const,
      };
      const blob = await mutations[meta.downloadKey].mutateAsync(dto);
      triggerBlobDownload(blob, `${key}.xlsx`);
    } catch (err) {
      setDlError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/operations/reports"
            className="text-xs text-[var(--color-primary-700)] hover:underline"
          >
            ← Operations reports
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-[var(--color-neutral-900)]">
            {meta.title}
          </h1>
        </div>
        {meta.downloadKey ? (
          <Button
            type="button"
            size="sm"
            variant="report"
            disabled={mutations[meta.downloadKey].isPending}
            onClick={() => void download()}
          >
            {mutations[meta.downloadKey].isPending ? 'Downloading…' : 'Download XLSX'}
          </Button>
        ) : null}
      </div>

      {dlError ? <p className="text-sm text-[var(--color-danger-600)]">{dlError}</p> : null}
      {active?.isError ? (
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(active.error)}
        </p>
      ) : null}

      <div className="grid gap-3 rounded-md border border-[var(--color-neutral-200)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="From date"
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label="To date"
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
            Branch
          </span>
          <select
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {branches.map((b) => (
              <option key={String(b.id)} value={String(b.id)}>
                {String(b.name ?? b.code ?? b.id)}
              </option>
            ))}
          </select>
        </label>
        {meta.showJobType ? (
          <Input
            label="Job type"
            value={jobType}
            onChange={(e) => {
              setJobType(e.target.value);
              setPage(1);
            }}
            placeholder="e.g. SEA_EXPORT"
          />
        ) : null}
        {meta.showDateBasis ? (
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Date basis
            </span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
              value={dateBasis}
              onChange={(e) => {
                setDateBasis(e.target.value);
                setPage(1);
              }}
            >
              {(meta.dateBasisOptions ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {meta.showGroupBy ? (
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Group by
            </span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
              value={groupBy}
              onChange={(e) => {
                setGroupBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="">None</option>
              <option value="branch">Branch</option>
              <option value="salesperson">Salesperson</option>
              <option value="job_type">Job type</option>
            </select>
          </label>
        ) : null}
        {meta.showVoyage ? (
          <>
            <Input
              label="Voyage number"
              value={voyageNumber}
              onChange={(e) => {
                setVoyageNumber(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label="Vessel name"
              value={vesselName}
              onChange={(e) => {
                setVesselName(e.target.value);
                setPage(1);
              }}
            />
          </>
        ) : null}
      </div>

      {totals && Object.keys(totals).length > 0 ? (
        <div className="flex flex-wrap gap-4 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-3 text-sm">
          {Object.entries(totals).map(([k, v]) => (
            <div key={k}>
              <span className="text-[var(--color-neutral-500)]">{humanLabel(k)}: </span>
              <span className="font-medium">{formatCell(v)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)] bg-white">
        {active?.isLoading ? (
          <p className="p-4 text-sm text-[var(--color-neutral-500)]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-[var(--color-neutral-500)]">No rows for these filters.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-xs uppercase text-[var(--color-neutral-500)]">
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 font-medium">
                    {humanLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr
                  key={String(row.id ?? i)}
                  className="border-b border-[var(--color-neutral-100)]"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap">
                      {formatCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-[var(--color-neutral-600)]">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
