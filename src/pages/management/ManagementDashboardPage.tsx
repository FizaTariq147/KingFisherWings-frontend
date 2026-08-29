import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useManagementDashboard } from '@/features/management/hooks/useManagement';
import { mapDashboardCharts } from '@/features/management/utils/normalizeManagement';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import { MANAGEMENT_SELECT_CLASS } from '@/features/management/utils/managementFilters';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';

interface ChartDataPoint {
  month: string;
  [series: string]: string | number;
}

const CHART_COLORS = [
  '#FF751F',
  '#0A2942',
  '#14b8a6',
  '#a855f7',
  '#ef4444',
  '#eab308',
  '#0ea5e9',
  '#ec4899',
  '#22c55e',
  '#f97316',
];

const sidebarLinks = [
  { label: 'Sales', target: 'enquiries' as const, color: 'text-green-600' },
  { label: 'Accounts', target: 'jobs' as const, color: 'text-amber-500' },
  { label: 'Top 10', target: 'shipments' as const, color: 'text-red-500' },
  { label: 'Department', target: 'quotes' as const, color: 'text-blue-500' },
];

function ChartCard({
  title,
  children,
  highlighted,
  cardRef,
}: {
  title: string;
  children: React.ReactNode;
  highlighted?: boolean;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className={`border rounded-md ${highlighted ? 'border-[#FF751F] ring-1 ring-[#FF751F]/40' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
        <h2 className="text-[14px] font-medium text-gray-800">{title}</h2>
        <button type="button" className="text-gray-400 hover:text-gray-600">
          <Maximize2 size={15} />
        </button>
      </div>
      <div className="p-3 h-72">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm font-semibold text-gray-700">No data to display</p>
    </div>
  );
}

function LoadingChart() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-500">Loading chart data…</p>
    </div>
  );
}

function BarChartOrEmpty({
  data,
  seriesKeys,
  loading,
}: {
  data: ChartDataPoint[];
  seriesKeys: string[];
  loading?: boolean;
}) {
  if (loading) return <LoadingChart />;
  if (data.length === 0) return <EmptyChart />;
  const keys =
    seriesKeys.length > 0
      ? seriesKeys
      : Object.keys(data[0] ?? {}).filter((k) => k !== 'month');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
        <Tooltip
          cursor={{ fill: 'rgba(255, 117, 31, 0.08)' }}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((key, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={keys.length === 1 ? 48 : 32}
            >
              {keys.length === 1
                ? data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))
                : null}
            </Bar>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ManagementDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [applied, setApplied] = useState(false);
  const [activeChart, setActiveChart] = useState<'shipments' | 'jobs' | 'enquiries' | 'quotes'>('shipments');

  const shipmentsRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);
  const enquiriesRef = useRef<HTMLDivElement>(null);
  const quotesRef = useRef<HTMLDivElement>(null);

  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions('departments', MASTER_PATHS.departments, true, true);

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branchId || undefined,
    }),
    [fromDate, toDate, branchId],
  );
  const dashboardQuery = useManagementDashboard(params, applied);
  const charts = useMemo(() => mapDashboardCharts(dashboardQuery.data), [dashboardQuery.data]);
  const chartLoading = dashboardQuery.isLoading || dashboardQuery.isFetching;

  useEffect(() => {
    if (!applied && !fromDate && !toDate) setApplied(true);
  }, [applied, fromDate, toDate]);

  const scrollToChart = (target: 'shipments' | 'jobs' | 'enquiries' | 'quotes') => {
    setActiveChart(target);
    const refMap = {
      shipments: shipmentsRef,
      jobs: jobsRef,
      enquiries: enquiriesRef,
      quotes: quotesRef,
    };
    refMap[target].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 min-w-0">
      <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Management Dashboard</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <label className="block">
            <span className="block text-sm text-gray-700 mb-1">From Date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={MANAGEMENT_SELECT_CLASS}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-gray-700 mb-1">To Date</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={MANAGEMENT_SELECT_CLASS}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-gray-700 mb-1">Department</span>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className={MANAGEMENT_SELECT_CLASS}
            >
              <option value="">-All-</option>
              {departments.map((dept) => (
                <option key={String(dept.id)} value={String(dept.id)}>
                  {String(dept.name ?? dept.code ?? dept.id)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm text-gray-700 mb-1">Branch</span>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={MANAGEMENT_SELECT_CLASS}
            >
              <option value="">- All -</option>
              {branches.map((branch) => (
                <option key={String(branch.id)} value={String(branch.id)}>
                  {String(branch.name ?? branch.code ?? branch.id)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="px-5 pb-3 space-y-2">
          {dashboardQuery.isError ? (
            <p className="text-sm text-red-600">{getErrorMessage(dashboardQuery.error)}</p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setApplied(true);
              void dashboardQuery.refetch();
            }}
            className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
          >
            Apply
          </button>
        </div>

        <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="No of Shipments" highlighted={activeChart === 'shipments'} cardRef={shipmentsRef}>
            <BarChartOrEmpty
              data={charts.shipments}
              seriesKeys={Object.keys(charts.shipments[0] ?? {}).filter((k) => k !== 'month')}
              loading={chartLoading}
            />
          </ChartCard>

          <ChartCard title="No of Jobs" highlighted={activeChart === 'jobs'} cardRef={jobsRef}>
            <BarChartOrEmpty
              data={charts.jobs}
              seriesKeys={Object.keys(charts.jobs[0] ?? {}).filter((k) => k !== 'month')}
              loading={chartLoading}
            />
          </ChartCard>

          <ChartCard title="No of Enquiries" highlighted={activeChart === 'enquiries'} cardRef={enquiriesRef}>
            <BarChartOrEmpty
              data={charts.enquiries}
              seriesKeys={Object.keys(charts.enquiries[0] ?? {}).filter((k) => k !== 'month')}
              loading={chartLoading}
            />
          </ChartCard>

          <ChartCard title="No of Quotes" highlighted={activeChart === 'quotes'} cardRef={quotesRef}>
            <BarChartOrEmpty
              data={charts.quotes}
              seriesKeys={Object.keys(charts.quotes[0] ?? {}).filter((k) => k !== 'month')}
              loading={chartLoading}
            />
          </ChartCard>
        </div>
      </div>

      {sidebarOpen && (
        <div className="w-full lg:w-40 shrink-0 bg-gray-50 border border-gray-200 rounded-md lg:rounded-r-md lg:border-l-0">
          <div className="flex justify-end px-2 py-2 border-b border-gray-200">
            <button type="button" onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="py-2">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => scrollToChart(link.target)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${link.color} ${
                  activeChart === link.target ? 'bg-white font-medium' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
