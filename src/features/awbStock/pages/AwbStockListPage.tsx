import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { AWB_STOCK_ROUTE_PREFIX } from '../api/awbStock.api';
import {
  AwbStockConfirmModal,
  type AwbStockConfirmAction,
} from '../components/AwbStockConfirmModal';
import {
  AwbStockErrorBanner,
  AwbStockSuccessBanner,
  AwbStockWarningBanner,
} from '../components/AwbStockBanners';
import { AwbStockFilters } from '../components/AwbStockFilters';
import { AwbStockTable } from '../components/AwbStockTable';
import { DEFAULT_AWB_STOCK_PAGE_SIZE } from '../constants/awbStock.constants';
import {
  useAwbLowStockReport,
  useAwbStockBatches,
  useDeleteAwbStockBatch,
} from '../hooks/useAwbStock';
import type { AwbStockBatch } from '../types/awbStock.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function AwbStockListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [airlineId, setAirlineId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    action: AwbStockConfirmAction;
    batch: AwbStockBatch;
  } | null>(null);

  const { data: airlines = [] } = useMasterOptions('airlines', MASTER_PATHS.airlines, true);
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);

  const airlineOptions = useMemo(
    () => [
      { value: '', label: 'All airlines' },
      ...airlines
        .filter((a) => isUuid(String(a.id)))
        .map((a) => ({
          value: String(a.id),
          label: [a.code, a.name].filter(Boolean).join(' — ') || String(a.id),
        })),
    ],
    [airlines],
  );

  const branchOptions = useMemo(
    () => [
      { value: '', label: 'All branches' },
      ...branches
        .filter((b) => isUuid(String(b.id)))
        .map((b) => ({
          value: String(b.id),
          label: [b.code, b.name].filter(Boolean).join(' — ') || String(b.id),
        })),
    ],
    [branches],
  );

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, airlineId, branchId, lowStockOnly, order]);

  const hasFilters = Boolean(
    debouncedSearch.trim() || airlineId || branchId || lowStockOnly,
  );

  const listParams = {
    page,
    limit: DEFAULT_AWB_STOCK_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    airline_id: airlineId || undefined,
    branch_id: branchId || undefined,
    low_stock_only: lowStockOnly || undefined,
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAwbStockBatches(listParams);
  const { data: lowStock = [], refetch: refetchLowStock } = useAwbLowStockReport();
  const remove = useDeleteAwbStockBatch();

  const batches = data?.items ?? [];
  const meta = data?.meta;

  const run = async (batch: AwbStockBatch, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    setPendingId(batch.id);
    try {
      await fn();
      setConfirm(null);
      setActionMessage('Batch deleted.');
      await Promise.all([refetch(), refetchLowStock()]);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/masters')}
          >
            ← Masters
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            AWB Stock Master
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Maintain airline AWB number stock batches, allocations, and low-stock alerts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void refetch();
              void refetchLowStock();
            }}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${AWB_STOCK_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            Register batch
          </Button>
        </div>
      </div>

      {lowStock.length > 0 && !lowStockOnly ? (
        <AwbStockWarningBanner
          message={`${lowStock.length} batch${lowStock.length === 1 ? '' : 'es'} at or below low-stock threshold.`}
          onClick={() => setLowStockOnly(true)}
        />
      ) : null}

      <Card className="p-4 space-y-4">
        <AwbStockFilters
          search={search}
          onSearchChange={setSearch}
          airlineId={airlineId}
          onAirlineIdChange={setAirlineId}
          airlineOptions={airlineOptions}
          branchId={branchId}
          onBranchIdChange={setBranchId}
          branchOptions={branchOptions}
          lowStockOnly={lowStockOnly}
          onLowStockOnlyChange={setLowStockOnly}
          order={order}
          onOrderChange={setOrder}
        />

        {actionError ? <AwbStockErrorBanner message={actionError} /> : null}
        {actionMessage ? <AwbStockSuccessBanner message={actionMessage} /> : null}

        {isError ? (
          <div className="space-y-3 py-8">
            <AwbStockErrorBanner
              message={getErrorMessage(error) || 'Failed to load AWB stock batches.'}
            />
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <AwbStockTable
            batches={batches}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingId={pendingId}
            emptyMessage={
              hasFilters
                ? 'No batches match the current filters'
                : 'No AWB stock batches found'
            }
            onView={(b) => navigate(`${AWB_STOCK_ROUTE_PREFIX}/${b.id}`)}
            onEdit={(b) => navigate(`${AWB_STOCK_ROUTE_PREFIX}/${b.id}/edit`)}
            onDelete={(b) => setConfirm({ action: 'delete', batch: b })}
          />
        )}
      </Card>

      {confirm && (
        <AwbStockConfirmModal
          open
          action={confirm.action}
          batch={confirm.batch}
          isPending={Boolean(pendingId)}
          onClose={() => setConfirm(null)}
          onConfirm={() =>
            run(confirm.batch, () => remove.mutateAsync(confirm.batch.id))
          }
        />
      )}
    </div>
  );
}
