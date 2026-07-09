import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wand2, Search, Calendar, ChevronDown, Maximize2 } from 'lucide-react';


interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <label className="w-28 shrink-0 text-sm text-gray-700 pt-2 text-right">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SelectInput({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700
                   focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function TextInput({ placeholder }: { placeholder?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700
                 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
    />
  );
}

function DateInput({ value }: { value: string }) {
  return (
    <div className="relative">
      <input
        type="text"
        defaultValue={value}
        className="w-full border border-gray-300 rounded px-3 py-1.5 pr-9 text-sm text-gray-700
                   focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
      />
      <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function AllShipmentsPage() {
  const [rows, setRows] = useState('5');
     const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <h2 className="text-[17px] font-medium text-gray-800">All Shipments</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <button className="flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
            <Wand2 size={14} />
            Create
          </button>
        </div>
      </div>

      {/* Filter grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
        <FilterField label="Date Range">
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <SelectInput options={['Shipme', 'Booking', 'ETD']} />
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

        <FilterField label="Created Branch">
          <SelectInput options={['All']} />
        </FilterField>

        <FilterField label="Client">
          <SelectInput options={['All']} />
        </FilterField>

        <FilterField label="Sales Person">
          <SelectInput options={['All']} />
        </FilterField>

        <FilterField label="Department">
          <TextInput placeholder="All" />
        </FilterField>

        <FilterField label="Origin">
          <SelectInput options={['All']} />
        </FilterField>

        <FilterField label="Destination">
          <SelectInput options={['All']} />
        </FilterField>

        <FilterField label="Shipment No.">
          <TextInput />
        </FilterField>

        <FilterField label="HBL / HAWB No.">
          <TextInput />
        </FilterField>

        <FilterField label="Job No.">
          <TextInput />
        </FilterField>

        <FilterField label="MBL / MAWB No.">
          <TextInput />
        </FilterField>

        <FilterField label="Shipper">
          <SelectInput options={['-Select-']} />
        </FilterField>

        <FilterField label="Consignee">
          <SelectInput options={['-Select-']} />
        </FilterField>

        <FilterField label="Created User">
          <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-400">
            <span>&nbsp;</span>
            <ChevronDown size={14} className="text-gray-400 rotate-180" />
          </div>
        </FilterField>

        <FilterField label="Shipment Status">
          <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-400">
            <span>&nbsp;</span>
            <ChevronDown size={14} className="text-gray-400 rotate-180" />
          </div>
        </FilterField>

        <FilterField label="Type">
          <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-400">
            <span>&nbsp;</span>
            <ChevronDown size={14} className="text-gray-400 rotate-180" />
          </div>
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
            placeholder="Search: Shipment No"
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
    </div>
  );
}