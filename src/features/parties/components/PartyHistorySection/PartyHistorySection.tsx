import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePartyHistory } from '../../hooks/useParties';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface PartyHistorySectionProps {
  partyId: string;
}

export function PartyHistorySection({ partyId }: PartyHistorySectionProps) {
  const { data = [], isLoading, isError, error, refetch, isFetching } = usePartyHistory(partyId);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">Transaction history</h3>
        <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading history…</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-danger-600)]">
            {getErrorMessage(error) || 'Failed to load party history.'}
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-400)]">
          No history entries yet for this party.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-neutral-100)]">
          {data.map((entry, index) => (
            <li key={entry.id || `${entry.label}-${entry.date}-${index}`} className="py-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">{entry.label}</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    {[entry.type, entry.reference, entry.status].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {entry.date ? (
                  <span className="text-xs text-[var(--color-neutral-400)] whitespace-nowrap">
                    {entry.date}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
