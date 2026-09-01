import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput, DateInput } from '@/components/widgets/FilterField';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import { useBoeDashboard, useBoePendingClaims } from '@/features/documentation/hooks/useDocumentation';
import type { BoeListParams } from '@/features/documentation/types/documentation.types';

export default function BoeDashboardPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [showClaims, setShowClaims] = useState(false);
  const [applied, setApplied] = useState<BoeListParams>({ page: 1, limit: 50 });

  const filters = useMemo(
    () => ({
      ...applied,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      search: search.trim() || undefined,
    }),
    [applied, fromDate, toDate, search],
  );

  const dashboard = useBoeDashboard(filters, !showClaims);
  const claims = useBoePendingClaims(filters, showClaims);
  const query = showClaims ? claims : dashboard;
  const rows = query.data?.items ?? [];

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">BOE Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 p-5 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs text-gray-500">From date</span>
            <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">To date</span>
            <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-500">Search</span>
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-5 py-3">
          <Button type="button" onClick={() => setApplied({ page: 1, limit: 50 })}>
            Submit
          </Button>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!applied}
            onClick={() => setShowClaims(true)}
          >
            Pending Claims
          </Button>
          {showClaims ? (
            <Button type="button" variant="secondary" onClick={() => setShowClaims(false)}>
              Back to dashboard
            </Button>
          ) : null}
        </div>

        <DocumentationListState
          loading={query.isLoading}
          error={query.error}
          empty={!query.isLoading && !query.error && rows.length === 0}
          emptyMessage={showClaims ? 'No pending claims.' : 'No BOE records for selected filters.'}
        />

        {!query.isLoading && !query.error && rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={['boe_number', 'boe_date', 'boe_type', 'status', 'job_number', 'party_name']}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
