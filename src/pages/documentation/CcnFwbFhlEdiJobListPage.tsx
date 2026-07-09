import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronDown, Heart } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';

export default function CcnFwbFhlEdiJobListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">CCN FWB/FHL EDI Job List</h2>
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
              <div className="w-24 shrink-0">
                <SelectInput options={['ATD/ETD', 'ATA/ETA']} />
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

          <FilterField label="Flight Name">
            <TextInput />
          </FilterField>

          <FilterField label="Job No.">
            <TextInput />
          </FilterField>

          <FilterField label="Origin">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Destination">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="MAWB No.">
            <TextInput />
          </FilterField>
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

          <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        {/* Results area — empty state */}
        <div className="flex items-center justify-center h-56">
          <Search size={40} className="text-gray-300" />
        </div>

        {/* Report timing footer */}
        <div className="px-5 py-2.5 border-t border-gray-200">
          <p className="text-xs text-[#0A2942]">This report took 0.17 seconds.</p>
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