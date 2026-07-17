import { useState, type ReactNode } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Wand2, Search, ChevronDown, Maximize2 } from 'lucide-react';

// lightweight local replacements for missing widget exports
function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-2">{label}</span>
      {children}
    </label>
  );
}

function SelectInput({ options }: { options: string[] }) {
  return (
    <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700">
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700" {...props} />;
}

function DateInput(props: { value?: string }) {
  return <input type="text" value={props.value} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700" />;
}

export default function EnquirySheetPage() {
  const [rows, setRows] = useState('10');
  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      <div className="bg-white border border-gray-200 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <h2 className="text-[17px] font-medium text-gray-800">All Enquiry</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
            <Wand2 size={14} />
            Create
          </button>
        </div>
      </div>

      {/* Filter grid — 2 rows only */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
        <FilterField label="Date Range">
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <SelectInput options={['Enquiry', 'Booking', 'ETD']} />
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

      {/* Search toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200 bg-[#F5F7FA]">
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

      {/* Footer summary buttons */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200">
        <button className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          Salesperson Wise Summary
        </button>
        <button className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          Department Wise Summary
        </button>
      </div>
      <div className="px-5 pb-4">
        <p className="text-xs text-gray-500">This report took 0.05 seconds.</p>
      </div>
      </div>
    </div>
  );
}