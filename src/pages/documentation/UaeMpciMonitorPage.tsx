import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import { useMpciActions, useMpciFilings } from '@/features/documentation/hooks/useDocumentation';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function UaeMpciMonitorPage() {
  const [applied] = useState({ page: 1, limit: 50 });
  const query = useMpciFilings(applied, true);
  const actions = useMpciActions();
  const [error, setError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">UAE MPCI Monitor</h2>
          <Button
            type="button"
            disabled={actions.create.isPending}
            onClick={async () => {
              setError(null);
              try {
                await actions.create.mutateAsync({});
                await query.refetch();
              } catch (err) {
                setError(extractAxiosErrorDetail(err));
              }
            }}
          >
            New filing
          </Button>
        </div>
        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}
        {statusInfo ? <pre className="mx-5 mb-2 max-h-32 overflow-auto rounded bg-gray-50 p-2 text-xs">{statusInfo}</pre> : null}
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={['filing_number', 'status', 'job_number', 'mbl_number', 'created_at']}
              actionColumn={(row) => (
                <div className="flex flex-wrap gap-1">
                  <Button type="button" size="sm" variant="secondary" onClick={() => void actions.prepare.mutateAsync(row.id)}>Prepare</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => void actions.submit.mutateAsync(row.id)}>Submit</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={async () => {
                    const status = await actions.status.mutateAsync(row.id);
                    setStatusInfo(JSON.stringify(status, null, 2));
                  }}>Status</Button>
                </div>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
