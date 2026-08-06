import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Package,
  Quote,
  RefreshCw,
  Route,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePortalAuthStore } from '../store/portalAuthStore';
import { portalAuthService } from '../services/portalAuth.service';
import { usePortalBrand } from '../hooks/usePortalBrand';
import {
  usePortalShipmentSummary,
  usePortalShipments,
} from '@/features/portal-shipments/hooks/usePortalShipments';
import {
  usePortalQuotationSummary,
  usePortalQuotations,
} from '@/features/portal-quotations/hooks/usePortalQuotations';
import {
  usePortalDocumentSummary,
  usePortalDocuments,
} from '@/features/portal-documents/hooks/usePortalDocuments';
import {
  PortalEmptyState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '../components/portal-ui';

function displayValue(
  primary: number | undefined,
  fallback: number | undefined,
  isLoading: boolean,
): string | number {
  if (primary != null) return primary;
  if (fallback != null) return fallback;
  return isLoading ? '…' : 0;
}

export default function PortalHomePage() {
  const navigate = useNavigate();
  const user = usePortalAuthStore((s) => s.user);
  const setUser = usePortalAuthStore((s) => s.setUser);
  const { companyName } = usePortalBrand();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!user);

  const firstName = useMemo(() => {
    const full = user?.fullName || '';
    const parts = full.split(' ').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[0];
    const email = user?.email || '';
    if (email.includes('@')) return email.split('@')[0];
    return 'there';
  }, [user?.fullName, user?.email]);

  const shipmentSummary = usePortalShipmentSummary();
  const quoteSummary = usePortalQuotationSummary();
  const documentSummary = usePortalDocumentSummary();
  const recentShipments = usePortalShipments({ page: 1, limit: 5, order: 'desc' });
  const recentQuotes = usePortalQuotations({ page: 1, limit: 5, order: 'desc' });
  const recentDocuments = usePortalDocuments({ page: 1, limit: 1, order: 'desc' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await portalAuthService.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const refreshDashboard = () => {
    void shipmentSummary.refetch();
    void quoteSummary.refetch();
    void documentSummary.refetch();
    void recentShipments.refetch();
    void recentQuotes.refetch();
    void recentDocuments.refetch();
  };

  if (loading && !user) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading profile…</p>;
  }

  const shipmentTotal = displayValue(
    shipmentSummary.data?.total,
    recentShipments.data?.meta.total,
    shipmentSummary.isLoading || recentShipments.isLoading,
  );
  const shipmentActive = displayValue(
    shipmentSummary.data?.active,
    undefined,
    shipmentSummary.isLoading,
  );
  const quoteTotal = displayValue(
    quoteSummary.data?.total,
    recentQuotes.data?.meta.total,
    quoteSummary.isLoading || recentQuotes.isLoading,
  );
  const quoteOpen = displayValue(quoteSummary.data?.open, undefined, quoteSummary.isLoading);
  const documentTotal = displayValue(
    documentSummary.data?.total,
    recentDocuments.data?.meta.total,
    documentSummary.isLoading || recentDocuments.isLoading,
  );

  const recentShipmentItems = recentShipments.data?.items ?? [];
  const recentQuoteItems = recentQuotes.data?.items ?? [];
  const partyName = user?.party?.name?.trim();
  const isRefreshing =
    shipmentSummary.isFetching ||
    quoteSummary.isFetching ||
    documentSummary.isFetching ||
    recentShipments.isFetching ||
    recentQuotes.isFetching;

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-primary)] px-6 py-7 text-white shadow-[0_12px_40px_rgba(10,41,66,0.18)] sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(520px 240px at 85% 10%, color-mix(in srgb, var(--color-secondary) 55%, transparent), transparent 65%)',
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85">
              <Sparkles size={12} aria-hidden="true" />
              {companyName}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Welcome, {firstName}</h2>
            <p className="text-sm text-white/75">
              {partyName
                ? `Live logistics overview for ${partyName}.`
                : 'Live shipments, quotes, and documents for your account.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={refreshDashboard}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} aria-hidden="true" className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              type="button"
              className="border-transparent bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-600)]"
              onClick={() => navigate('/portal/book')}
            >
              Request quote
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={() => navigate('/portal/track')}
            >
              <Route size={16} aria-hidden="true" />
              Track shipment
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          className="text-left"
          onClick={() => navigate('/portal/shipments')}
        >
          <PortalStatCard
            label="Shipments"
            value={shipmentTotal}
            hint={
              typeof shipmentSummary.data?.delivered === 'number'
                ? `${shipmentSummary.data.delivered} delivered`
                : 'All consignments'
            }
            Icon={Package}
          />
        </button>
        <button type="button" className="text-left" onClick={() => navigate('/portal/shipments')}>
          <PortalStatCard
            label="Active"
            value={shipmentActive}
            hint="In progress"
            Icon={Route}
          />
        </button>
        <button type="button" className="text-left" onClick={() => navigate('/portal/quotes')}>
          <PortalStatCard
            label="Quotations"
            value={quoteTotal}
            hint={typeof quoteOpen === 'number' ? `${quoteOpen} open` : 'Quote requests'}
            Icon={Quote}
          />
        </button>
        <button type="button" className="text-left" onClick={() => navigate('/portal/documents')}>
          <PortalStatCard
            label="Documents"
            value={documentTotal}
            hint="Visible files"
            Icon={FileText}
            tone="accent"
          />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <PortalPageHeader
            title="Recent shipments"
            description="Latest activity on your consignments"
            actions={
              <Link
                to="/portal/shipments"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all
              </Link>
            }
          />
          <PortalPanel>
            {recentShipments.isLoading ? (
              <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
            ) : recentShipments.isError ? (
              <div className="space-y-2 p-6">
                <p className="text-sm text-[var(--color-danger-600)]">Could not load shipments.</p>
                <Button type="button" size="sm" variant="secondary" onClick={() => recentShipments.refetch()}>
                  Retry
                </Button>
              </div>
            ) : recentShipmentItems.length === 0 ? (
              <PortalEmptyState
                title="No shipments yet"
                description="When jobs are linked to your account, they will appear here."
                Icon={Package}
                action={
                  <Button type="button" size="sm" onClick={() => navigate('/portal/book')}>
                    Request a quote
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {recentShipmentItems.map((s) => (
                  <Link
                    key={s.id}
                    to={`/portal/shipments/${s.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-[var(--color-neutral-50)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary)]">
                        <Package size={16} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--color-neutral-900)]">
                          {s.reference}
                        </div>
                        <div className="truncate text-xs text-[var(--color-neutral-500)]">
                          {[s.origin, s.destination].filter(Boolean).join(' → ') || '—'}
                        </div>
                      </div>
                    </div>
                    {s.status ? (
                      <Badge variant="info">{s.status.replaceAll('_', ' ')}</Badge>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </PortalPanel>
        </div>

        <div className="space-y-3">
          <PortalPageHeader
            title="Recent quotes"
            description="Latest quote requests for your party"
            actions={
              <Link
                to="/portal/quotes"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all
              </Link>
            }
          />
          <PortalPanel>
            {recentQuotes.isLoading ? (
              <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
            ) : recentQuotes.isError ? (
              <div className="space-y-2 p-6">
                <p className="text-sm text-[var(--color-danger-600)]">Could not load quotations.</p>
                <Button type="button" size="sm" variant="secondary" onClick={() => recentQuotes.refetch()}>
                  Retry
                </Button>
              </div>
            ) : recentQuoteItems.length === 0 ? (
              <PortalEmptyState
                title="No quotations yet"
                description="Submit a quote request to get pricing from your forwarder."
                Icon={Quote}
                action={
                  <Button type="button" size="sm" onClick={() => navigate('/portal/book')}>
                    Request a quote
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {recentQuoteItems.map((q) => (
                  <Link
                    key={q.id}
                    to={`/portal/quotes/${q.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-[var(--color-neutral-50)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]">
                        <Quote size={16} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--color-neutral-900)]">
                          {q.number}
                        </div>
                        <div className="truncate text-xs text-[var(--color-neutral-500)]">
                          {[q.origin, q.destination].filter(Boolean).join(' → ') || q.jobType || '—'}
                        </div>
                      </div>
                    </div>
                    {q.status ? <Badge variant="info">{q.status}</Badge> : null}
                  </Link>
                ))}
              </div>
            )}
          </PortalPanel>
        </div>
      </div>

      <div className="space-y-3">
        <PortalPageHeader title="Quick actions" description="Common tasks" />
        <PortalPanel className="p-2">
          <div className="grid gap-1 sm:grid-cols-3">
            {[
              {
                to: '/portal/book',
                title: 'Request a quote',
                desc: 'Submit freight requirements',
                Icon: Quote,
              },
              {
                to: '/portal/track',
                title: 'Track a shipment',
                desc: 'Look up by reference',
                Icon: Route,
              },
              {
                to: '/portal/documents',
                title: 'Open documents',
                desc:
                  typeof documentTotal === 'number'
                    ? `${documentTotal} file${documentTotal === 1 ? '' : 's'} available`
                    : 'Invoices and job files',
                Icon: FileText,
              },
            ].map(({ to, title, desc, Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-[var(--color-neutral-50)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--color-neutral-900)]">{title}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">{desc}</div>
                </div>
                <ArrowRight size={16} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </PortalPanel>
      </div>
    </div>
  );
}
