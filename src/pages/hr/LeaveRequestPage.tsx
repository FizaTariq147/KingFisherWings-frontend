import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Search, ChevronDown, Heart } from 'lucide-react';
import { SelectInput, DateInput } from '../../components/widgets/FilterField';

const tabs = ['Leave Applied / Pending', 'Leave Approved', 'Leave Rejected/Cancelled'];

export default function LeaveRequestPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Leave form List</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

    
      {/* Filter row + Submit pinned top-right */}
<div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
  <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
    <div className="flex items-start gap-3">
      <label className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Date Range</label>
      <div className="flex gap-2">
        <div className="w-40">
          <SelectInput options={['Requested Date', 'Leave Start Date']} />
        </div>
        <div className="w-44">
          <SelectInput options={['Next 1 Year', 'This Month', 'This Year']} />
        </div>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <label className="text-sm text-gray-700 pt-2">From Date</label>
      <div className="w-36">
        <DateInput value="08-JUL-26" />
      </div>
    </div>

    <div className="flex items-start gap-3">
      <label className="text-sm text-gray-700 pt-2">To Date</label>
      <div className="w-36">
        <DateInput value="08-JUL-27" />
      </div>
    </div>

    <div className="flex items-start gap-3">
      <label className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Branch</label>
      <div className="w-64">
        <SelectInput options={['All']} />
      </div>
    </div>
  </div>

  <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity shrink-0">
    <span className="text-[#FF751F]">➜</span>
    Submit
  </button>
</div>

        {/* Tab bar */}
        <div className="flex bg-[#0A2942]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'bg-[#1E4E76] text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200">
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

        {/* Results area — empty state with label */}
        <div className="flex flex-col items-center justify-center h-56 gap-2">
          <Search size={40} className="text-gray-300" />
          <span className="text-sm text-gray-500">No data found.</span>
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