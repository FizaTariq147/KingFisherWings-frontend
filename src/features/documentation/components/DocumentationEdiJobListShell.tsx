import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/widgets/FilterField';
import type { UseQueryResult } from '@tanstack/react-query';
import type { DocumentationListParams, DocumentationRecord, ListResult } from '../types/documentation.types';
import { DocumentationListState, DocumentationRecordTable } from './DocumentationUi';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export interface EdiJobAction {
  key: string;
  label: string;
  run: (jobId: string) => Promise<unknown>;
  pending?: boolean;
}

interface DocumentationEdiJobListShellProps {
  title: string;
  preferredColumns?: string[];
  useList: (params: DocumentationListParams, enabled: boolean) => UseQueryResult<ListResult<DocumentationRecord>>;
  getJobId?: (row: DocumentationRecord) => string;
  actions?: EdiJobAction[];
}

export function DocumentationEdiJobListShell({
  title,
  preferredColumns = ['job_number', 'mbl_number', 'mawb_number', 'status', 'vessel_name', 'etd', 'eta'],
  useList,
  getJobId = (row) => String(row.job_id ?? row.id),
  actions = [],
}: DocumentationEdiJobListShellProps) {
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams>({ page: 1, limit: 50 });
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const query = useList(applied, true);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const runAction = async (action: EdiJobAction, jobId: string) => {
    setError(null);
    setPendingKey(`${action.key}:${jobId}`);
    try {
      await action.run(jobId);
      await query.refetch();
    } catch (err) {
      setError(extractAxiosErrorDetail(err));
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">{title}</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 px-5 py-4">
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Search</span>
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          </label>
          <Button
            type="button"
            onClick={() => setApplied({ page: 1, limit: 50, search: search.trim() || undefined })}
          >
            Load
          </Button>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Refresh
          </Button>
        </div>

        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}

        <DocumentationListState
          loading={query.isLoading}
          error={query.error}
          empty={!query.isLoading && !query.error && rows.length === 0}
        />

        {!query.isLoading && !query.error && rows.length > 0 ? (
          <div className="p-4">
            <p className="mb-3 text-xs text-gray-500">{rows.length} record(s)</p>
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={preferredColumns}
              actionColumn={
                actions.length
                  ? (row) => {
                      const jobId = getJobId(row);
                      return (
                        <div className="flex flex-wrap gap-1">
                          {actions.map((action) => (
                            <Button
                              key={action.key}
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={pendingKey === `${action.key}:${jobId}` || action.pending}
                              onClick={() => void runAction(action, jobId)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      );
                    }
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
