import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Package, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import {
  usePortalPreferences,
  useUpdatePortalPreferences,
} from '@/features/portal-preferences/hooks/usePortalPreferences';
import { PORTAL_JOB_STATUSES, PORTAL_JOB_TYPES } from '../api/portalShipments.api';
import { useExportPortalShipmentsCsv, usePortalShipments } from '../hooks/usePortalShipments';

export default function PortalShipmentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [filtersReady, setFiltersReady] = useState(false);
  const prefs = usePortalPreferences();
  const updatePrefs = useUpdatePortalPreferences();
  const exportCsv = useExportPortalShipmentsCsv();
  const [exportError, setExportError] = useState<string | null>(null);
  const [filterSaved, setFilterSaved] = useState(false);

  useEffect(() => {
    if (filtersReady || prefs.isLoading) return;
    const saved = prefs.data?.defaultShipmentFilters;
    if (saved) {
      if (typeof saved.search === 'string') setSearch(saved.search);
      if (typeof saved.status === 'string') setStatus(saved.status);
      if (typeof saved.job_type === 'string') setJobType(saved.job_type);
    }
    setFiltersReady(true);
  }, [filtersReady, prefs.data, prefs.isLoading]);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      status: status || undefined,
      job_type: jobType || undefined,
      order: 'desc' as const,
    }),
    [page, search, status, jobType],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = usePortalShipments(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Shipments"
        description="Browse consignments and open a shipment for milestones and documents."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw size={14} aria-hidden="true" />
              Refresh
            </Button>
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
                    default_invoice_filters: prefs.data?.defaultInvoiceFilters,
                    default_shipment_filters: {
                      search: search.trim() || undefined,
                      status: status || undefined,
                      job_type: jobType || undefined,
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
      {filterSaved ? (
        <p className="text-sm text-[var(--color-success-600)]" role="status">
          Default shipment filters saved to your portal preferences.
        </p>
      ) : null}

      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Reference / number"
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Status
            </span>
            <select
              className={portalSelectClassName}
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              {PORTAL_JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Job type
            </span>
            <select
              className={portalSelectClassName}
              value={jobType}
              onChange={(e) => {
                setPage(1);
                setJobType(e.target.value);
              }}
            >
              <option value="">All</option>
              {PORTAL_JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PortalPanel>

      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState label="Loading shipments…" />
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load shipments.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No shipments found"
            description="Try another search, or check back after your forwarder creates a job."
            Icon={Search}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((s) => (
              <PortalAnimatedListItem key={s.id}>
                <Link
                  to={`/portal/shipments/${s.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-neutral-50)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary)]">
                      <Package size={16} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                        {s.reference}
                      </div>
                      <div className="text-xs text-[var(--color-neutral-500)] truncate">
                        {[s.origin, s.destination].filter(Boolean).join(' → ') || s.jobType || '—'}
                      </div>
                    </div>
                  </div>
                  {s.status ? <Badge variant="info">{s.status.replaceAll('_', ' ')}</Badge> : null}
                </Link>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
