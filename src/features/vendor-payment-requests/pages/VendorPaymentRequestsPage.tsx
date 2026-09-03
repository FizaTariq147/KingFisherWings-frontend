import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { useVendorPaymentRequests } from '../hooks/useVendorPaymentRequests';

export default function VendorPaymentRequestsPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorPaymentRequests(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Payment requests"
        description="Read-only payment requests raised by your forwarder."
      />
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No payment requests"
            description="Payment requests appear here when staff raise them."
            Icon={ScrollText}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((req) => (
              <PortalAnimatedListItem key={req.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <Link to={`/vendor/payment-requests/${req.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{req.number || req.id}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[req.requestedAt, req.notes, formatVendorMoney(req.amount, req.currencyCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </Link>
                {req.status ? <Badge variant="info">{req.status.replaceAll('_', ' ')}</Badge> : null}
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
