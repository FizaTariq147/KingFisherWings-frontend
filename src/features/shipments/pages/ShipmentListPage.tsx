import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListRowEditButton } from '@/components/ui/ListRowEditButton';
import {
  EmptyState,
  ErrorState,
  OperationTypeBadge,
  StatusBadge,
} from '@/components/erp';
import { departmentByKey } from '@/features/jobs/config/departmentNav';
import { appType, erpTable, listShell } from '@/lib/erpTypography';
import {
  ShipmentFilters,
  shipmentFilterDraftToListParams,
  useShipmentFilterDraft,
} from '../components/ShipmentFilters';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { useShipmentPaths } from '../hooks/useShipmentPaths';
import { useShipments } from '../hooks/useShipments';
import { useShipmentsPermissions } from '../hooks/useShipmentsPermissions';
import { getErrorMessage } from '../utils/getErrorMessage';
import { shipmentDisplayNumber } from '../utils/normalizeShipment';

export default function ShipmentListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dept = departmentByKey(searchParams.get('dept'));
  const paths = useShipmentPaths();
  const { canReadApi, canWriteCreate } = useShipmentsPermissions();
  const [page, setPage] = useState(1);
  const { draft, setDraft, applied, submit, applyPatch } = useShipmentFilterDraft(20);

  useEffect(() => {
    const jobType = !dept
      ? ''
      : dept.jobTypes.length === 1
        ? (dept.primaryType as JobType)
        : '';
    applyPatch({ jobType });
    setPage(1);
  }, [dept?.key]); // eslint-disable-line react-hooks/exhaustive-deps -- sync from ?dept=

  useEffect(() => {
    setPage(1);
  }, [applied]);

  const listParams = useMemo(
    () => shipmentFilterDraftToListParams(applied, page),
    [applied, page],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useShipments(listParams);
  const shipments = useMemo(() => {
    const rows = data?.shipments ?? [];
    if (!dept || dept.jobTypes.length <= 1) return rows;
    const allowed = new Set(dept.jobTypes.map(String));
    return rows.filter((s) => {
      const code = s.job_type || s.service_type;
      return Boolean(code && allowed.has(String(code)));
    });
  }, [data?.shipments, dept]);
  const meta = data?.meta;

  return (
    <div className={listShell.page}>
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>
              {dept ? `${dept.label} · Shipments` : 'Shipments'}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canWriteCreate ? (
              <Button
                type="button"
                variant="create"
                size="sm"
                leftIcon={<Plus />}
                onClick={() => navigate(paths.create)}
              >
                Create
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={isFetching ? 'animate-spin' : undefined} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </div>
        </div>

        <ShipmentFilters
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => {
            setPage(1);
            submit();
          }}
          isSubmitting={isFetching}
        />

        {!canReadApi ? (
          <div className="px-3 pb-4">
            <ErrorState message="Missing permission: shipments.view" />
          </div>
        ) : isError ? (
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
            description="Adjust filters and click Submit, or create a shipment."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={listShell.table}>
                <thead>
                  <tr>
                    <th className={`${erpTable.th} w-10`}>{''}</th>
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
                      onClick={() => navigate(paths.detail(s.id))}
                    >
                      <td className={erpTable.td} onClick={(e) => e.stopPropagation()}>
                        <ListRowEditButton
                          title="Edit shipment"
                          onClick={() =>
                            navigate(paths.detail(s.id), { state: { startEdit: true } })
                          }
                        />
                      </td>
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
                        {s.job_number || '—'}
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
