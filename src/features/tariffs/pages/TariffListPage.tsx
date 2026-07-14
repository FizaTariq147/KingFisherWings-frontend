import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TARIFF_ROUTE_PREFIX } from '../api/tariff.api';
import {
  TariffConfirmModal,
  type TariffConfirmAction,
} from '../components/TariffConfirmModal';
import { TariffFilters } from '../components/TariffFilters';
import { TariffTable } from '../components/TariffTable';
import { DEFAULT_TARIFF_PAGE_SIZE } from '../constants/tariff.constants';
import {
  useDeleteTariff,
  useDuplicateTariff,
  useSetTariffActive,
  useTariffs,
} from '../hooks/useTariffs';
import type { Tariff } from '../types/tariff.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function TariffListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: TariffConfirmAction; tariff: Tariff } | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search, 300);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, order]);

  const listParams = {
    page,
    limit: DEFAULT_TARIFF_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useTariffs(listParams);
  const setActive = useSetTariffActive();
  const remove = useDeleteTariff();
  const duplicate = useDuplicateTariff();

  const tariffs = data?.tariffs ?? [];
  const meta = data?.meta;

  const run = async (tariff: Tariff, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    setPendingId(tariff.id);
    try {
      const result = await fn();
      setConfirm(null);
      if (result && typeof result === 'object' && 'id' in result) {
        const created = result as Tariff;
        if (created.id !== tariff.id) {
          navigate(`${TARIFF_ROUTE_PREFIX}/${created.id}`);
          return;
        }
      }
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
            Online Tariff Master
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Sale and cost rates by service, lane, and charge code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${TARIFF_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <TariffFilters
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
              {getErrorMessage(error) || 'Failed to load tariffs.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <TariffTable
            tariffs={tariffs}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            pendingId={pendingId}
            onView={(t) => navigate(`${TARIFF_ROUTE_PREFIX}/${t.id}`)}
            onEdit={(t) => navigate(`${TARIFF_ROUTE_PREFIX}/${t.id}/edit`)}
            onDuplicate={(t) => setConfirm({ action: 'duplicate', tariff: t })}
            onActivate={(t) => setConfirm({ action: 'activate', tariff: t })}
            onDeactivate={(t) => setConfirm({ action: 'deactivate', tariff: t })}
            onDelete={(t) => setConfirm({ action: 'delete', tariff: t })}
          />
        )}
      </Card>

      {confirm && (
        <TariffConfirmModal
          open
          action={confirm.action}
          tariff={confirm.tariff}
          isPending={pendingId === confirm.tariff.id}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const { action, tariff } = confirm;
            if (action === 'activate')
              return run(tariff, () => setActive.mutateAsync({ id: tariff.id, is_active: true }));
            if (action === 'deactivate')
              return run(tariff, () => setActive.mutateAsync({ id: tariff.id, is_active: false }));
            if (action === 'delete') return run(tariff, () => remove.mutateAsync(tariff.id));
            if (action === 'duplicate')
              return run(tariff, () => duplicate.mutateAsync(tariff.id));
            return undefined;
          }}
        />
      )}
    </div>
  );
}
