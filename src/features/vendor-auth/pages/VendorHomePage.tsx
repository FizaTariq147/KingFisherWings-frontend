import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  FileText,
  RefreshCw,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalAnimatedPage,
  PortalEmptyState,
  PortalGsapHeroViz,
  PortalLoadingState,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { Spotlight, TextGenerateEffect } from '@/components/aceternity';
import { useVendorCreditAging } from '@/features/vendor-credit/hooks/useVendorCredit';
import { useVendorInvoiceSummary } from '@/features/vendor-invoices/hooks/useVendorInvoices';
import { useVendorSchedule } from '@/features/vendor-schedule/hooks/useVendorSchedule';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { useVendorBrand } from '../hooks/useVendorBrand';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export default function VendorHomePage() {
  const navigate = useNavigate();
  const user = useVendorAuthStore((s) => s.user);
  const setUser = useVendorAuthStore((s) => s.setUser);
  const { companyName } = useVendorBrand();
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

  const summary = useVendorInvoiceSummary();
  const schedule = useVendorSchedule();
  const aging = useVendorCreditAging();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await vendorAuthService.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled && !useVendorAuthStore.getState().user) {
          setError(vendorErrorMessage(err, 'Could not load profile.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const refresh = () => {
    void summary.refetch();
    void schedule.refetch();
    void aging.refetch();
  };

  if (loading && !user) {
    return <PortalLoadingState label="Loading profile…" />;
  }

  const isRefreshing = summary.isFetching || schedule.isFetching || aging.isFetching;
  const partyName = user?.party?.name?.trim();
  const upcoming = (schedule.data?.items ?? []).slice(0, 6);

  return (
    <PortalAnimatedPage className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-primary)] px-6 py-7 text-white shadow-[0_12px_40px_rgba(10,41,66,0.18)] sm:px-8">
        <PortalGsapHeroViz className="pointer-events-none absolute inset-0" />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-40" fill="white" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/85">
              <Sparkles size={12} aria-hidden="true" />
              {companyName}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Welcome, {firstName}</h2>
            <TextGenerateEffect
              words={
                partyName
                  ? `Accounts payable overview for ${partyName}.`
                  : 'Invoices, schedule, and aging for your vendor account.'
              }
              className="text-sm text-white/80"
              filter
              duration={0.35}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={refresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} aria-hidden="true" className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              type="button"
              className="border-transparent bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-600)]"
              onClick={() => navigate('/vendor/invoices')}
            >
              Submit invoice
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalAnimatedGridItem>
          <button type="button" className="w-full text-left" onClick={() => navigate('/vendor/invoices')}>
            <PortalStatCard
              label="Invoices"
              value={summary.data?.total ?? (summary.isLoading ? '…' : 0)}
              hint="All purchase invoices"
              Icon={FileText}
            />
          </button>
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <button type="button" className="w-full text-left" onClick={() => navigate('/vendor/schedule')}>
            <PortalStatCard
              label="Due / open"
              value={schedule.data?.dueCount ?? (schedule.isLoading ? '…' : 0)}
              hint={`${schedule.data?.overdueCount ?? 0} overdue`}
              Icon={CalendarClock}
            />
          </button>
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <button type="button" className="w-full text-left" onClick={() => navigate('/vendor/credit')}>
            <PortalStatCard
              label="Aging outstanding"
              value={
                aging.isLoading ? '…' : formatVendorMoney(aging.data?.total ?? summary.data?.outstanding)
              }
              hint="From aging / invoice summary"
              Icon={Wallet}
            />
          </button>
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <button type="button" className="w-full text-left" onClick={() => navigate('/vendor/invoices')}>
            <PortalStatCard
              label="Paid"
              value={summary.data?.paid ?? (summary.isLoading ? '…' : 0)}
              tone="accent"
            />
          </button>
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      {(summary.isError || schedule.isError || aging.isError) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {vendorErrorMessage(summary.error || schedule.error || aging.error)}
          <Button type="button" size="sm" variant="secondary" className="ml-3" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-2xl border border-[var(--color-neutral-200)] bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutral-100)]">
          <h3 className="text-sm font-semibold">Upcoming due</h3>
          <Link to="/vendor/schedule" className="text-xs font-medium text-[var(--color-primary)]">
            View schedule
          </Link>
        </div>
        {schedule.isLoading ? (
          <PortalLoadingState label="Loading schedule…" />
        ) : upcoming.length === 0 ? (
          <PortalEmptyState
            title="Nothing scheduled"
            description="Open invoices with due dates appear here when the schedule API is available."
            Icon={CalendarClock}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {upcoming.map((item) => (
              <PortalAnimatedListItem key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <Link to={`/vendor/invoices/${item.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{item.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[item.dueDate ? `Due ${item.dueDate}` : null, formatVendorMoney(item.outstanding ?? item.amount, item.currencyCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </Link>
                {item.overdue ? <Badge variant="danger">OVERDUE</Badge> : null}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </section>
    </PortalAnimatedPage>
  );
}
