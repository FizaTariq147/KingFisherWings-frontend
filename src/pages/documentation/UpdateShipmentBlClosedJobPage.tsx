import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput, TextInput } from '@/components/widgets/FilterField';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import {
  useClosedDeliveryJobs,
  useDeliveryOrderActions,
} from '@/features/documentation/hooks/useDocumentation';
import type { DocumentationListParams } from '@/features/documentation/types/documentation.types';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function UpdateShipmentBlClosedJobPage() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [jobType, setJobType] = useState('');
  const [branchId, setBranchId] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams>({ page: 1, limit: 50 });
  const query = useClosedDeliveryJobs(applied, true);
  const actions = useDeliveryOrderActions();
  const [shipmentStatus, setShipmentStatus] = useState('');
  const [blStatus, setBlStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const canPatch = Boolean(shipmentStatus.trim() || blStatus.trim());

  const load = () => {
    setApplied({
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      job_type: jobType.trim() || undefined,
      branch_id: branchId.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">
            Update Shipment &amp; BL Status — Closed Job
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            PATCH closed/completed jobs without reopen. Provide shipment status and/or BL status (at
            least one).
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 px-5 py-4">
          <label className="space-y-1">
            <span className="text-xs text-gray-500">From</span>
            <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">To</span>
            <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Job type</span>
            <TextInput
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-40"
              placeholder="optional"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Branch id</span>
            <TextInput
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-44"
              placeholder="optional"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Search</span>
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
          </label>
          <Button type="button" onClick={load}>
            Load
          </Button>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Refresh
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-2 border-b border-gray-200 px-5 py-4">
          <Input
            placeholder="Shipment status (optional)"
            value={shipmentStatus}
            onChange={(e) => setShipmentStatus(e.target.value)}
          />
          <Input
            placeholder="BL status (optional)"
            value={blStatus}
            onChange={(e) => setBlStatus(e.target.value)}
          />
        </div>
        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}
        {info ? <p className="px-5 py-2 text-sm text-emerald-700">{info}</p> : null}
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={[
                'job_number',
                'shipment_status',
                'bl_status',
                'status',
                'job_type',
                'updated_at',
                'completed_at',
              ]}
              actionColumn={(row) => (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!canPatch || actions.updateShipmentBlStatus.isPending}
                  onClick={async () => {
                    setError(null);
                    setInfo(null);
                    try {
                      await actions.updateShipmentBlStatus.mutateAsync({
                        jobId: String(row.job_id ?? row.id),
                        dto: {
                          shipment_status: shipmentStatus.trim() || undefined,
                          bl_status: blStatus.trim() || undefined,
                        },
                      });
                      setInfo('Shipment / BL status updated.');
                      await query.refetch();
                    } catch (err) {
                      setError(extractAxiosErrorDetail(err));
                    }
                  }}
                >
                  Update status
                </Button>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
