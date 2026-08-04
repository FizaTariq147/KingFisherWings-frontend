import { useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { ChevronDown, Search, Maximize2, RotateCcw } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';

const columns = ['Origin', 'Client', 'Destination', 'Shipment No.', 'Shipment Date', 'Branch', 'Shipment Status'];

export default function CostingSearchPage() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      {/* Filter panel */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <ChevronDown size={14} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
            </button>
            <h2 className="text-[17px] font-medium text-gray-800">Shipment Costing Search</h2>
          </div>
        </div>

        {!collapsed && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
            <FilterField label="Date Range">
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <SelectInput options={['Shipmer', 'Booking', 'ETD']} />
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

            <FilterField label="Shipper">
              <SelectInput options={['-Select-']} />
            </FilterField>

            <FilterField label="Consignee">
              <SelectInput options={['-Select-']} />
            </FilterField>

            <FilterField label="Created User">
              <SelectInput options={['']} />
            </FilterField>

            <FilterField label="Status">
              <SelectInput options={['All']} />
            </FilterField>

            {/* Type + Submit share the last row */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <FilterField label="Type">
                  <SelectInput options={['All']} />
                </FilterField>
              </div>
              <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity mb-0.5">
                <span className="text-[#FF751F]">➜</span>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shipment List panel */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[15px] font-medium text-gray-800">Shipment List</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Table toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 bg-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              placeholder="Search: Full Text"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Go
            </button>
            <div className="relative ml-1">
              <select className="appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF751F]">
                <option>Primary Report</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
                Actions
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <button className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-400 bg-white cursor-not-allowed" disabled>
            <RotateCcw size={13} />
            Reset
          </button>
        </div>

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                {columns.map((col) => (
                  <th key={col} className="text-left font-medium text-gray-700 px-5 py-2.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="py-14">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="text-gray-300" />
                    <span className="text-sm text-gray-500">No data found</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Costing panel */}
<div className="bg-white border border-gray-200 rounded-md">
  <div className="px-5 py-3 border-b border-gray-200">
    <h2 className="text-[15px] font-medium text-gray-800">Costing</h2>
  </div>
  <div className="px-5 py-4 space-y-2">
    <p className="text-sm text-gray-500">
      Selected Shipment No. : <span className="text-gray-700"></span>
    </p>
    <p className="text-sm font-semibold text-gray-800 text-center py-2">
      Sale - (Qty x Amount Per Unit x Ex.Rate) | Cost - (Qty x Amount Per Unit x Ex.Rate)
    </p>
  </div>
</div>
    </div>
  );
}