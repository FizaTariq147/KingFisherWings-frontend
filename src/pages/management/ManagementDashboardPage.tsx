import { useEffect, useState } from 'react';
import { Maximize2, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateInput, TextInput } from '../../components/widgets/FilterField';

interface ChartDataPoint {
  month: string;
  [series: string]: string | number;
}

// Placeholder — swap these out for real API calls later, same return shape
const dashboardService = {
  getShipmentsChart: async (): Promise<ChartDataPoint[]> => {
    // await fetch('/api/dashboard/shipments') ...
    return [];
  },
  getJobsChart: async (): Promise<ChartDataPoint[]> => {
    // await fetch('/api/dashboard/jobs') ...
    return [];
  },
  getEnquiriesChart: async (): Promise<ChartDataPoint[]> => {
    return [];
  },
  getQuotesChart: async (): Promise<ChartDataPoint[]> => {
    return [];
  },
};

const sidebarLinks = [
  { label: 'Sales', color: 'text-green-600' },
  { label: 'Accounts', color: 'text-amber-500' },
  { label: 'Top 10', color: 'text-red-500' },
  { label: 'Department', color: 'text-blue-500' },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-md">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
        <h2 className="text-[14px] font-medium text-gray-800">{title}</h2>
        <button className="text-gray-400 hover:text-gray-600">
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

function BarChartOrEmpty({ data, seriesKeys }: { data: ChartDataPoint[]; seriesKeys: string[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {seriesKeys.map((key) => (
          <Bar key={key} dataKey={key} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ManagementDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shipmentsData, setShipmentsData] = useState<ChartDataPoint[]>([]);
  const [jobsData, setJobsData] = useState<ChartDataPoint[]>([]);
  const [enquiriesData, setEnquiriesData] = useState<ChartDataPoint[]>([]);
  const [quotesData, setQuotesData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    dashboardService.getShipmentsChart().then(setShipmentsData);
    dashboardService.getJobsChart().then(setJobsData);
    dashboardService.getEnquiriesChart().then(setEnquiriesData);
    dashboardService.getQuotesChart().then(setQuotesData);
  }, []);

  return (
    <div className="flex gap-0">
      <div className="flex-1 bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Management Dashboard</h2>
        </div>

        {/* Filter row */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">From Date</label>
            <DateInput value="01-JAN-26" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">To Date</label>
            <DateInput value="09-JUL-26" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Department</label>
            <TextInput placeholder="-All-" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Branch</label>
            <TextInput placeholder="- All -" />
          </div>
        </div>

        {/* Chart grid */}
        <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="No of Shipments">
            <BarChartOrEmpty data={shipmentsData} seriesKeys={['AIR EXPORT', 'NVOCC IMPORT', 'SERVICE JOB']} />
          </ChartCard>

          <ChartCard title="No of Jobs">
            <BarChartOrEmpty
              data={jobsData}
              seriesKeys={[
                'AIR EXPORT', 'AIR IMPORT', 'CUSTOMS CLEARANCE', 'FCL EXPORT',
                'FCL IMPORT', 'LCL IMPORT', 'NVOCC EXPORT', 'NVOCC IMPORT', 'SERVICE JOB',
              ]}
            />
          </ChartCard>

          <ChartCard title="No of Enquiries">
            <BarChartOrEmpty data={enquiriesData} seriesKeys={[]} />
          </ChartCard>

          <ChartCard title="No of Quotes">
            <BarChartOrEmpty data={quotesData} seriesKeys={[]} />
          </ChartCard>
        </div>
      </div>

      {/* Right sidebar panel */}
      {sidebarOpen && (
        <div className="w-40 bg-gray-50 border-t border-b border-r border-gray-200 rounded-r-md">
          <div className="flex justify-end px-2 py-2 border-b border-gray-200">
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="py-2">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${link.color}`}
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