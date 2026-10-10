import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  EmptyState,
  ErrorState,
  FilterBar,
  OperationTypeBadge,
  StatusBadge,
} from '@/components/erp';
import { appType, erpTable, listShell } from '@/lib/erpTypography';
import { SHIPMENT_ROUTE_PREFIX } from '../api/shipment.api';
import { useShipments } from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';
import { shipmentDisplayNumber } from '../utils/normalizeShipment';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function ShipmentListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isFetching, isError, error, refetch } = useShipments({
    page,
    limit: 20,
    search: debouncedSearch.trim() || undefined,
    job_type: jobType || undefined,
  });
  const shipments = data?.shipments ?? [];
  const meta = data?.meta;

  return (
    <div className={listShell.page}>
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>Shipments</h2>
            <p className={appType.pageSubtitle}>
              Approved quotation → shipment → job (FCL Export / Import).
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <FilterBar>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search shipment no…"
            className="h-8 w-full max-w-md rounded-sm border border-[#c5cdd6] px-2.5 text-[13px] sm:mr-auto"
          />
          <select
            value={jobType}
            onChange={(e) => {
              setJobType(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-sm border border-[#c5cdd6] px-2.5 text-[13px]"
          >
            <option value="">All departments</option>
            <option value="SEA_FCL_EXPORT">FCL Export</option>
            <option value="SEA_FCL_IMPORT">FCL Import</option>
          </select>
        </FilterBar>

        {isError ? (
          <div className="px-3">
            <ErrorState
              message={getErrorMessage(error) || 'Failed to load shipments.'}
              onRetry={() => refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-1.5 px-3 py-4" aria-busy>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-sm bg-[#eef2f6]" />
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <EmptyState
            title="No shipments found."
            description="Generate a shipment from an approved quotation."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={listShell.table}>
                <thead>
                  <tr>
                    <th className={erpTable.th}>Shipment No</th>
                    <th className={erpTable.th}>Date</th>
                    <th className={erpTable.th}>Department</th>
                    <th className={erpTable.th}>Customer</th>
                    <th className={erpTable.th}>Status</th>
                    <th className={erpTable.th}>BL</th>
                    <th className={erpTable.th}>POL / POD</th>
                    <th className={erpTable.th}>Job</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr
                      key={s.id}
                      className={`${erpTable.row} cursor-pointer`}
                      onClick={() => navigate(`${SHIPMENT_ROUTE_PREFIX}/${s.id}`)}
                    >
                      <td className={erpTable.td}>
                        <span className="font-semibold text-[var(--color-primary-700)]">
                          {shipmentDisplayNumber(s)}
                        </span>
                      </td>
                      <td className={erpTable.td}>
                        {s.created_at
                          ? new Date(s.created_at).toLocaleDateString(undefined, {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className={erpTable.td}>
                        <OperationTypeBadge code={s.job_type || s.service_type} />
                      </td>
                      <td className={erpTable.td}>{s.party_name || s.customer_name || '—'}</td>
                      <td className={erpTable.td}>
                        <StatusBadge status={s.status} />
                      </td>
                      <td className={erpTable.td}>
                        {s.bl_status ? <StatusBadge status={s.bl_status} /> : '—'}
                      </td>
                      <td className={erpTable.td}>
                        {[s.pol || s.origin_port_name, s.pod || s.dest_port_name]
                          .filter(Boolean)
                          .join(' → ') || '—'}
                      </td>
                      <td className={erpTable.td}>
                        {s.job_number || (s.job_id ? s.job_id.slice(0, 8) : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#d0d7de] px-3 py-2 text-[13px]">
                <span className="text-[#64748b]">{meta.total} shipment(s)</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="px-2 py-1.5">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
