import { useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { useVendorCreditNotes } from '../hooks/useVendorCreditNotes';

export default function VendorCreditNotesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const params = useMemo(
    () => ({ page, limit: 20, search: search.trim() || undefined }),
    [page, search],
  );
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorCreditNotes(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Credit notes" description="Credit notes issued against your vendor account." />
      <PortalPanel padded>
        <Input
          label="Search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </PortalPanel>
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No credit notes"
            description="An empty list is valid — none have been issued yet."
            Icon={Receipt}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((note) => (
              <PortalAnimatedListItem key={note.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{note.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[note.creditDate, note.reference, formatVendorMoney(note.amount, note.currencyCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                {note.status ? <Badge variant="info">{note.status.replaceAll('_', ' ')}</Badge> : null}
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
