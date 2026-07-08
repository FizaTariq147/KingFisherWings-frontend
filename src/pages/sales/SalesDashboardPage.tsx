import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronDown, Heart, FileCheck, FileText, Circle, DollarSign, Headphones, PieChart } from 'lucide-react';
import { FilterField, SelectInput, DateInput } from '../../components/widgets/FilterField';

interface ReportButton {
  id: string;
  label: string;
  icon: typeof FileCheck;
  colorClass: string;
}

const reportButtons: ReportButton[] = [
  { id: 'closed-job-report', label: 'Closed Job Report', icon: FileCheck, colorClass: 'bg-teal-500' },
  { id: 'job-summary-report', label: 'Job Summary Report', icon: FileText, colorClass: 'bg-red-400' },
  { id: 'open-enquiry-report', label: 'Open Enquiry Report', icon: Circle, colorClass: 'bg-orange-300' },
  { id: 'ar-receivables-ageing-report', label: 'A/R Receivables Ageing Report', icon: DollarSign, colorClass: 'bg-purple-300' },
  { id: 'open-leads', label: 'Open Leads', icon: Headphones, colorClass: 'bg-purple-500' },
  { id: 'gp-statistics', label: 'GP Statistics (Pie-Chart)', icon: PieChart, colorClass: 'bg-gray-500' },
];

export default function SalesDashboardPage() {
  const [rows, setRows] = useState('50');
  const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Sales Dashboard</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        {/* Filter grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Date Range">
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <SelectInput options={['Created Date', 'ETD']} />
              </div>
              <div className="flex-1 relative">
                <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700">
                  <span>This Month</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 cursor-pointer">×</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </FilterField>

          <FilterField label="From Date">
            <DateInput value="01-JUL-26" />
          </FilterField>

          <FilterField label="To Date">
            <DateInput value="31-JUL-26" />
          </FilterField>

          <FilterField label="Branch">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Salesperson">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Client">
            <SelectInput options={['All']} />
          </FilterField>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200 bg-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Search
            </button>
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
            <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
              Options
              <ChevronDown size={12} />
            </button>
          </div>

          <button
            onClick={() => setSubmitted(true)}
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
          >
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        {/* Results area — empty state */}
        <div className="flex items-center justify-center h-56 border-b border-gray-200">
          <Search size={40} className="text-gray-300" />
        </div>

        {/* Note */}
        <div className="px-5 py-2.5 border-b border-gray-200">
          <p className="text-xs text-red-600 italic font-medium">
            Note: After click the submit button disabled buttons will enable
          </p>
        </div>

        {/* Report shortcut buttons */}
        <div className="flex flex-wrap gap-2 px-5 py-3">
          {reportButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                disabled={!submitted}
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
        <button className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}