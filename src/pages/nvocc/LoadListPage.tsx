import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown, Heart } from 'lucide-react';
import { SelectInput, TextInput } from '../../components/widgets/FilterField';

const tabs = ['NVOCC Load List', 'Export Vessel Load List', 'Import Vessel DSO'];

export default function LoadListPage() {
  const [rows, setRows] = useState('10');
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800 uppercase">Vessel Load List / DSO</h2>
        </div>

        {/* Filter row + Submit pinned top-right */}
        <div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
            <label className="flex items-start gap-3">
              <span className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Department</span>
              <div className="w-52">
                <SelectInput options={['-Select-']} />
              </div>
            </label>

            <label className="flex items-start gap-3">
              <span className="text-sm text-gray-700 pt-2">
                <span className="text-red-500">*</span> Vessel
              </span>
              <div className="w-52">
                <SelectInput options={['All']} />
              </div>
            </label>

            <label className="flex items-start gap-3">
              <span className="text-sm text-gray-700 pt-2">
                <span className="text-red-500">*</span> Voyage
              </span>
              <div className="w-52">
                <TextInput />
              </div>
            </label>

            <label className="flex items-start gap-3">
              <span className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Carrier</span>
              <div className="w-52">
                <SelectInput options={['All']} />
              </div>
            </label>

            <label className="flex items-start gap-3">
              <span className="text-sm text-gray-700 pt-2">Job No</span>
              <div className="w-52">
                <TextInput />
              </div>
            </label>
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
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-[#1E4E76] text-white' : 'text-white/80 hover:text-white'
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

        {/* Results area — empty state */}
        <div className="flex items-center justify-center h-56">
          <Search size={40} className="text-gray-300" />
        </div>

        {/* Note */}
        <div className="px-5 py-2.5 border-t border-gray-200">
          <p className="text-xs text-red-600 italic font-medium">
            * Once download completed, Please remove the header from the downloaded excel file
          </p>
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