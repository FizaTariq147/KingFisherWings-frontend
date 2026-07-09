import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Search, ChevronDown, Heart,
  Users, BarChart2, ClipboardList, PieChart, Headphones,
  FileText, DollarSign, CreditCard, RotateCw, ListChecks,
} from 'lucide-react';
import { SelectInput, DateInput } from '../../components/widgets/FilterField';

interface ReportButton {
  id: string;
  label: string;
  icon: typeof Users;
  colorClass: string;
}

const reportButtons: ReportButton[] = [
  { id: 'open-leads', label: 'Open Leads', icon: Users, colorClass: 'bg-gray-500' },
  { id: 'pending-claims', label: 'Pending Claims', icon: BarChart2, colorClass: 'bg-teal-500' },
  { id: 'daily-job-summary', label: 'Daily Job Summary', icon: ClipboardList, colorClass: 'bg-purple-500' },
  { id: 'gp-statistics', label: 'GP Statistics (Pie-Chart)', icon: PieChart, colorClass: 'bg-red-400' },
  { id: 'open-enquiry-report', label: 'Open Enquiry Report', icon: Headphones, colorClass: 'bg-teal-500' },
  { id: 'invoice-status-report', label: 'Invoice Status Report', icon: FileText, colorClass: 'bg-yellow-500' },
  { id: 'accounts-receivable-report', label: 'Accounts Receivable Report', icon: DollarSign, colorClass: 'bg-sky-500' },
  { id: 'accounts-payable-report', label: 'Accounts Payable Report', icon: CreditCard, colorClass: 'bg-purple-400' },
  { id: 'open-job-status', label: 'Open Job Status', icon: RotateCw, colorClass: 'bg-pink-400' },
  { id: 'job-summary-report', label: 'Job Summary Report', icon: ListChecks, colorClass: 'bg-purple-400' },
];

export default function ManagementDashboardReportsPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Management Dashboard - Reports</h2>
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
          <div className="flex items-start gap-3">
            <label className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Date Range</label>
            <div className="flex-1">
              <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700">
                <span>This Month</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 cursor-pointer">×</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="w-16 shrink-0 text-sm text-gray-700 pt-2 text-right">From Date</label>
            <div className="flex-1">
              <DateInput value="01-JUL-26" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="w-14 shrink-0 text-sm text-gray-700 pt-2 text-right">To Date</label>
            <div className="flex-1">
              <DateInput value="31-JUL-26" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Branch</label>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="w-16 shrink-0 text-sm text-gray-700 pt-2 text-right">Client</label>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="w-14 shrink-0 text-sm text-gray-700 pt-2 text-right">Sales Person</label>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Department</label>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </div>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Search
            </button>
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