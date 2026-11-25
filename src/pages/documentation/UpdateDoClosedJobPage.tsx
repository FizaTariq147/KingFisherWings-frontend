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
import type { DocumentationListParams, UpdateDeliveryOrderDto } from '@/features/documentation/types/documentation.types';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

const DO_STATUSES: UpdateDeliveryOrderDto['do_status'][] = ['ISSUED', 'DELIVERED', 'CANCELLED'];

export default function UpdateDoClosedJobPage() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams>({ page: 1, limit: 50 });
  const query = useClosedDeliveryJobs(applied, true);
  const actions = useDeliveryOrderActions();
  const [doNumber, setDoNumber] = useState('');
  const [doDate, setDoDate] = useState('');
  const [doStatus, setDoStatus] = useState<UpdateDeliveryOrderDto['do_status']>('ISSUED');
  const [error, setError] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const load = () => {
    setApplied({
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">Update DO — Closed Job</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update DO number, date, and status for closed export jobs without reopening them.
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
          <Input placeholder="DO number" value={doNumber} onChange={(e) => setDoNumber(e.target.value)} />
          <Input type="date" value={doDate} onChange={(e) => setDoDate(e.target.value)} />
          <select
            className="h-9 rounded-md border border-gray-300 px-2 text-sm"
            value={doStatus}
            onChange={(e) => setDoStatus(e.target.value as UpdateDeliveryOrderDto['do_status'])}
          >
            {DO_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={['job_number', 'do_number', 'do_date', 'do_status', 'status', 'job_type']}
              actionColumn={(row) => (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!doNumber.trim() || actions.updateJob.isPending}
                  onClick={async () => {
                    setError(null);
                    try {
                      await actions.updateJob.mutateAsync({
                        jobId: String(row.job_id ?? row.id),
                        dto: {
                          do_number: doNumber.trim(),
                          do_date: doDate || undefined,
                          do_status: doStatus,
                        },
                      });
                      await query.refetch();
                    } catch (err) {
                      setError(extractAxiosErrorDetail(err));
                    }
                  }}
                >
                  Update DO
                </Button>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
