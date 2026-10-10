import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  EmptyState,
  ErrorState,
  FilterBar,
  OperationTypeBadge,
} from '@/components/erp';
import {
  CRM_PAGE_SIZE,
  ENQUIRY_STATUSES,
  SERVICE_TYPES,
  crmLabel,
  type EnquiryStatus,
  type ServiceType,
} from '../constants/crm.constants';
import { useCrmEnquiries } from '../hooks/useCrmEnquiries';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import {
  Pagination,
  SelectInput,
  tdClass,
  thClass,
} from '../components/CrmUi';
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

/** Enquiry Sheet list — Fresa-style dense operational table. */
export default function CrmEnquiriesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EnquiryStatus | ''>('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [salesperson, setSalesperson] = useState('');
  const query = useCrmEnquiries({
    page,
    limit: CRM_PAGE_SIZE,
    status: status || undefined,
    salesperson_id: salesperson || undefined,
  });

  const items = (query.data?.items ?? []).filter((x) =>
    serviceType ? x.service_type === serviceType : true,
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
              onClick={() => navigate('/sales/enquiries/new?service_type=SEA_FCL_EXPORT')}
            >
              FCL Export
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/sales/enquiries/new?service_type=SEA_FCL_IMPORT')}
            >
              FCL Import
            </Button>
            <button
              type="button"
              onClick={() => navigate('/sales/enquiries/new')}
              className={appType.listCreateBtn}
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
          </div>
        </div>

        <FilterBar>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <SelectInput
              className="sm:max-w-[10rem]"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as EnquiryStatus | '');
              }}
            >
              <option value="">All statuses</option>
              {ENQUIRY_STATUSES.map((x) => (
                <option key={x} value={x}>
                  {crmLabel(x)}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              className="sm:max-w-[11rem]"
              value={serviceType}
              onChange={(e) => {
                setPage(1);
                setServiceType(e.target.value as ServiceType | '');
              }}
            >
              <option value="">All services</option>
              {SERVICE_TYPES.map((x) => (
                <option key={x} value={x}>
                  {crmLabel(x)}
                </option>
              ))}
            </SelectInput>
            <div className="min-w-[11rem] flex-1 sm:max-w-xs [&_label>span]:sr-only">
              <CrmSalespersonSelect
                label="Salesperson"
                placeholder="All salespeople"
                value={salesperson}
                onChange={(v) => {
                  setPage(1);
                  setSalesperson(v);
                }}
              />
            </div>
          </div>
        </FilterBar>

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
            description="No enquiries match your filters."
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
                        {x.party_name ||
                          (x.party_id ? (
                            <Link
                              className="text-[var(--fresa-action,#0A2942)] hover:underline"
                              to={`/parties/${x.party_id}`}
                            >
                              {x.party_id.slice(0, 8)}
                            </Link>
                          ) : (
                            x.lead_name || '—'
                          ))}
                      </td>
                      <td className={tdClass}>
                        {[x.origin_port_name || (x.origin_port_id ? x.origin_port_id.slice(0, 6) : null),
                          x.dest_port_name || (x.dest_port_id ? x.dest_port_id.slice(0, 6) : null)]
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
