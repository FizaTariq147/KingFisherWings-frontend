import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ZIP_DISTANCE_ROUTE_PREFIX } from '../api/zipDistance.api';
import {
  ZipDistanceConfirmModal,
  type ZipDistanceConfirmAction,
} from '../components/ZipDistanceConfirmModal';
import { ZipDistanceFilters } from '../components/ZipDistanceFilters';
import { ZipDistanceTable } from '../components/ZipDistanceTable';
import { DEFAULT_ZIP_DISTANCE_PAGE_SIZE } from '../constants/zipDistance.constants';
import {
  useDeleteZipDistance,
  useSetZipDistanceActive,
  useZipDistances,
} from '../hooks/useZipDistances';
import type { ZipDistance } from '../types/zipDistance.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function ZipDistanceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    action: ZipDistanceConfirmAction;
    item: ZipDistance;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, order]);

  const listParams = {
    page,
    limit: DEFAULT_ZIP_DISTANCE_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useZipDistances(listParams);
  const setActive = useSetZipDistanceActive();
  const remove = useDeleteZipDistance();

  const items = data?.items ?? [];
  const meta = data?.meta;

  const run = async (item: ZipDistance, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    setPendingId(item.id);
    try {
      await fn();
      setConfirm(null);
      setActionMessage('Action completed.');
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
            onClick={() => navigate('/quotations')}
          >
            ← Quotations
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Zip Distance Master
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Maintain distances between zip / location codes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <ZipDistanceFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          order={order}
          onOrderChange={setOrder}
        />

        {actionError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}
        {actionMessage && (
          <div
            role="status"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-success-100)',
              borderColor: '#BBF7D0',
              color: 'var(--color-success-700)',
            }}
          >
            {actionMessage}
          </div>
        )}

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(error) || 'Failed to load zip distances.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <ZipDistanceTable
            items={items}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingId={pendingId}
            onView={(item) => navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${item.id}`)}
            onEdit={(item) => navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${item.id}/edit`)}
            onActivate={(item) => setConfirm({ action: 'activate', item })}
            onDeactivate={(item) => setConfirm({ action: 'deactivate', item })}
            onDelete={(item) => setConfirm({ action: 'delete', item })}
          />
        )}
      </Card>

      {confirm && (
        <ZipDistanceConfirmModal
          open
          action={confirm.action}
          item={confirm.item}
          isPending={pendingId === confirm.item.id}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const { action, item } = confirm;
            if (action === 'activate')
              return run(item, () => setActive.mutateAsync({ id: item.id, is_active: true }));
            if (action === 'deactivate')
              return run(item, () => setActive.mutateAsync({ id: item.id, is_active: false }));
            if (action === 'delete') return run(item, () => remove.mutateAsync(item.id));
            return undefined;
          }}
        />
      )}
    </div>
  );
}
