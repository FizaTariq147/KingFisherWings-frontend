import { useMemo, useState } from 'react';
import { Landmark } from 'lucide-react';
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
import { useVendorAdvances } from '../hooks/useVendorPayments';

export default function VendorAdvancesPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorAdvances(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Advances"
        description="Posted payments with an unallocated balance."
      />
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No advances"
            description="Unallocated payment balances appear here."
            Icon={Landmark}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((pay) => (
              <PortalAnimatedListItem key={pay.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{pay.reference || pay.id}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[pay.paymentDate, formatVendorMoney(pay.amount, pay.currencyCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {pay.status ? <Badge variant="info">{pay.status.replaceAll('_', ' ')}</Badge> : null}
                  <div className="mt-1 text-sm font-semibold">
                    {formatVendorMoney(pay.unallocatedAmount ?? pay.amount, pay.currencyCode)}
                  </div>
                  <div className="text-[11px] text-[var(--color-neutral-400)]">Unallocated</div>
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
