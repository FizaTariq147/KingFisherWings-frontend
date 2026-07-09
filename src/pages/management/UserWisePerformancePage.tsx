import { useState } from 'react';
import { HardDrive, Search, ChevronDown, Heart } from 'lucide-react';
import { DateInput } from '../../components/widgets/FilterField';

export default function UserWisePerformancePage() {
  const [rows, setRows] = useState('5');

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">User wise performance</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              <span className="text-[#FF751F]">➜</span>
              Submit
            </button>
            <button className="flex items-center gap-1.5 bg-pink-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <HardDrive size={14} />
              Monthly Attachment Storage
            </button>
          </div>
        </div>

        {/* Date row */}
        <div className="p-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">From Date</label>
            <div className="w-40">
              <DateInput value="09-JUN-26" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">To Date</label>
            <div className="w-40">
              <DateInput value="09-JUL-26" />
            </div>
          </div>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-b border-gray-200">
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

        {/* Results area — empty state */}
        <div className="flex items-center justify-center h-56">
          <Search size={40} className="text-gray-300" />
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