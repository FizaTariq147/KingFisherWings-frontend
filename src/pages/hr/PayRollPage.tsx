import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Copy, FileCheck, Upload, Plus, Search, ChevronDown, Maximize2, Heart } from 'lucide-react';
import { SelectInput, DateInput } from '../../components/widgets/FilterField';

export default function PayRollPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-wrap gap-2">
          <h2 className="text-[17px] font-medium text-gray-800">Pay Roll List</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button className="flex items-center gap-1.5 bg-green-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <DollarSign size={14} />
              Prepare Payroll
            </button>
            <button className="flex items-center gap-1.5 bg-orange-500 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Copy size={14} />
              Copy Payroll
            </button>
            <button className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <FileCheck size={14} />
              Generate WPS
            </button>
            <button className="flex items-center gap-1.5 bg-purple-400 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Upload size={14} />
              Upload Payroll
            </button>
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Employee Name</label>
            <div className="w-64">
              <SelectInput options={['Select']} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Salary Month</label>
            <div className="w-40">
              <SelectInput options={['--Select--']} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <label className="text-sm text-gray-700 pt-2">Salary Date</label>
            <div className="w-40">
              <DateInput value="" />
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
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Search
            </button>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
              Options
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              <span className="text-[#FF751F]">➜</span>
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

        {/* Legend footnote */}
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            *CL - Casual Leave *SL - Sick Leave *PL - Privilege leaves
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