import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { INVOICE_ROUTE_PREFIX } from '../api/invoice.api';
import { InvoiceFilters } from '../components/InvoiceFilters';
import { InvoiceTable } from '../components/InvoiceTable';
import {
  DEFAULT_INVOICE_PAGE_SIZE,
  type InvoiceStatus,
  type InvoiceType,
} from '../constants/invoice.constants';
import { useInvoices } from '../hooks/useInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';
import { AppListPanelBody } from '@/components/motion';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');
  const [invoiceType, setInvoiceType] = useState<InvoiceType | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, invoiceType, fromDate, toDate]);

  const listParams = {
    page,
    limit: DEFAULT_INVOICE_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    status: status === 'all' ? undefined : status,
    invoice_type: invoiceType === 'all' ? undefined : invoiceType,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useInvoices(listParams);
  const invoices = data?.invoices ?? [];
  const meta = data?.meta;

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
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">All Invoices</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Search and filter customer invoices.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${INVOICE_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <InvoiceFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          invoiceType={invoiceType}
          onInvoiceTypeChange={setInvoiceType}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
        />

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load invoices.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <AppListPanelBody isLoading={isLoading} isFetching={isFetching}>
            <InvoiceTable
              invoices={invoices}
              isFetching={isFetching}
              meta={meta}
              onPage={setPage}
              onView={(inv) => navigate(`${INVOICE_ROUTE_PREFIX}/${inv.id}`)}
            />
          </AppListPanelBody>
        )}
      </Card>
    </div>
  );
}
