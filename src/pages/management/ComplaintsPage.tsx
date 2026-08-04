import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown, Maximize2, Heart } from 'lucide-react';
import { SelectInput, DateInput } from '../../components/widgets/FilterField';

export default function ComplaintsPage() {
  const [rows, setRows] = useState('5');

  return (
    <div className="space-y-3">
      <PageBackLink to="/management" label="Back to Management" />
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">List of Complaints</h2>
        </div>

        {/* Filter row */}
        <div className="p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Category</span>
            <div className="w-40">
              <SelectInput options={['All']} />
            </div>
          </label>

          <div className="flex-1 min-w-[240px] relative">
            <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700">
              <span>This Month</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 cursor-pointer">×</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">From date</span>
            <div className="w-36">
              <DateInput value="01-JUL-26" />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">To date</span>
            <div className="w-36">
              <DateInput value="31-JUL-26" />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Status</span>
            <div className="w-40">
              <SelectInput options={['All']} />
            </div>
          </label>
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
              placeholder="Search: Name"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
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

          <div className="flex items-center gap-2">
            <button className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              Submit
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Results area — empty state */}
        <div className="flex items-center justify-center h-56">
          <Search size={40} className="text-gray-300" />
        </div>

        {/* Status pill */}
        <div className="px-5 py-3">
          <span className="inline-block bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded">
            Pending
          </span>
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