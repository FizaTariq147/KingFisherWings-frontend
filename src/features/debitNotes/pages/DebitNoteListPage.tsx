import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { InvoiceStatus, InvoiceType } from '@/features/invoices/constants/invoice.constants';
import { AppListPanelBody } from '@/components/motion';
import { DEBIT_NOTE_ROUTE_PREFIX } from '../api/debitNote.api';
import { DebitNoteFilters } from '../components/DebitNoteFilters';
import { DebitNoteTable } from '../components/DebitNoteTable';
import { DEFAULT_DEBIT_NOTE_PAGE_SIZE } from '../constants/debitNote.constants';
import { useDebitNotes } from '../hooks/useDebitNotes';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function DebitNoteListPage() {
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
    limit: DEFAULT_DEBIT_NOTE_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    status: status === 'all' ? undefined : status,
    invoice_type: invoiceType === 'all' ? undefined : invoiceType,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useDebitNotes(listParams);
  const debitNotes = data?.debitNotes ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="mb-1 text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
            onClick={() => navigate('/finance')}
          >
            ← Finance
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">All Debit Notes</h2>
          <p className="mt-0.5 text-sm text-[var(--color-neutral-400)]">
            Search and filter debit notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${DEBIT_NOTE_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <Card className="space-y-4 p-4">
        <DebitNoteFilters
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
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getErrorMessage(error) || 'Failed to load debit notes.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <AppListPanelBody isLoading={isLoading} isFetching={isFetching}>
            <DebitNoteTable
              debitNotes={debitNotes}
              isFetching={isFetching}
              meta={meta}
              onPage={setPage}
              onView={(dn) => navigate(`${DEBIT_NOTE_ROUTE_PREFIX}/${dn.id}`)}
            />
          </AppListPanelBody>
        )}
      </Card>
    </div>
  );
}
