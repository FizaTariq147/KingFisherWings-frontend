import { useMemo, useState } from 'react';
import { Download, HandCoins } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
} from '@/features/portal-auth/components/portal-ui';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import {
  useDownloadVendorRemittance,
  useVendorPayments,
  useVendorPaymentsSummary,
} from '../hooks/useVendorPayments';

export default function VendorPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    [page, search, fromDate, toDate],
  );
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorPayments(params);
  const summary = useVendorPaymentsSummary();
  const remittance = useDownloadVendorRemittance();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Payments" description="Posted payments and remittance advice." />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}
      {summary.data ? (
        <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2">
          <PortalAnimatedGridItem>
            <PortalStatCard
              label="Pending"
              value={
                summary.data.totalOutstanding != null
                  ? `${summary.data.currencyCode || ''} ${summary.data.totalOutstanding}`.trim()
                  : '—'
              }
            />
          </PortalAnimatedGridItem>
          <PortalAnimatedGridItem>
            <PortalStatCard
              label="Received YTD"
              value={
                summary.data.totalPaidYtd != null
                  ? `${summary.data.currencyCode || ''} ${summary.data.totalPaidYtd}`.trim()
                  : '—'
              }
            />
          </PortalAnimatedGridItem>
        </PortalAnimatedGrid>
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
          />
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
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState title="No payments" description="Payments posted to your account appear here." Icon={HandCoins} />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((pay) => (
              <PortalAnimatedListItem key={pay.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{pay.reference || pay.id}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[pay.paymentDate, pay.method, formatVendorMoney(pay.amount, pay.currencyCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pay.status ? <Badge variant="info">{pay.status.replaceAll('_', ' ')}</Badge> : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={remittance.isPending}
                    onClick={() => {
                      setPdfError(null);
                      void remittance
                        .mutateAsync({ id: pay.id, name: `remittance-${pay.reference || pay.id}.pdf` })
                        .catch((err) => {
                          setPdfError(vendorErrorMessage(err, 'Could not download remittance PDF.'));
                        });
                    }}
                  >
                    <Download size={14} />
                    Remittance
                  </Button>
                </div>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 ? (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
      ) : null}
    </div>
  );
}
