import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { PORTAL_INVOICE_STATUSES } from '../api/portalInvoices.api';
import {
  usePortalPreferences,
  useUpdatePortalPreferences,
} from '@/features/portal-preferences/hooks/usePortalPreferences';
import {
  useDownloadPortalInvoicePdf,
  useExportPortalInvoicesCsv,
  usePortalInvoiceSummary,
  usePortalInvoices,
} from '../hooks/usePortalInvoices';

export default function PortalInvoicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filtersReady, setFiltersReady] = useState(false);
  const prefs = usePortalPreferences();
  const updatePrefs = useUpdatePortalPreferences();
  const exportCsv = useExportPortalInvoicesCsv();
  const [exportError, setExportError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [filterSaved, setFilterSaved] = useState(false);

  useEffect(() => {
    if (filtersReady || prefs.isLoading) return;
    const saved = prefs.data?.defaultInvoiceFilters;
    if (saved) {
      if (typeof saved.search === 'string') setSearch(saved.search);
      if (typeof saved.status === 'string') setStatus(saved.status);
      if (typeof saved.from_date === 'string') setFromDate(saved.from_date);
      if (typeof saved.to_date === 'string') setToDate(saved.to_date);
    }
    setFiltersReady(true);
  }, [filtersReady, prefs.data, prefs.isLoading]);
  const params = useMemo(() => ({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: status || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  }), [page, search, status, fromDate, toDate]);
  const summary = usePortalInvoiceSummary();
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalInvoices(params);
  const download = useDownloadPortalInvoicePdf();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Invoices"
        description="Customer invoices for your account."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={updatePrefs.isPending}
              onClick={() => {
                setFilterSaved(false);
                void updatePrefs
                  .mutateAsync({
                    milestone_alerts_enabled: prefs.data?.milestoneAlertsEnabled,
                    document_alerts_enabled: prefs.data?.documentAlertsEnabled,
                    default_shipment_filters: prefs.data?.defaultShipmentFilters,
                    default_invoice_filters: {
                      search: search.trim() || undefined,
                      status: status || undefined,
                      from_date: fromDate || undefined,
                      to_date: toDate || undefined,
                    },
                  })
                  .then(() => setFilterSaved(true))
                  .catch(() => setFilterSaved(false));
              }}
            >
              {updatePrefs.isPending ? 'Saving…' : 'Save as my filters'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() => {
                setExportError(null);
                void exportCsv.mutateAsync(params).catch((err) => {
                  setExportError(
                    err instanceof PortalApiError || err instanceof Error
                      ? err.message
                      : 'Could not export CSV.',
                  );
                });
              }}
            >
              <Download size={14} aria-hidden="true" />
              {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
            </Button>
          </div>
        }
      />
      {exportError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {exportError}
        </p>
      ) : null}
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}
      {filterSaved ? (
        <p className="text-sm text-[var(--color-success-600)]" role="status">
          Default invoice filters saved to your portal preferences.
        </p>
      ) : null}
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalAnimatedGridItem><PortalStatCard label="Total" value={summary.data?.total ?? (summary.isLoading ? '…' : 0)} Icon={FileText} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Outstanding" value={summary.data?.outstanding ?? (summary.isLoading ? '…' : 0)} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Overdue" value={summary.data?.overdue ?? (summary.isLoading ? '…' : 0)} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Paid" value={summary.data?.paid ?? (summary.isLoading ? '…' : 0)} tone="accent" /></PortalAnimatedGridItem>
      </PortalAnimatedGrid>
      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Search" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Status</span>
            <select className={portalSelectClassName} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All</option>
              {PORTAL_INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <Input
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(1);
              setFromDate(e.target.value);
            }}
          />
          <Input
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => {
              setPage(1);
              setToDate(e.target.value);
            }}
          />
        </div>
      </PortalPanel>
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState label="Loading invoices…" />
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Failed to load invoices.'}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState title="No invoices" description="Invoices appear here once posted for your party." Icon={FileText} />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((inv) => (
              <PortalAnimatedListItem key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <Link to={`/portal/invoices/${inv.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{inv.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[inv.invoiceDate, inv.dueDate ? `Due ${inv.dueDate}` : null, inv.currencyCode].filter(Boolean).join(' · ') || '—'}
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  {inv.status ? <Badge variant="info">{inv.status.replaceAll('_', ' ')}</Badge> : null}
                  <Button type="button" size="sm" variant="secondary" disabled={download.isPending}
                    onClick={() => {
                      setPdfError(null);
                      void download
                        .mutateAsync({ id: inv.id, name: inv.number })
                        .catch((err) => {
                          setPdfError(
                            err instanceof PortalApiError || err instanceof Error
                              ? err.message
                              : 'Could not download invoice PDF.',
                          );
                        });
                    }}>
                    <Download size={14} aria-hidden="true" />
                    {download.isPending ? 'Downloading…' : 'PDF'}
                  </Button>
                </div>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button type="button" size="sm" variant="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
