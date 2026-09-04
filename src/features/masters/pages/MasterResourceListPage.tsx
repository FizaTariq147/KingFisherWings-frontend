import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { MasterListPage } from '@/components/layout/MasterListPage';
import { isUuid } from '@/lib/isUuid';
import { getMasterResource } from '../config/masterResources';
import {
  masterKeys,
  useMasterList,
  useMasterMutations,
} from '../hooks/useMasterResource';
import {
  useMasterPageRoute,
  type MasterPageRouteProps,
} from '../hooks/useMasterPageRoute';
import { masterService } from '../services/master.service';
import { masterDisplayValue } from '../utils/normalizeMasterRecord';
import type { MasterListParams, MasterStatusFilter } from '../types/master.types';

const PAGE_SIZE = 20;
const WORLD_PLACE_PAGE_SIZE = 50;
/** Treat tenants below this as “almost none” for world catalog sync. */
const WORLD_PLACE_TINY_TOTAL = 50;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function isWorldPlaceResource(key: string): boolean {
  return key === 'ports' || key === 'airports';
}

export default function MasterResourceListPage(props: MasterPageRouteProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resourceKey, backHref, backLabel, newPath, detailPath, editPath } =
    useMasterPageRoute(props);
  const resource = getMasterResource(resourceKey);
  const worldPlace = isWorldPlaceResource(resourceKey);
  const pageSize = worldPlace ? WORLD_PLACE_PAGE_SIZE : PAGE_SIZE;
  const listResourceKey = resource?.key ?? resourceKey;
  const basePath = resource?.basePath ?? '';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MasterStatusFilter>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const autoSeedAttempted = useRef(false);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
    autoSeedAttempted.current = false;
    setSeedMessage(null);
  }, [debouncedSearch, status, order, resourceKey]);

  const listParams: MasterListParams = {
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    order,
    extra: resource?.listDefaults,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useMasterList(
    listResourceKey,
    basePath,
    listParams,
  );
  const mutations = useMasterMutations(listResourceKey, basePath);

  const fetchFreshList = async (pageNo = 1) => {
    const freshParams: MasterListParams = {
      page: pageNo,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      is_active: status === 'all' ? undefined : status === 'active',
      order,
      extra: resource?.listDefaults,
    };
    const fresh = await masterService.list(basePath, freshParams);
    queryClient.setQueryData(masterKeys.list(listResourceKey, freshParams), fresh);
    await queryClient.invalidateQueries({ queryKey: masterKeys.resource(listResourceKey) });
    setPage(pageNo);
    return fresh;
  };

  /**
   * Soft-delete visible rows when the tenant only has a tiny catalog.
   * Note: soft-deleted rows may still block seed-defaults on the backend.
   */
  const clearTinyCatalog = async () => {
    let guard = 0;
    while (guard < 20) {
      guard += 1;
      const pageResult = await masterService.list(basePath, {
        page: 1,
        limit: 100,
        order: 'asc',
      });
      if (!pageResult.items.length) break;
      for (const row of pageResult.items) {
        if (!isUuid(String(row.id))) continue;
        try {
          await masterService.softDelete(basePath, String(row.id));
        } catch {
          /* continue clearing what we can */
        }
      }
      if ((pageResult.meta.total ?? 0) <= pageResult.items.length) {
        const check = await masterService.list(basePath, { page: 1, limit: 1, order: 'asc' });
        if ((check.meta.total ?? check.items.length) === 0) break;
      }
    }
  };

  const pollAfterSeed = async (catalogSize: number) => {
    await new Promise((r) => window.setTimeout(r, 400));
    let fresh = await fetchFreshList(1);
    let lastInserted = 0;
    if ((fresh.meta.total ?? fresh.items.length) < 50 && catalogSize > 50) {
      setSeedMessage('Seed accepted — waiting for rows to appear…');
      for (let i = 0; i < 6; i += 1) {
        await new Promise((r) => window.setTimeout(r, 1500));
        fresh = await fetchFreshList(1);
        if ((fresh.meta.total ?? 0) >= 50) break;
        if (i === 2) {
          try {
            const again = await mutations.seedDefaults.mutateAsync({});
            lastInserted = again.inserted;
          } catch {
            /* ignore mid-poll seed errors */
          }
        }
      }
    }
    return { fresh, lastInserted };
  };

  const runSeed = async (mode: 'sync' | 'replace') => {
    if (!basePath) return;
    setActionError(null);
    setSeeding(true);
    setSeedMessage(
      mode === 'replace'
        ? 'Clearing visible tiny catalog, then seeding…'
        : 'Syncing world catalog…',
    );
    try {
      const before = await masterService.list(basePath, { page: 1, limit: 1, order: 'asc' });
      const beforeTotal = before.meta.total ?? before.items.length;

      let didClear = false;
      if (mode === 'replace') {
        if (beforeTotal > WORLD_PLACE_TINY_TOTAL) {
          throw new Error(
            `Refusing to replace: tenant already has ${beforeTotal} rows (limit ${WORLD_PLACE_TINY_TOTAL}).`,
          );
        }
        if (beforeTotal > 0) {
          setSeedMessage(
            `Soft-deleting ${beforeTotal} visible ${resourceKey} row(s), then seeding…`,
          );
          await clearTinyCatalog();
          didClear = true;
        }
      }

      // Empty body only — force/replace payloads have been observed to 500 on some deploys.
      const result = await mutations.seedDefaults.mutateAsync({});
      const { fresh, lastInserted } = await pollAfterSeed(result.catalogSize);
      const loaded = fresh.items.length;
      const total = fresh.meta.total ?? loaded;
      const inserted = Math.max(result.inserted, lastInserted);

      if (total < 50 && result.catalogSize > 50) {
        setSeedMessage(
          `Seed response: catalog_size=${result.catalogSize}, inserted=${inserted}. ` +
            `Tenant list still has ${total} row(s)` +
            `${didClear ? ' after soft-delete' : ''}.`,
        );
        setActionError(
          `World catalog did not load (list ${total}, catalog_size=${result.catalogSize}, inserted=${inserted}). ` +
            `POST /masters/${resourceKey}/seed-defaults no-ops when this tenant still has rows ` +
            `in the DB (including soft-deleted). Backend must hard-purge deleted ${resourceKey} ` +
            `or seed when active count is 0.`,
        );
        return;
      }

      setSeedMessage(
        `World catalog ready — showing ${loaded} of ${total.toLocaleString()} ` +
          `(seed inserted=${inserted}, catalog_size=${result.catalogSize}).`,
      );
    } catch (err) {
      setSeedMessage(null);
      setActionError(err instanceof Error ? err.message : 'Failed to seed world catalog.');
    } finally {
      setSeeding(false);
    }
  };

  // Auto attempt once for tiny catalogs (seed only — does not soft-delete).
  useEffect(() => {
    if (!worldPlace || !resource || !data || isLoading || isError || seeding) return;
    if (autoSeedAttempted.current || mutations.seedDefaults.isPending) return;
    if (debouncedSearch.trim() || status !== 'all') return;
    const total = data.meta?.total ?? data.items.length;
    if (total >= WORLD_PLACE_TINY_TOTAL) return;
    autoSeedAttempted.current = true;
    void runSeed('sync');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldPlace, resource, data, isLoading, isError, debouncedSearch, status, seeding]);

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
  const tenantTotal = meta?.total ?? items.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(tenantTotal / pageSize) || 1);
  const supportsActiveToggle = resource.fields.some((f) => f.name === 'is_active');
  const rows = items.map((item) => {
    const row: Record<string, string> = { id: item.id };
    for (const col of resource.columns) {
      row[col.key] = masterDisplayValue(item, col.key);
    }
    return row;
  });
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
          onClick={() => navigate(backHref)}
        >
          ← {backLabel}
        </button>
        {worldPlace ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={seeding || isFetching}
              onClick={() => void refetch()}
            >
              Refresh list
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={seeding || isFetching}
              onClick={() => void runSeed('sync')}
            >
              {seeding ? 'Syncing…' : 'Sync world catalog'}
            </Button>
            {tenantTotal > 0 && tenantTotal < WORLD_PLACE_TINY_TOTAL ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={seeding || isFetching}
                onClick={() => {
                  if (
                    !window.confirm(
                      `This will soft-delete the ${tenantTotal} visible ${resourceKey} row(s), then seed. Soft-deleted rows can still block seed until the backend hard-purges them. Continue?`,
                    )
                  ) {
                    return;
                  }
                  void runSeed('replace');
                }}
              >
                Replace tiny catalog & sync
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {worldPlace ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          GET /masters/{resourceKey} (page size {pageSize}, name order). Sync runs POST
          /masters/{resourceKey}/seed-defaults then reloads this page.
          {tenantTotal > 0 ? ` Currently ${tenantTotal.toLocaleString()} rows in tenant.` : ''}
          {tenantTotal > 0 && tenantTotal < WORLD_PLACE_TINY_TOTAL
            ? ' Sync only calls seed-defaults (no delete). Soft-deleted rows in the DB can still block seed.'
            : ''}
        </p>
      ) : null}

      {seedMessage && (
        <p className="text-sm text-[var(--color-neutral-600)]" role="status">
          {seedMessage}
        </p>
      )}

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
        pageSize={meta?.limit ?? pageSize}
        totalPages={totalPages}
        total={tenantTotal}
        onPage={setPage}
        isLoading={isLoading || seeding}
        isFetching={isFetching}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : null}
        animateRows={!worldPlace}
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
