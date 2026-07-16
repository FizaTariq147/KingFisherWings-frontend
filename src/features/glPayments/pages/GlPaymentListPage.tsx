import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { GL_PAYMENT_ROUTE_PREFIX } from '../api/glPayment.api';
import { GlPaymentFilters } from '../components/GlPaymentFilters';
import { GlPaymentTable } from '../components/GlPaymentTable';
import {
  DEFAULT_GL_PAYMENT_PAGE_SIZE,
  type GlPaymentStatus,
  type PaymentDirection,
} from '../constants/glPayment.constants';
import { useGlPayments } from '../hooks/useGlPayments';
import { canManageGlPayments } from '../utils/paymentPermissions';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function GlPaymentListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<PaymentDirection | 'all'>('all');
  const [status, setStatus] = useState<GlPaymentStatus | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const canWritePayments = canManageGlPayments({
    permissions: user?.permissions,
    role: user?.role,
  });

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, direction, status, fromDate, toDate]);

  const listParams = {
    search: debouncedSearch.trim() || undefined,
    direction: direction === 'all' ? undefined : direction,
    status: status === 'all' ? undefined : status,
    from_date: fromDate.trim() || undefined,
    to_date: toDate.trim() || undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useGlPayments(listParams);
  const all = data?.payments ?? [];
  const total = all.length;
  const pageSize = DEFAULT_GL_PAYMENT_PAGE_SIZE;
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
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Payments (AR/AP)
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Customer receipts and vendor payments with invoice allocations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/new?direction=RECEIPT`)}
            disabled={!canWritePayments}
            title={!canWritePayments ? 'Requires gl.manage_payments' : undefined}
          >
            <Plus className="h-4 w-4" />
            New receipt
          </Button>
          <Button
            type="button"
            onClick={() => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/new?direction=PAYMENT`)}
            disabled={!canWritePayments}
            title={!canWritePayments ? 'Requires gl.manage_payments' : undefined}
          >
            <Plus className="h-4 w-4" />
            New vendor payment
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <GlPaymentFilters
          search={search}
          onSearchChange={setSearch}
          direction={direction}
          onDirectionChange={setDirection}
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
              {getErrorMessage(error) || 'Failed to load payments.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <GlPaymentTable
            payments={paged}
            isFetching={isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            onPage={setPage}
            onView={(p) => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${p.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
