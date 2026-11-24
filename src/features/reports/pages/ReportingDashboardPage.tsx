import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { appType } from '@/lib/erpTypography';
import { ReportCardGrid } from '../components/Dashboard/ReportCardGrid';
import { ReportGenerateSheet } from '../components/Dashboard/ReportGenerateSheet';
import { RecentReportsPanel } from '../components/Dashboard/RecentReportsPanel';
import { useReportingDashboardCatalog } from '../hooks/useReportingDashboardCatalog';
import {
  DASHBOARD_CATEGORIES,
  dashboardCategoryById,
  type DashboardCategoryId,
} from '../utils/dashboardCategories';
import {
  countByDashboardCategory,
  filterDashboardCards,
  uniqueModuleLabels,
  type DashboardFilterState,
} from '../utils/dashboardFilters';
import type { ReportTemplate } from '../types/reportCatalog.types';

function parseGroup(raw: string | null): DashboardCategoryId {
  const id = (raw || 'all') as DashboardCategoryId;
  return dashboardCategoryById(id).id;
}

/** Separate reports dashboard — same visual language as the format catalogue. */
export default function ReportingDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalog = useReportingDashboardCatalog();

  const filters: DashboardFilterState = useMemo(
    () => ({
      group: parseGroup(searchParams.get('group')),
      q: searchParams.get('q') || '',
      module: searchParams.get('module') || '',
      type: (searchParams.get('type') as DashboardFilterState['type']) || '',
      format: (searchParams.get('format') as DashboardFilterState['format']) || '',
    }),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: DashboardFilterState) => {
      const params = new URLSearchParams();
      if (next.group && next.group !== 'all') params.set('group', next.group);
      if (next.q.trim()) params.set('q', next.q.trim());
      if (next.module) params.set('module', next.module);
      if (next.type) params.set('type', next.type);
      if (next.format) params.set('format', next.format);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const counts = useMemo(() => countByDashboardCategory(catalog.rows), [catalog.rows]);
  const filtered = useMemo(
    () => filterDashboardCards(catalog.rows, filters),
    [catalog.rows, filters],
  );
  const moduleOptions = useMemo(() => uniqueModuleLabels(catalog.rows), [catalog.rows]);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selectedTemplate: ReportTemplate | null = useMemo(() => {
    if (!selectedCode) return null;
    return catalog.rows.find((r) => r.code === selectedCode)?.template ?? null;
  }, [catalog.rows, selectedCode]);

  const activeCategory = dashboardCategoryById(filters.group);
  const filtersDirty =
    filters.q.trim() !== '' ||
    filters.module !== '' ||
    filters.type !== '' ||
    filters.format !== '';

  return (
    <div className="space-y-4">
      <PageBackLink to="/reports" label="Back to Reports" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className={appType.pageTitle}>Reporting Dashboard</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-neutral-600)]">
            Access, generate and manage freight, operational and financial reports. Same catalogue
            formats as Report format catalogue · {filtered.length} of {catalog.rows.length} reports
            {filters.group !== 'all' || filtersDirty ? ' (filtered)' : ''}.
          </p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            Prefer format strips and previews?{' '}
            <Link
              to="/reports/catalog"
              className="underline underline-offset-2 text-[var(--color-primary-800)]"
            >
              Open report format catalogue
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
          <Link
            to="/reports/catalog"
            className="inline-flex h-7 items-center justify-center rounded-sm border border-[var(--btn-secondary-border,#C9D3DF)] bg-white px-2.5 text-[12px] font-medium text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]"
          >
            Full catalogue
          </Link>
        </div>
      </div>

      {/* Category rail — same chip pattern as catalogue family rail */}
      <div className="flex flex-wrap gap-2" role="navigation" aria-label="Report categories">
        {DASHBOARD_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            size="sm"
            variant={filters.group === cat.id ? 'primary' : 'secondary'}
            onClick={() => setFilters({ ...filters, group: cat.id })}
          >
            {cat.label}
            <span className="ml-1.5 tabular-nums opacity-80">({counts[cat.id] ?? 0})</span>
          </Button>
        ))}
      </div>

      {activeCategory.externalHref ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Saved GL layouts:{' '}
          <Link
            to={activeCategory.externalHref}
            className="underline underline-offset-2 text-[var(--color-primary-800)]"
          >
            {activeCategory.externalLabel || 'My Reports'}
          </Link>
        </p>
      ) : null}

      {catalog.isError && catalog.rows.length === 0 ? (
        <p role="alert" className="text-sm text-[var(--color-danger-600)]">
          Could not load reports. Showing local list when available.
        </p>
      ) : null}

      {/* Search + filters — catalogue surface panel */}
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative min-w-0 flex-1">
            <label
              className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
              htmlFor="report-dashboard-search"
            >
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-primary-500)]" />
              <Input
                id="report-dashboard-search"
                className="h-10 border-[var(--color-neutral-200)] bg-white pl-9 pr-9 shadow-sm focus-visible:border-[var(--color-secondary)]"
                placeholder="Search by name, code, description, or keywords…"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                autoComplete="off"
                spellCheck={false}
              />
              {filters.q ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[var(--color-neutral-400)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]"
                  aria-label="Clear search"
                  onClick={() => setFilters({ ...filters, q: '' })}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[28rem]">
            <div>
              <label
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
                htmlFor="dash-module"
              >
                Module
              </label>
              <select
                id="dash-module"
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="h-10 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--color-secondary)]"
              >
                <option value="">All modules</option>
                {moduleOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
                htmlFor="dash-type"
              >
                Type
              </label>
              <select
                id="dash-type"
                value={filters.type}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    type: e.target.value as DashboardFilterState['type'],
                  })
                }
                className="h-10 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--color-secondary)]"
              >
                <option value="">All types</option>
                <option value="transaction">Transaction</option>
                <option value="list">List</option>
                <option value="financial">Financial</option>
              </select>
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
                htmlFor="dash-format"
              >
                Format
              </label>
              <select
                id="dash-format"
                value={filters.format}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    format: e.target.value as DashboardFilterState['format'],
                  })
                }
                className="h-10 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--color-secondary)]"
              >
                <option value="">All formats</option>
                <option value="PDF">PDF</option>
                <option value="XLSX">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </div>
        </div>
        {filtersDirty ? (
          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ ...filters, q: '', module: '', type: '', format: '' })}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>

      <RecentReportsPanel compact />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-neutral-200)] bg-white px-4 py-3">
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">
          {activeCategory.label}
          <span className="ml-2 text-xs font-normal text-[var(--color-neutral-500)] tabular-nums">
            {filtered.length} report{filtered.length === 1 ? '' : 's'}
          </span>
        </p>
        {catalog.fromLocalRegistry ? (
          <p className="text-[11px] text-[var(--color-neutral-500)]">
            Local catalogue registry
            {catalog.backendUnavailable ? ' · live API unavailable' : ''}
          </p>
        ) : null}
      </div>

      <ReportCardGrid
        reports={filtered}
        isLoading={catalog.isLoading && catalog.rows.length === 0}
        isError={false}
        onGenerate={setSelectedCode}
      />

      <ReportGenerateSheet
        open={Boolean(selectedTemplate)}
        template={selectedTemplate}
        onClose={() => setSelectedCode(null)}
      />
    </div>
  );
}
