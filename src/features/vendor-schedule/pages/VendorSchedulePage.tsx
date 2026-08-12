import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { useVendorSchedule } from '../hooks/useVendorSchedule';

export default function VendorSchedulePage() {
  const { data, isLoading, isError, error, refetch } = useVendorSchedule();
  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Schedule"
        description="Open purchase invoices with due and overdue amounts."
      />
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-3">
        <PortalAnimatedGridItem>
          <PortalStatCard label="Open" value={data?.dueCount ?? (isLoading ? '…' : 0)} Icon={CalendarClock} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Overdue" value={data?.overdueCount ?? (isLoading ? '…' : 0)} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Outstanding" value={formatVendorMoney(data?.outstandingTotal)} />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>
      <PortalPanel>
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState title="Nothing due" description="Open invoices with due dates appear here." Icon={CalendarClock} />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((item) => (
              <PortalAnimatedListItem key={item.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <Link to={`/vendor/invoices/${item.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{item.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[item.dueDate ? `Due ${item.dueDate}` : null, formatVendorMoney(item.outstanding ?? item.amount, item.currencyCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </Link>
                {item.overdue || item.status ? (
                  <Badge variant={item.overdue ? 'danger' : 'info'}>
                    {item.overdue ? 'OVERDUE' : (item.status || '').replaceAll('_', ' ')}
                  </Badge>
                ) : null}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
