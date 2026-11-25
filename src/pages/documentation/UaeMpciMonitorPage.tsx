import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput, TextInput } from '@/components/widgets/FilterField';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import { useMpciActions, useMpciFilings } from '@/features/documentation/hooks/useDocumentation';
import type { DocumentationListParams } from '@/features/documentation/types/documentation.types';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

/** Align with DocumentationMpciStatus (+ empty = all). */
const FILING_STATUSES = [
  '',
  'DRAFT',
  'PREPARED',
  'SUBMITTED',
  'ACCEPTED',
  'REJECTED',
  'PENDING',
] as const;

export default function UaeMpciMonitorPage() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [filingStatus, setFilingStatus] = useState('');
  const [filterJobId, setFilterJobId] = useState('');
  const [createJobId, setCreateJobId] = useState('');
  const [mblNumber, setMblNumber] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams>({ page: 1, limit: 50 });
  const query = useMpciFilings(applied, true);
  const actions = useMpciActions();
  const [error, setError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const load = () => {
    setApplied({
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      department_id: departmentId.trim() || undefined,
      /** BE: filing_status aliases status */
      filing_status: filingStatus || undefined,
      status: filingStatus || undefined,
      job_id: filterJobId.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">UAE MPCI Monitor</h2>
          <div className="flex flex-wrap items-end gap-2">
            <Input
              placeholder="Job id (create)"
              value={createJobId}
              onChange={(e) => setCreateJobId(e.target.value)}
              className="w-44"
            />
            <Input
              placeholder="MBL number"
              value={mblNumber}
              onChange={(e) => setMblNumber(e.target.value)}
              className="w-40"
            />
            <Button
              type="button"
              disabled={actions.create.isPending}
              onClick={async () => {
                setError(null);
                try {
                  await actions.create.mutateAsync({
                    job_id: createJobId.trim() || undefined,
                    mbl_number: mblNumber.trim() || undefined,
                  });
                  await query.refetch();
                } catch (err) {
                  setError(extractAxiosErrorDetail(err));
                }
              }}
            >
              New filing
            </Button>
          </div>
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
            <span className="text-xs text-gray-500">Department id</span>
            <TextInput
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-44"
              placeholder="filters via job.department_id"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Filing status</span>
            <select
              className="h-9 rounded-md border border-gray-300 px-2 text-sm"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value)}
            >
              {FILING_STATUSES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || 'All'}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Job id</span>
            <TextInput
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="w-44"
              placeholder="filter list"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Search</span>
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48"
              placeholder="filing_number / type"
            />
          </label>
          <Button type="button" onClick={load}>
            Load
          </Button>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Refresh
          </Button>
        </div>

        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}
        {statusInfo ? (
          <pre className="mx-5 mb-2 max-h-32 overflow-auto rounded bg-gray-50 p-2 text-xs">{statusInfo}</pre>
        ) : null}
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={[
                'filing_number',
                'status',
                'filing_status',
                'filing_type',
                'department_id',
                'job_number',
                'job_id',
                'mbl_number',
                'created_at',
              ]}
              actionColumn={(row) => (
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={actions.prepare.isPending}
                    onClick={async () => {
                      setError(null);
                      try {
                        await actions.prepare.mutateAsync(row.id);
                        await query.refetch();
                      } catch (err) {
                        setError(extractAxiosErrorDetail(err));
                      }
                    }}
                  >
                    Prepare
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={actions.submit.isPending}
                    onClick={async () => {
                      setError(null);
                      try {
                        await actions.submit.mutateAsync(row.id);
                        await query.refetch();
                      } catch (err) {
                        setError(extractAxiosErrorDetail(err));
                      }
                    }}
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={actions.status.isPending}
                    onClick={async () => {
                      setError(null);
                      try {
                        const status = await actions.status.mutateAsync(row.id);
                        setStatusInfo(JSON.stringify(status, null, 2));
                      } catch (err) {
                        setError(extractAxiosErrorDetail(err));
                      }
                    }}
                  >
                    Status
                  </Button>
                </div>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
