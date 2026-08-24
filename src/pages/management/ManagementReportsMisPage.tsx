import { useMemo, useState } from 'react';
import { ReportsPageBackLink } from '@/features/reports/components/ReportsPageBackLink';
import { Search, ChevronDown, Heart } from 'lucide-react';
import { useManagementProfitability } from '@/features/management/hooks/useManagement';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import { filterRowsBySearch, MANAGEMENT_SELECT_CLASS } from '@/features/management/utils/managementFilters';
import { normalizeReportRows } from '@/features/management/utils/normalizeManagement';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';

export default function ManagementReportsMisPage() {
  const [rows, setRows] = useState('10');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'customer' | 'job_type' | 'branch' | 'salesperson'>('customer');
  const [submitted, setSubmitted] = useState(false);

  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branchId || undefined,
    }),
    [fromDate, toDate, branchId],
  );
  const query = useManagementProfitability(params, groupBy, submitted);
  const rawRows = useMemo(() => normalizeReportRows(query.data), [query.data]);
  const filteredRows = useMemo(() => filterRowsBySearch(rawRows, search), [rawRows, search]);
  const pageSize = Number(rows) || 10;
  const pageRows = filteredRows.slice(0, pageSize);
  const columns = Object.keys(pageRows[0] ?? filteredRows[0] ?? { label: 'value' });

  return (
    <div className="space-y-3">
      <ReportsPageBackLink fallbackTo="/management" fallbackLabel="Back to Management" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-800">Reports - MIS</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">From Date</span>
            <div className="flex-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={MANAGEMENT_SELECT_CLASS}
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-16 shrink-0 text-sm text-gray-700 pt-2 text-right">To Date</span>
            <div className="flex-1">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={MANAGEMENT_SELECT_CLASS}
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Group by</span>
            <div className="flex-1">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                className={MANAGEMENT_SELECT_CLASS}
              >
                <option value="customer">Customer</option>
                <option value="job_type">Job type</option>
                <option value="branch">Branch</option>
                <option value="salesperson">Salesperson</option>
              </select>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Branch</span>
            <div className="flex-1">
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className={MANAGEMENT_SELECT_CLASS}
              >
                <option value="">All</option>
                {branches.map((branch) => (
                  <option key={String(branch.id)} value={String(branch.id)}>
                    {String(branch.name ?? branch.code ?? branch.id)}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter results…"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <span className="text-sm text-gray-500 ml-2">Rows</span>
            <select
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
            >
              <option>5</option>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              if (submitted) void query.refetch();
            }}
            className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
          >
            Submit
          </button>
        </div>

        <div className="min-h-56">
          {!submitted ? (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          ) : query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error)}
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-2 text-left font-semibold text-[#0A2942] whitespace-nowrap">
                        {col.replaceAll('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                          {String(row[col] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}
