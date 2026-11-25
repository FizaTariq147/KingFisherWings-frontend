import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ReportExportFormat } from '../../types/reportCatalog.types';
import type { DashboardFilterState, DashboardReportType } from '../../utils/dashboardFilters';
import { EMPTY_DASHBOARD_FILTERS } from '../../utils/dashboardFilters';

type ReportDashboardFiltersProps = {
  value: DashboardFilterState;
  moduleOptions: string[];
  onChange: (next: DashboardFilterState) => void;
  resultCount: number;
};

const TYPE_OPTIONS: Array<{ value: '' | DashboardReportType; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'transaction', label: 'Transaction' },
  { value: 'list', label: 'List' },
  { value: 'financial', label: 'Financial' },
];

const FORMAT_OPTIONS: Array<{ value: '' | ReportExportFormat; label: string }> = [
  { value: '', label: 'All formats' },
  { value: 'PDF', label: 'PDF' },
  { value: 'XLSX', label: 'Excel' },
  { value: 'CSV', label: 'CSV' },
];

export function ReportDashboardFilters({
  value,
  moduleOptions,
  onChange,
  resultCount,
}: ReportDashboardFiltersProps) {
  const dirty =
    value.q.trim() !== '' ||
    value.module !== '' ||
    value.type !== '' ||
    value.format !== '';

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-sm p-4 space-y-3">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-neutral-400)]"
          aria-hidden
        />
        <Input
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="Search by name, code, description, or keywords"
          className="pl-9"
          aria-label="Search reports"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="dash-module">
          Module
        </label>
        <select
          id="dash-module"
          value={value.module}
          onChange={(e) => onChange({ ...value, module: e.target.value })}
          className="h-9 rounded-lg border border-[var(--color-neutral-200)] bg-white px-2 text-sm text-[var(--color-neutral-800)]"
        >
          <option value="">All modules</option>
          {moduleOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="dash-type">
          Report type
        </label>
        <select
          id="dash-type"
          value={value.type}
          onChange={(e) =>
            onChange({ ...value, type: e.target.value as DashboardFilterState['type'] })
          }
          className="h-9 rounded-lg border border-[var(--color-neutral-200)] bg-white px-2 text-sm text-[var(--color-neutral-800)]"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="dash-format">
          Output format
        </label>
        <select
          id="dash-format"
          value={value.format}
          onChange={(e) =>
            onChange({ ...value, format: e.target.value as DashboardFilterState['format'] })
          }
          className="h-9 rounded-lg border border-[var(--color-neutral-200)] bg-white px-2 text-sm text-[var(--color-neutral-800)]"
        >
          {FORMAT_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {dirty ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ ...EMPTY_DASHBOARD_FILTERS, group: value.group })
            }
          >
            <X className="size-3.5 mr-1" aria-hidden />
            Clear filters
          </Button>
        ) : null}
        <span className="ml-auto text-xs text-[var(--color-neutral-500)] tabular-nums">
          {resultCount} report{resultCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
