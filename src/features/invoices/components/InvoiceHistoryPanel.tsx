import { Button } from '@/components/ui/Button';
import { useInvoiceHistory } from '../hooks/useInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';

export function InvoiceHistoryPanel({ invoiceId }: { invoiceId: string }) {
  const query = useInvoiceHistory(invoiceId, Boolean(invoiceId));
  const items = query.data ?? [];

  if (query.isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading history…</p>;
  }
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
  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-neutral-400)]">No history yet.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Refresh
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((row) => (
          <li
            key={row.id}
            className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          >
            <div className="font-medium text-[var(--color-neutral-800)]">
              {row.action || row.summary || 'Change'}
            </div>
            {row.summary && row.action ? (
              <p className="mt-0.5 text-[var(--color-neutral-600)]">{row.summary}</p>
            ) : null}
            <div className="mt-1 text-xs text-[var(--color-neutral-400)]">
              {row.createdAt || '—'}
              {row.actorName ? ` · ${row.actorName}` : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
