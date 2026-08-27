import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsItems } from '../hooks/useWms';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function WmsItemsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } = useWmsItems({
    page,
    limit: 20,
    search: debouncedSearch.trim() || undefined,
  });

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS Items"
        description="SKU master — codes, UOM, and low-stock thresholds."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button type="button" onClick={() => navigate(`${WMS_ROUTE_PREFIX}/items/new`)}>
              <Plus className="h-4 w-4" />
              New item
            </Button>
          </>
        }
      />

      <Card className="space-y-4 p-4">
        <Input
          label="Search"
          placeholder="Code or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getErrorMessage(error)}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : !items.length ? (
          <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">No items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-neutral-200)] text-left text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">UOM</th>
                  <th className="px-3 py-2 font-medium">Low stock</th>
                  <th className="px-3 py-2 font-medium">Active</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-neutral-100)]">
                    <td className="px-3 py-2.5 font-medium">{item.code}</td>
                    <td className="px-3 py-2.5">{item.name}</td>
                    <td className="px-3 py-2.5">{item.uom_code ?? '—'}</td>
                    <td className="px-3 py-2.5">{item.low_stock_threshold ?? '—'}</td>
                    <td className="px-3 py-2.5">{item.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        className="text-xs font-medium text-[var(--color-primary-600)] hover:underline"
                        onClick={() => navigate(`${WMS_ROUTE_PREFIX}/items/${item.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[var(--color-neutral-500)]">
              Page {meta.page} of {meta.totalPages} ({meta.total} items)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
