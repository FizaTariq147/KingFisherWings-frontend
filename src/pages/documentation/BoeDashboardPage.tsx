import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown, ClipboardList, Heart } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';

export default function BoeDashboardPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">BOE Dashboard</h2>
        </div>

        {/* Filter grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Date Range">
            <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700">
              <span>This Month</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 cursor-pointer">×</span>
                <ChevronDown size={14} className="text-gray-400" />
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

          <FilterField label="Client">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Sales Person">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Department">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Origin">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Destination">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="Job No">
            <TextInput />
          </FilterField>

          <FilterField label="Created User">
            <TextInput />
          </FilterField>

          <FilterField label="Job Status">
            <SelectInput options={['All']} />
          </FilterField>

          <FilterField label="BOE Type">
            <SelectInput options={['-Select-']} />
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
            Note : After clicking the submit button, the Pending Claims button will enable.
          </p>
        </div>

        {/* Pending Claims shortcut button */}
        <div className="px-5 py-3">
          <button
            disabled={!submitted}
            className={`flex items-center gap-1.5 text-white text-sm px-4 py-2 rounded transition-opacity bg-amber-400 ${
              submitted ? 'hover:opacity-90 cursor-pointer' : 'opacity-60 cursor-not-allowed'
            }`}
          >
            <ClipboardList size={14} />
            Pending Claims
          </button>
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