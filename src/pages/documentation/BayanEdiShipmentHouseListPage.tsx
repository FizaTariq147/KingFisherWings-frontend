import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { DateInput, TextInput } from '@/components/widgets/FilterField';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import {
  useBayanEdiShipments,
  useEdiSubmissionDownload,
} from '@/features/documentation/hooks/useDocumentation';
import type { DocumentationListParams } from '@/features/documentation/types/documentation.types';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

function pickSubmissionId(row: Record<string, unknown>): string | null {
  const nested =
    row.submission && typeof row.submission === 'object'
      ? (row.submission as Record<string, unknown>)
      : null;
  const raw =
    row.submission_id ?? row.submissionId ?? row.last_submission_id ?? nested?.id;
  return raw == null || raw === '' ? null : String(raw);
}

export default function BayanEdiShipmentHouseListPage() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams>({ page: 1, limit: 50 });
  const query = useBayanEdiShipments(applied, true);
  const download = useEdiSubmissionDownload();
  const [error, setError] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">Bayan EDI Shipment (House) List</h2>
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
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          </label>
          <Button
            type="button"
            onClick={() =>
              setApplied({
                page: 1,
                limit: 50,
                search: search.trim() || undefined,
                from_date: fromDate || undefined,
                to_date: toDate || undefined,
              })
            }
          >
            Load
          </Button>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Refresh
          </Button>
        </div>
        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={[
                'house_number',
                'job_number',
                'mbl_number',
                'status',
                'consignee',
                'submission_id',
              ]}
              actionColumn={(row) => {
                const submissionId = pickSubmissionId(row);
                if (!submissionId) return null;
                return (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={download.isPending}
                    onClick={async () => {
                      setError(null);
                      try {
                        await download.mutateAsync(submissionId);
                      } catch (err) {
                        setError(extractAxiosErrorDetail(err));
                      }
                    }}
                  >
                    Download
                  </Button>
                );
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
