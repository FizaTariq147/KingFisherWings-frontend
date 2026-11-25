import { useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Input } from '@/components/ui/Input';
import { appType } from '@/lib/erpTypography';
import { FresaSamplePageTable } from '../components/ReportCatalog/FresaSamplePageTable';
import { RecentReportsPanel } from '../components/Dashboard/RecentReportsPanel';
import { useReportingDashboardCatalog } from '../hooks/useReportingDashboardCatalog';
import { FRESA_PAGE_COLUMNS } from '../constants/fresaPageColumns';
import { filterDashboardCards, type DashboardFilterState } from '../utils/dashboardFilters';

/**
 * Reporting dashboard laid out like the sample-format catalogue:
 * S.No, Sea Freight, Air Freight, Accounts, My Reports.
 * Selecting a name opens that format on the next screen.
 */
export default function ReportingDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalog = useReportingDashboardCatalog();

  const filters: DashboardFilterState = useMemo(
    () => ({
      group: 'all',
      q: searchParams.get('q') || '',
      module: '',
      type: '',
      format: '',
    }),
    [searchParams],
  );

  const setQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const filtered = useMemo(
    () => filterDashboardCards(catalog.rows, filters),
    [catalog.rows, filters],
  );
  const templates = useMemo(() => filtered.map((row) => row.template), [filtered]);

  return (
    <div className="space-y-4">
      <PageBackLink to="/reports" label="Back to Reports" />

      <div className="min-w-0">
        <h2 className={appType.pageTitle}>Report formats</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-neutral-600)]">
          The same four columns as the sample catalogue: {FRESA_PAGE_COLUMNS.map((column) => column.title).join(', ')}.
          {' '}
          {filtered.length} of {catalog.rows.length} formats. Choose a name to open that format.
        </p>
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
          Generated files use Kingfisher data. They are not signed off as copies of the sample PDFs.{' '}
          <Link
            to="/reports/catalog"
            className="underline underline-offset-2 text-[var(--color-primary-800)]"
          >
            Open the format catalogue
          </Link>
          .
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-4 shadow-sm">
        <label
          className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
          htmlFor="report-dashboard-search"
        >
          Search
        </label>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-primary-500)]" />
          <Input
            id="report-dashboard-search"
            className="h-10 border-[var(--color-neutral-200)] bg-white pl-9 pr-9 shadow-sm focus-visible:border-[var(--color-secondary)]"
            placeholder="Search by name or code"
            value={filters.q}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {filters.q ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[var(--color-neutral-400)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]"
              aria-label="Clear search"
              onClick={() => setQuery('')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {catalog.isError && catalog.rows.length === 0 ? (
        <p role="alert" className="text-sm text-[var(--color-danger-600)]">
          Could not load reports. Showing the local list when it is available.
        </p>
      ) : null}

      <FresaSamplePageTable
        items={templates}
        onSelect={(template) =>
          navigate(`/reports/formats/${encodeURIComponent(template.code)}`)
        }
        loading={catalog.isLoading && catalog.rows.length === 0}
        emptyHint="No formats match this search."
        appearance="index"
      />

      <RecentReportsPanel compact />
    </div>
  );
}
