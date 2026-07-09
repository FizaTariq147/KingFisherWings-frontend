import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Search, ChevronDown, Heart } from 'lucide-react';
import { SelectInput, TextInput } from '../../components/widgets/FilterField';

export default function CgmEdiVesselListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('50');

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">CGM EDI Vessel List</h2>
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

        {/* Filter row */}
        <div className="p-5 flex flex-wrap items-start gap-x-10 gap-y-3">
          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Vessel Name</label>
            <div className="w-48">
              <TextInput />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Voyage</label>
            <div className="w-48">
              <TextInput />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Origin</label>
            <div className="w-40">
              <SelectInput options={['All']} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Destination</label>
            <div className="w-40">
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

        {/* Note */}
        <div className="px-5 py-2.5 border-t border-gray-200">
          <p className="text-xs text-blue-700 italic font-medium">
            Note : If Vessel details not found, Please create new Vessel and Voyage then download the CGM EDI
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