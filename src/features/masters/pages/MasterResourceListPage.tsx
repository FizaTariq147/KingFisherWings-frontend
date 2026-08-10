import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterListPage } from '@/components/layout/MasterListPage';
import { isUuid } from '@/lib/isUuid';
import { getMasterResource } from '../config/masterResources';
import { useMasterList, useMasterMutations } from '../hooks/useMasterResource';
import {
  useMasterPageRoute,
  type MasterPageRouteProps,
} from '../hooks/useMasterPageRoute';
import { masterDisplayValue } from '../utils/normalizeMasterRecord';
import type { MasterListParams, MasterStatusFilter } from '../types/master.types';

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function MasterResourceListPage(props: MasterPageRouteProps = {}) {
  const navigate = useNavigate();
  const { resourceKey, backHref, backLabel, newPath, detailPath, editPath } =
    useMasterPageRoute(props);
  const resource = getMasterResource(resourceKey);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MasterStatusFilter>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, order, resourceKey]);

  const listParams: MasterListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    order,
    extra: resource?.listDefaults,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useMasterList(
    resource?.key ?? resourceKey,
    resource?.basePath ?? '',
    listParams,
  );
  const mutations = useMasterMutations(resource?.key ?? resourceKey, resource?.basePath ?? '');

  if (!resource) {
    return (
      <div className="space-y-3 p-2">
        <p className="text-sm text-[var(--color-neutral-600)]">
          Master resource “{resourceKey}” is not connected to a backend API yet.
        </p>
        <button
          type="button"
          className="text-sm text-[var(--color-primary-600)] hover:underline"
          onClick={() => navigate(backHref)}
        >
          ← Back to {backLabel}
        </button>
      </div>
    );
  }

  const items = data?.items ?? [];
  const meta = data?.meta;
  const supportsActiveToggle = resource.fields.some((f) => f.name === 'is_active');
  const rows = items.map((item) => {
    const row: Record<string, string> = { id: item.id };
    for (const col of resource.columns) {
      row[col.key] = masterDisplayValue(item, col.key);
    }
    return row;
  });
  // Holidays have no is_active in CreateHolidayDto — skip status column actions
  const statuses = supportsActiveToggle
    ? items.map((item) => (item.is_active === false ? 'INACTIVE' : 'ACTIVE'))
    : undefined;

  const runAction = async (index: number, action: () => Promise<unknown>) => {
    setActionError(null);
    setPendingIndex(index);
    try {
      await action();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPendingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(backHref)}
      >
        ← {backLabel}
      </button>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {actionError}
        </div>
      )}

      <MasterListPage
        title={resource.title}
        columns={resource.columns}
        rows={rows}
        statuses={statuses}
        search={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusFilterChange={setStatus}
        sortOrder={order}
        onSortOrderChange={setOrder}
        page={meta?.page ?? page}
        pageSize={meta?.limit ?? PAGE_SIZE}
        totalPages={meta?.totalPages ?? 1}
        total={meta?.total}
        onPage={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : null}
        onAdd={() => navigate(newPath)}
        onView={
          resource.createOnly
            ? undefined
            : (index) => {
                const id = items[index]?.id;
                if (!id || !isUuid(id)) {
                  setActionError('Cannot open record — id is not a valid UUID.');
                  return;
                }
                navigate(detailPath(id));
              }
        }
        onEdit={
          resource.createOnly
            ? undefined
            : (index) => {
                const id = items[index]?.id;
                if (!id || !isUuid(id)) {
                  setActionError('Cannot edit record — id is not a valid UUID.');
                  return;
                }
                navigate(editPath(id));
              }
        }
        onDelete={
          resource.supportsDelete === false
            ? undefined
            : (index) => {
                const id = items[index]?.id;
                if (!id || !isUuid(id)) {
                  setActionError('Cannot delete — id is not a valid UUID.');
                  return;
                }
                if (!window.confirm('Soft-delete this record?')) return;
                void runAction(index, () => mutations.remove.mutateAsync(id));
              }
        }
        onToggleActive={
          resource.createOnly || !supportsActiveToggle
            ? undefined
            : (index, nextActive) => {
                const id = items[index]?.id;
                if (!id || !isUuid(id)) {
                  setActionError('Cannot update status — id is not a valid UUID.');
                  return;
                }
                void runAction(index, () =>
                  mutations.setActive.mutateAsync({ id, is_active: nextActive }),
                );
              }
        }
        pendingActionIndex={pendingIndex}
        supportsDelete={resource.supportsDelete !== false}
      />
    </div>
  );
}
