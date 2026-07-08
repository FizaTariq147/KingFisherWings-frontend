import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronDown } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';

const tabs = ['Open Enquiry Report', 'Quotation status-wise statistics'];

export default function PricingDashboardPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <h2 className="text-[17px] font-medium text-gray-800">Pricing Dashboard</h2>
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

        <FilterField label="Enquiry No">
          <TextInput />
        </FilterField>

        <FilterField label="Created User">
          <TextInput />
        </FilterField>

        <FilterField label="Enquiry Status">
          <SelectInput options={['All']} />
        </FilterField>
      </div>

      {/* Submit button — right-aligned, own row */}
      <div className="flex justify-end px-5 pb-4">
        <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
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
                ? 'bg-[#0A2942] text-white'
                : 'text-white/70 hover:text-white bg-[#0A2942]/80'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF751F]" />
            )}
          </button>
        ))}
      </div>

      {/* Search toolbar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-[#F5F7FA]">
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

      {/* Results area — empty state */}
      <div className="flex items-center justify-center h-56">
        <Search size={40} className="text-gray-300" />
      </div>
    </div>
  );
}