import { Button } from '@/components/ui/Button';
import { EntityHistoryList } from '@/features/shared/history/EntityHistoryList';
import { useInvoiceHistory } from '../hooks/useInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';

export function InvoiceHistoryPanel({ invoiceId }: { invoiceId: string }) {
  const query = useInvoiceHistory(invoiceId, Boolean(invoiceId));
  const items = query.data ?? [];

  if (query.isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(query.error) || 'Unable to load invoice history.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <EntityHistoryList
      loading={query.isLoading}
      empty="No history yet."
      toolbar={
        items.length > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
        ) : undefined
      }
      items={items.map((row) => ({
        id: row.id,
        title: row.action || row.summary || 'Change',
        subtitle: row.summary && row.action ? row.summary : undefined,
        when: row.createdAt || undefined,
        actor: row.actorName || undefined,
      }))}
    />
  );
}
