import { useEffect, useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown, Maximize2 } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';
import { useCustomerTracking } from '@/features/customers/hooks/useCustomerService';
import type { CustomerShipmentFilters } from '@/features/customers/types/customerService.types';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import { JOB_STATUSES, JOB_TYPE_WIZARD_OPTIONS } from '@/features/jobs/constants/job.constants';

export default function ShipmentTrackingPage() {
  const [rows, setRows] = useState('5');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branch, setBranch] = useState('All');
  const [client, setClient] = useState('All');
  const [salesPerson, setSalesPerson] = useState('All');
  const [department, setDepartment] = useState('All');
  const [origin, setOrigin] = useState('All');
  const [destination, setDestination] = useState('All');
  const [shipmentNo, setShipmentNo] = useState('');
  const [hbl, setHbl] = useState('');
  const [jobNo, setJobNo] = useState('');
  const [mbl, setMbl] = useState('');
  const [status, setStatus] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CustomerShipmentFilters>({});

  const applyPreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') return;
    const range = resolveDateRangePreset(preset);
    if (range) {
      setFromDate(range.from_date);
      setToDate(range.to_date);
    }
  };

  useEffect(() => {
    applyPreset('this_month');
  }, []);

  const query = useCustomerTracking(activeFilters, submitted);
  const pageSize = Number(rows) || 5;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  const handleSubmit = () => {
    if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
    setActiveFilters({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branch,
      client,
      salesperson_id: salesPerson,
      department: department !== 'All' ? department : undefined,
      origin,
      destination,
      shipment_no: shipmentNo || undefined,
      hbl: hbl || undefined,
      job_no: jobNo || undefined,
      mbl: mbl || undefined,
      status,
      job_type: jobType,
      search: search.trim() || undefined,
      limit: 200,
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Shipment Tracking</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Date Range">
            <div className="flex gap-2">
              <div className="w-24 shrink-0">
                <SelectInput options={['Shipme', 'Booking', 'ETD']} value="Shipme" onChange={() => undefined} />
              </div>
              <div className="flex-1 relative">
                <select
                  value={datePreset}
                  onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                  className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white"
                >
                  {DATE_RANGE_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </FilterField>

          <FilterField label="From Date">
            <DateInput value={fromDate} onChange={(e) => { setFromDate(e.target.value); setDatePreset('custom'); }} />
          </FilterField>

          <FilterField label="To Date">
            <DateInput value={toDate} onChange={(e) => { setToDate(e.target.value); setDatePreset('custom'); }} />
          </FilterField>

          <FilterField label="Created Branch">
            <SelectInput options={['All']} value={branch} onChange={(e) => setBranch(e.target.value)} />
          </FilterField>

          <FilterField label="Client">
            <SelectInput options={['All']} value={client} onChange={(e) => setClient(e.target.value)} />
          </FilterField>

          <FilterField label="Sales Person">
            <SelectInput options={['All']} value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} />
          </FilterField>

          <FilterField label="Department">
            <SelectInput options={['All']} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </FilterField>

          <FilterField label="Origin">
            <SelectInput options={['All']} value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </FilterField>

          <FilterField label="Destination">
            <SelectInput options={['All']} value={destination} onChange={(e) => setDestination(e.target.value)} />
          </FilterField>

          <FilterField label="Shipment No.">
            <TextInput value={shipmentNo} onChange={(e) => setShipmentNo(e.target.value)} />
          </FilterField>

          <FilterField label="HBL / HAWB No.">
            <TextInput value={hbl} onChange={(e) => setHbl(e.target.value)} />
          </FilterField>

          <FilterField label="Job No.">
            <TextInput value={jobNo} onChange={(e) => setJobNo(e.target.value)} />
          </FilterField>

          <FilterField label="MBL / MAWB No.">
            <TextInput value={mbl} onChange={(e) => setMbl(e.target.value)} />
          </FilterField>

          <FilterField label="Shipper">
            <SelectInput options={['-Select-']} value="-Select-" onChange={() => undefined} />
          </FilterField>

          <FilterField label="Consignee">
            <SelectInput options={['-Select-']} value="-Select-" onChange={() => undefined} />
          </FilterField>

          <FilterField label="Created User">
            <SelectInput options={['']} value="" onChange={() => undefined} />
          </FilterField>

          <FilterField label="Status">
            <SelectInput options={['All', ...JOB_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value)} />
          </FilterField>

          <FilterField label="Type">
            <SelectInput options={['All', ...JOB_TYPE_WIZARD_OPTIONS]} value={jobType} onChange={(e) => setJobType(e.target.value)} />
          </FilterField>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200 bg-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              placeholder="Search: Shipment No"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button type="button" onClick={handleSubmit} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
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
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
              Options
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSubmit} className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              <span className="text-[#FF751F]">➜</span>
              Submit
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-600 p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-56">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading tracking data…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load shipment tracking.')}
            </div>
          ) : !submitted || pageItems.length === 0 ? (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Shipment No.</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Client</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Current Milestone</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Milestone Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-blue-600">{item.shipmentNo}</td>
                      <td className="px-4 py-2 text-gray-700">{item.client}</td>
                      <td className="px-4 py-2 text-gray-700">{item.status}</td>
                      <td className="px-4 py-2 text-gray-700">{item.currentMilestone}</td>
                      <td className="px-4 py-2 text-gray-700">{item.milestoneDate}</td>
                      <td className="px-4 py-2 text-gray-700">{item.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
