import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityHistoryList } from '@/features/shared/history/EntityHistoryList';
import { usePartyHistory } from '../../hooks/useParties';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface PartyHistorySectionProps {
  partyId: string;
}

export function PartyHistorySection({ partyId }: PartyHistorySectionProps) {
  const { data = [], isLoading, isError, error, refetch, isFetching } = usePartyHistory(partyId);

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">Transaction history</h3>
        <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {isError ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-danger-600)]">
            {getErrorMessage(error) || 'Failed to load party history.'}
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <EntityHistoryList
          loading={isLoading}
          empty="No history entries yet for this party. Ops history stays empty until the customer has at least one converted quote."
          items={data.map((entry, index) => ({
            id: entry.id || `${entry.label}-${entry.date}-${index}`,
            title: entry.label,
            subtitle: [entry.type, entry.reference, entry.status].filter(Boolean).join(' · ') || undefined,
            when: entry.date || undefined,
          }))}
        />
      )}
    </Card>
  );
}
