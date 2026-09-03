import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { DateInput, TextInput } from '@/components/widgets/FilterField';
import type { UseQueryResult } from '@tanstack/react-query';
import type { DocumentationListParams, DocumentationRecord, ListResult } from '../types/documentation.types';
import { DocumentationEdiPermissionNotice } from './DocumentationEdiPermissionNotice';
import { DocumentationListState, DocumentationRecordTable } from './DocumentationUi';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { formatDocumentationPermissionError } from '../utils/documentationPermissions';
import { useDocumentationPermissions } from '../hooks/useDocumentationPermissions';

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

function formatEdiError(error: unknown, isTenantAdmin: boolean): string {
  if (error instanceof Error && error.message.trim()) {
    return formatDocumentationPermissionError(error.message, { isTenantAdmin });
  }
  const raw = extractAxiosErrorDetail(error);
  return formatDocumentationPermissionError(raw, { isTenantAdmin });
}

export function DocumentationEdiJobListShell({
  title,
  preferredColumns = ['job_number', 'mbl_number', 'mawb_number', 'status', 'vessel_name', 'etd', 'eta'],
  useList,
  getJobId = (row) => String(row.job_id ?? row.id),
  actions = [],
}: DocumentationEdiJobListShellProps) {
  const { isTenantAdmin, canReadEdi } = useDocumentationPermissions();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const query = useList(applied ?? {}, Boolean(applied) && canReadEdi);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const listError = query.error ? formatEdiError(query.error, isTenantAdmin) : null;

  const runAction = async (action: EdiJobAction, jobId: string) => {
    setActionError(null);
    setPendingKey(`${action.key}:${jobId}`);
    try {
      await action.run(jobId);
      await query.refetch();
    } catch (err) {
      setActionError(formatEdiError(err, isTenantAdmin));
    } finally {
      setPendingKey(null);
    }
  };

  const load = () => {
    setApplied({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      search: search.trim() || undefined,
      page: 1,
      limit: 50,
    });
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <DocumentationEdiPermissionNotice />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">{title}</h2>
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
          <Button type="button" onClick={load} disabled={!canReadEdi}>
            Load
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!applied || !canReadEdi}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
        </div>

        {actionError ? <p className="px-5 py-2 text-sm text-red-600">{actionError}</p> : null}

        {!applied ? (
          <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-gray-500">
            Set filters and click <strong className="mx-1">Load</strong> to fetch EDI jobs.
          </div>
        ) : (
          <>
            <DocumentationListState
              loading={query.isLoading}
              error={listError}
              empty={!query.isLoading && !listError && rows.length === 0}
              emptyMessage="No EDI jobs for the selected filters."
            />

            {!query.isLoading && !listError && rows.length > 0 ? (
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
          </>
        )}
      </div>
    </div>
  );
}
