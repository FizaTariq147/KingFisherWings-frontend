import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Input } from '@/components/ui/Input';
import { appType } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { FresaSamplePageTable } from '../components/ReportCatalog/FresaSamplePageTable';
import { RecentReportsPanel } from '../components/Dashboard/RecentReportsPanel';
import { useReportingDashboardCatalog } from '../hooks/useReportingDashboardCatalog';
import { FRESA_PAGE_COLUMNS } from '../constants/fresaPageColumns';
import { filterDashboardCards, type DashboardFilterState } from '../utils/dashboardFilters';
import {
  isInvoiceRelatedReport,
  reportContextQuery,
} from '../utils/moduleCatalogFamily';

/**
 * Reporting dashboard laid out like the sample-format catalogue:
 * S.No, Sea Freight, Air Freight, Accounts, My Reports.
 * Selecting a name opens that format on the next screen.
 *
 * Deep-linked from Invoice Detail (Formats / Reports catalog) with
 * `invoice_id` (+ `job_id` / `party_id`) so generate uses live invoice + job data.
 */
export default function ReportingDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalog = useReportingDashboardCatalog();

  const invoiceId = searchParams.get('invoice_id') || undefined;
  const quotationId = searchParams.get('quotation_id') || undefined;
  const partyId = searchParams.get('party_id') || undefined;
  const shipmentId = searchParams.get('shipment_id') || undefined;
  const contextFilter = searchParams.get('context') || '';
  const familyFilter = searchParams.get('family') || '';
  const jobIdFromUrl = searchParams.get('job_id') || undefined;

  const [resolvedJobId, setResolvedJobId] = useState<string | undefined>(jobIdFromUrl);
  const [invoiceLabel, setInvoiceLabel] = useState<string | null>(null);

  // Prefer URL job_id; if missing, load it from the invoice so PDFs hydrate shipment parties/charges.
  useEffect(() => {
    setResolvedJobId(jobIdFromUrl);
    if (!invoiceId || !isUuid(invoiceId)) {
      setInvoiceLabel(null);
      return;
    }
    let cancelled = false;
    invoiceService
      .getById(invoiceId)
      .then((invoice) => {
        if (cancelled) return;
        const job = invoice.job_id?.trim();
        if (job) setResolvedJobId(job);
        setInvoiceLabel(invoice.invoice_number || invoiceId.slice(0, 8));
        // Persist job_id in the URL so format deep-links stay bound.
        if (job && !jobIdFromUrl) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set('job_id', job);
              if (invoice.party_id && !next.get('party_id')) {
                next.set('party_id', invoice.party_id);
              }
              return next;
            },
            { replace: true },
          );
        }
      })
      .catch(() => {
        if (!cancelled) setInvoiceLabel(invoiceId.slice(0, 8));
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId, jobIdFromUrl, setSearchParams]);

  const invoiceBound = Boolean(invoiceId && isUuid(invoiceId));
  const fromInvoiceContext =
    invoiceBound || contextFilter === 'invoice' || familyFilter === 'commercial';

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
      const next = new URLSearchParams(searchParams);
      if (q.trim()) next.set('q', q.trim());
      else next.delete('q');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const filteredRows = useMemo(() => {
    const matched = filterDashboardCards(catalog.rows, filters);
    const codes = new Set(matched.map((row) => row.code.toUpperCase()));
    let rows = catalog.rows.filter((row) => codes.has(row.code.toUpperCase()));
    if (fromInvoiceContext) {
      rows = rows.filter((row) =>
        isInvoiceRelatedReport({
          code: row.code,
          family: row.family,
          contexts: row.template?.contexts,
          name: row.name,
        }),
      );
    }
    return rows;
  }, [catalog.rows, filters, fromInvoiceContext]);

  const templates = useMemo(
    () => filteredRows.map((row) => row.template),
    [filteredRows],
  );

  const contextQuery = useMemo(
    () =>
      reportContextQuery({
        invoice_id: invoiceId,
        job_id: resolvedJobId || jobIdFromUrl,
        party_id: partyId,
        quotation_id: quotationId,
        shipment_id: shipmentId,
      }),
    [invoiceId, resolvedJobId, jobIdFromUrl, partyId, quotationId, shipmentId],
  );

  const backToInvoice =
    invoiceBound && invoiceId ? `/invoices/${encodeURIComponent(invoiceId)}` : null;

  return (
    <div className="space-y-4">
      <PageBackLink
        to={backToInvoice || '/reports'}
        label={backToInvoice ? 'Back to invoice' : 'Back to Reports'}
      />

      <div className="min-w-0">
        <h2 className={appType.pageTitle}>Report formats</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-neutral-600)]">
          The same four columns as the sample catalogue:{' '}
          {FRESA_PAGE_COLUMNS.map((column) => column.title).join(', ')}.
          {' '}
          {filteredRows.length} of {catalog.rows.length} formats
          {fromInvoiceContext ? ' (invoice-related)' : ''}. Choose a name to open that format.
        </p>
        {invoiceBound ? (
          <p className="mt-2 rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-3 py-2 text-sm text-[var(--color-primary-900)]">
            Live data bound
            {invoiceLabel ? ` for invoice ${invoiceLabel}` : ''}.
            {resolvedJobId || jobIdFromUrl
              ? ' Linked job charges and parties load into each PDF.'
              : ' Invoice fields load into each PDF.'}{' '}
            Generate never returns a Fresa sample file.
          </p>
        ) : (
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
        )}
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
        onSelect={(template) => {
          const path = `/reports/formats/${encodeURIComponent(template.code)}`;
          navigate(contextQuery ? `${path}?${contextQuery}` : path);
        }}
        loading={catalog.isLoading && catalog.rows.length === 0}
        emptyHint={
          fromInvoiceContext
            ? 'No invoice-related formats match this search.'
            : 'No formats match this search.'
        }
        appearance="index"
        focusColumn={fromInvoiceContext ? 'accounts' : null}
        invoiceCurrency={null}
      />

      {!fromInvoiceContext ? <RecentReportsPanel compact /> : null}
    </div>
  );
}
