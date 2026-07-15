import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { INVOICE_ROUTE_PREFIX } from '../api/invoice.api';
import { InvoiceTable } from '../components/InvoiceTable';
import { useOverdueInvoices } from '../hooks/useInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function InvoiceOverduePage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isFetching, isError, error, refetch } = useOverdueInvoices();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/finance')}
          >
            ← Finance
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Overdue invoices
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Past due_date with outstanding balance.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load overdue invoices.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <InvoiceTable
            invoices={data}
            isFetching={isFetching}
            onView={(inv) => navigate(`${INVOICE_ROUTE_PREFIX}/${inv.id}`)}
            emptyMessage="No overdue invoices"
          />
        )}
      </Card>
    </div>
  );
}
