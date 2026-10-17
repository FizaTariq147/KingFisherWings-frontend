import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Ship } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListRowEditButton } from '@/components/ui/ListRowEditButton';
import {
  EmptyState,
  ErrorState,
  OperationTypeBadge,
} from '@/components/erp';
import {
  CrmEnquiryFilters,
  crmEnquiryFilterDraftToListParams,
  useCrmEnquiryFilterDraft,
} from '../components/CrmEnquiryFilters';
import { useCrmEnquiries } from '../hooks/useCrmEnquiries';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import { Pagination, tdClass, thClass } from '../components/CrmUi';
import { getErrorMessage } from '../utils/getErrorMessage';
import { appType, erpTable, listShell } from '@/lib/erpTypography';

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Enquiry Sheet list — Fresa-style permanently shown search filters. */
export default function CrmEnquiriesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { draft, setDraft, applied, submit } = useCrmEnquiryFilterDraft();

  useEffect(() => {
    setPage(1);
  }, [applied]);

  const listParams = useMemo(() => {
    const mapped = crmEnquiryFilterDraftToListParams(applied, page);
    const { service_type: _serviceType, ...apiParams } = mapped;
    return apiParams;
  }, [applied, page]);

  const serviceTypeFilter = applied.serviceType;

  const query = useCrmEnquiries(listParams);

  const items = (query.data?.items ?? []).filter((x) =>
    serviceTypeFilter ? x.service_type === serviceTypeFilter : true,
  );

  return (
    <div className={listShell.page}>
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>Enquiry Sheet</h2>
            <p className={appType.pageSubtitle}>
              Customer Service — create enquiry, then generate quotation → shipment → job.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Ship />}
              onClick={() => navigate('/sales/enquiries/new?service_type=SEA_FCL_EXPORT')}
            >
              FCL Export
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Ship />}
              onClick={() => navigate('/sales/enquiries/new?service_type=SEA_FCL_IMPORT')}
            >
              FCL Import
            </Button>
            <Button
              size="sm"
              type="button"
              variant="create"
              leftIcon={<Plus />}
              onClick={() => navigate('/sales/enquiries/new')}
            >
              Create
            </Button>
          </div>
        </div>

        <CrmEnquiryFilters
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => {
            setPage(1);
            submit();
          }}
          isSubmitting={query.isFetching}
        />

        {query.isLoading ? (
          <div className="space-y-1.5 px-4 py-4" aria-busy>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-sm bg-[#eef2f6]" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="px-4">
            <ErrorState
              message={getErrorMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          </div>
        ) : !items.length ? (
          <EmptyState
            title="No enquiries found."
            description="Adjust filters and click Submit, or create an enquiry."
            action={{
              label: 'Create Enquiry',
              onClick: () => navigate('/sales/enquiries/new'),
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={listShell.table}>
                <thead>
                  <tr>
                    <th className={`${thClass} w-10`}>{''}</th>
                    <th className={thClass}>Enquiry No</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Department</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>POL / POD</th>
                    <th className={thClass}>Currency</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((x) => (
                    <tr key={x.id} className={erpTable.row}>
                      <td className={tdClass}>
                        <ListRowEditButton
                          title="Edit enquiry"
                          onClick={() =>
                            navigate(`/sales/enquiries/${x.id}`, {
                              state: { focusEdit: true },
                            })
                          }
                        />
                      </td>
                      <td className={tdClass}>
                        <Link
                          className="font-semibold text-[var(--color-primary-700)] hover:underline"
                          to={`/sales/enquiries/${x.id}`}
                        >
                          {x.enquiry_number?.trim() || x.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className={tdClass}>{formatDate(x.created_at)}</td>
                      <td className={tdClass}>
                        <OperationTypeBadge code={x.service_type} />
                      </td>
                      <td className={tdClass}>
                        {x.party_name || x.lead_name || '—'}
                      </td>
                      <td className={tdClass}>
                        {[x.origin_port_name, x.dest_port_name]
                          .filter(Boolean)
                          .join(' → ') || '—'}
                      </td>
                      <td className={tdClass}>{x.currency_code}</td>
                      <td className={tdClass}>
                        <CrmStatusBadge status={x.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...query.data!.meta} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
