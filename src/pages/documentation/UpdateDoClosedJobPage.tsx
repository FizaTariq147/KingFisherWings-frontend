import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import {
  useClosedDeliveryJobs,
  useDeliveryOrderActions,
} from '@/features/documentation/hooks/useDocumentation';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function UpdateDoClosedJobPage() {
  const [applied] = useState({ page: 1, limit: 50 });
  const query = useClosedDeliveryJobs(applied, true);
  const actions = useDeliveryOrderActions();
  const [doNumber, setDoNumber] = useState('');
  const [doDate, setDoDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">Update DO — Closed Job</h2>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-5 py-4">
          <Input placeholder="DO number" value={doNumber} onChange={(e) => setDoNumber(e.target.value)} />
          <Input type="date" value={doDate} onChange={(e) => setDoDate(e.target.value)} />
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>Refresh</Button>
        </div>
        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={['job_number', 'do_number', 'do_date', 'do_status', 'status']}
              actionColumn={(row) => (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!doNumber.trim()}
                  onClick={async () => {
                    setError(null);
                    try {
                      await actions.updateJob.mutateAsync({
                        jobId: String(row.job_id ?? row.id),
                        dto: {
                          do_number: doNumber.trim(),
                          do_date: doDate || undefined,
                          do_status: 'ISSUED',
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
