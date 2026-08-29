import { useEffect, useMemo, useState } from 'react';
import { ReportsPageBackLink } from '@/features/reports/components/ReportsPageBackLink';
import { Search, ChevronDown, Heart, Users, BarChart2, ClipboardList, PieChart as PieChartIcon, Headphones, FileText, DollarSign, CreditCard, RotateCw, ListChecks } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useManagementReport } from '@/features/management/hooks/useManagement';
import type { ManagementReportId } from '@/features/management/api/management.api';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  filterRowsBySearch,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import {
  normalizeReportRows,
  profitabilityRowsToPie,
} from '@/features/management/utils/normalizeManagement';
import { useCrmSalespeople } from '@/features/crm/hooks/useCrmSalespeople';
import { useParties } from '@/features/parties/hooks/useParties';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';

interface ReportButton {
  id: ManagementReportId;
  label: string;
  icon: typeof Users;
  colorClass: string;
}

const reportButtons: ReportButton[] = [
  { id: 'open-leads', label: 'Open Leads', icon: Users, colorClass: 'bg-gray-500' },
  { id: 'pending-claims', label: 'Pending Claims', icon: BarChart2, colorClass: 'bg-teal-500' },
  { id: 'daily-job-summary', label: 'Daily Job Summary', icon: ClipboardList, colorClass: 'bg-purple-500' },
  { id: 'gp-statistics', label: 'GP Statistics (Pie-Chart)', icon: PieChartIcon, colorClass: 'bg-red-400' },
  { id: 'open-enquiry-report', label: 'Open Enquiry Report', icon: Headphones, colorClass: 'bg-teal-500' },
  { id: 'invoice-status-report', label: 'Invoice Status Report', icon: FileText, colorClass: 'bg-yellow-500' },
  { id: 'accounts-receivable-report', label: 'Accounts Receivable Report', icon: DollarSign, colorClass: 'bg-sky-500' },
  { id: 'accounts-payable-report', label: 'Accounts Payable Report', icon: CreditCard, colorClass: 'bg-purple-400' },
  { id: 'open-job-status', label: 'Open Job Status', icon: RotateCw, colorClass: 'bg-pink-400' },
  { id: 'job-summary-report', label: 'Job Summary Report', icon: ListChecks, colorClass: 'bg-purple-400' },
];

const PIE_COLORS = ['#0A2942', '#FF751F', '#14b8a6', '#a855f7', '#ef4444', '#eab308', '#0ea5e9', '#ec4899'];

const filterSelectClass =
  'w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white';

export default function ManagementDashboardReportsPage() {
  const [submitted, setSubmitted] = useState(true);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [activeReport, setActiveReport] = useState<ManagementReportId | null>(null);
  const [reportData, setReportData] = useState<unknown>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const reportMutation = useManagementReport();

  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions('departments', MASTER_PATHS.departments, true, true);
  const { data: salespeople = [] } = useCrmSalespeople();
  const { data: partiesResult } = useParties({ page: 1, limit: 200, order: 'asc' });
  const parties = partiesResult?.parties ?? [];

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branchId || undefined,
      customer_id: customerId || undefined,
      salesperson_id: salespersonId || undefined,
    }),
    [fromDate, toDate, branchId, customerId, salespersonId],
  );

  const reportRows = useMemo(() => normalizeReportRows(reportData), [reportData]);
  const filteredRows = useMemo(() => {
    let rows = filterRowsBySearch(reportRows, tableSearch);
    if (departmentId) {
      const dept = departments.find((d) => String(d.id) === departmentId);
      const label = String(dept?.name ?? dept?.code ?? '').toLowerCase();
      if (label) {
        rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(label));
      }
    }
    return rows;
  }, [reportRows, tableSearch, departmentId, departments]);
  const columns = Object.keys(filteredRows[0] ?? reportRows[0] ?? {});
  const pieData = useMemo(
    () => (activeReport === 'gp-statistics' ? profitabilityRowsToPie(reportRows) : []),
    [activeReport, reportRows],
  );

  const runReport = (id: ManagementReportId) => {
    setActiveReport(id);
    setReportError(null);
    setTableSearch('');
    void reportMutation
      .mutateAsync({ id, params })
      .then((data) => setReportData(data))
      .catch((err) => {
        setReportError(getErrorMessage(err));
        setReportData(null);
      });
  };

  const applyPreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') return;
    const range = resolveDateRangePreset(preset);
    if (range) {
      setFromDate(range.from_date);
      setToDate(range.to_date);
    }
  };

  useEffect(() => {
    applyPreset('this_month');
    setSubmitted(true);
  }, []);

  return (
    <div className="space-y-3">
      <ReportsPageBackLink fallbackTo="/management" fallbackLabel="Back to Management" />
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-800">Management Dashboard - Reports</h2>
        </div>

        {/* Filter grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <div className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Date Range</span>
            <div className="flex-1 relative">
              <select
                value={datePreset}
                onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                className={`${filterSelectClass} appearance-none pr-8`}
              >
                {DATE_RANGE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-start gap-3">
            <span className="w-16 shrink-0 text-sm text-gray-700 pt-2 text-right">From Date</span>
            <div className="flex-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
              />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="w-14 shrink-0 text-sm text-gray-700 pt-2 text-right">To Date</span>
            <div className="flex-1">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
              />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Branch</span>
            <div className="flex-1">
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className={filterSelectClass}
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

          <label className="flex items-start gap-3">
            <span className="w-16 shrink-0 text-sm text-gray-700 pt-2 text-right">Client</span>
            <div className="flex-1">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={filterSelectClass}
              >
                <option value="">All</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name || party.short_name || party.code || party.id}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="w-14 shrink-0 text-sm text-gray-700 pt-2 text-right">Sales Person</span>
            <div className="flex-1">
              <select
                value={salespersonId}
                onChange={(e) => setSalespersonId(e.target.value)}
                className={filterSelectClass}
              >
                <option value="">All</option>
                {salespeople.map((person) => (
                  <option key={person.value} value={person.value}>
                    {person.label}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Department</span>
            <div className="flex-1">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className={filterSelectClass}
              >
                <option value="">All</option>
                {departments.map((dept) => (
                  <option key={String(dept.id)} value={String(dept.id)}>
                    {String(dept.name ?? dept.code ?? dept.id)}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter results…"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button
              type="button"
              onClick={() => setTableSearch('')}
              className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors"
            >
              Search
            </button>
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
              Options
              <ChevronDown size={12} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
              setSubmitted(true);
            }}
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
          >
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        {/* Results area */}
        <div className="min-h-56 border-b border-gray-200">
          {reportMutation.isPending ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading report…</div>
          ) : reportError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">{reportError}</div>
          ) : reportData ? (
            <div className="p-5 overflow-auto max-h-[28rem] space-y-4">
              <p className="text-sm font-medium text-gray-700">
                {activeReport ? reportButtons.find((b) => b.id === activeReport)?.label : 'Report'}
                {filteredRows.length > 0 ? (
                  <span className="ml-2 text-xs font-normal text-gray-500">({filteredRows.length} rows)</span>
                ) : null}
              </p>

              {activeReport === 'gp-statistics' && pieData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

              {filteredRows.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-gray-400">No rows to display</div>
              ) : columns.length > 0 ? (
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
                      {filteredRows.map((row, idx) => (
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
              ) : (
                <pre className="whitespace-pre-wrap text-xs text-gray-700">{JSON.stringify(reportData, null, 2)}</pre>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Note */}
        <div className="px-5 py-2.5 border-b border-gray-200">
          <p className="text-xs text-gray-500 italic">
            Select a report below to load live data for the chosen filters.
          </p>
        </div>

        {/* Report shortcut buttons */}
        <div className="flex flex-wrap gap-2 px-5 py-3">
          {reportButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                type="button"
                disabled={!submitted || reportMutation.isPending}
                onClick={() => runReport(btn.id)}
                className={`flex items-center gap-1.5 text-white text-xs px-3 py-1.5 rounded transition-opacity ${btn.colorClass} ${
                  submitted ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <Icon size={13} />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Favorites button */}
      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}
