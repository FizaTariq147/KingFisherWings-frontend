import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VOUCHER_ROUTE_PREFIX } from '../api/voucher.api';
import { VoucherFilters } from '../components/VoucherFilters';
import { VoucherTable } from '../components/VoucherTable';
import {
  DEFAULT_VOUCHER_PAGE_SIZE,
  type VoucherStatus,
  type VoucherType,
} from '../constants/voucher.constants';
import { useVouchers } from '../hooks/useVouchers';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function VoucherListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [voucherType, setVoucherType] = useState<VoucherType | 'all'>('all');
  const [status, setStatus] = useState<VoucherStatus | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, voucherType, status, fromDate, toDate]);

  const listParams = {
    search: debouncedSearch.trim() || undefined,
    voucher_type: voucherType === 'all' ? undefined : voucherType,
    status: status === 'all' ? undefined : status,
    from_date: fromDate.trim() || undefined,
    to_date: toDate.trim() || undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useVouchers(listParams);
  const all = data?.vouchers ?? [];
  const total = all.length;
  const pageSize = DEFAULT_VOUCHER_PAGE_SIZE;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }, [all, page, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/accounts')}
          >
            ← Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Vouchers</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Journal, payment, receipt, and other GL vouchers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${VOUCHER_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            New voucher
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <VoucherFilters
          search={search}
          onSearchChange={setSearch}
          voucherType={voucherType}
          onVoucherTypeChange={setVoucherType}
          status={status}
          onStatusChange={setStatus}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
        />

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load vouchers.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <VoucherTable
            vouchers={paged}
            isFetching={isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            onPage={setPage}
            onView={(v) => navigate(`${VOUCHER_ROUTE_PREFIX}/${v.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
