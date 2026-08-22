import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Wand2, Search, Calendar, ChevronDown, Maximize2 } from 'lucide-react';
import { useCustomerShipments } from '@/features/customers/hooks/useCustomerService';
import { useCustomerFilterSelectOptions } from '@/features/customers/hooks/useCustomerServiceFilterOptions';
import type { CustomerFilterOption } from '@/features/customers/types/customerFilter.types';
import type { CustomerShipmentFilters } from '@/features/customers/types/customerService.types';
import { defaultCustomerShipmentFilters } from '@/features/customers/utils/customerServiceDefaults';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import { JOB_STATUSES, JOB_TYPE_WIZARD_OPTIONS } from '@/features/jobs/constants/job.constants';
import { CUSTOMER_SERVICE_PATHS, customerJobDetailPath } from '@/features/customers/utils/customerServicePaths';
import { toggleTableFullscreen } from '@/features/customers/utils/tableFullscreen';

interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="flex items-start gap-3">
      <span className="w-28 shrink-0 text-sm text-gray-700 pt-2 text-right">{label}</span>
      <span className="flex-1">{children}</span>
    </label>
  );
}

function SelectInput({
  options,
  value,
  onChange,
}: {
  options: Array<string | CustomerFilterOption>;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  const normalized = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white"
      >
        {normalized.map((opt) => (
          <option key={`${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
    />
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-1.5 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
      />
      <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function AllShipmentsPage() {
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const initialRange = resolveDateRangePreset('this_month');
  const [rows, setRows] = useState('5');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState(initialRange?.from_date ?? '');
  const [toDate, setToDate] = useState(initialRange?.to_date ?? '');
  const [branch, setBranch] = useState('All');
  const [client, setClient] = useState('All');
  const [salesPerson, setSalesPerson] = useState('All');
  const [department, setDepartment] = useState('All');
  const [origin, setOrigin] = useState('All');
  const [destination, setDestination] = useState('All');
  const [shipper, setShipper] = useState('-Select-');
  const [consignee, setConsignee] = useState('-Select-');
  const [createdUser, setCreatedUser] = useState('All');
  const [shipmentNo, setShipmentNo] = useState('');
  const [hbl, setHbl] = useState('');
  const [jobNo, setJobNo] = useState('');
  const [mbl, setMbl] = useState('');
  const [status, setStatus] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(true);
  const [activeFilters, setActiveFilters] = useState<CustomerShipmentFilters>(() =>
    defaultCustomerShipmentFilters(),
  );

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

  const query = useCustomerShipments(activeFilters, submitted);
  const filters = useCustomerFilterSelectOptions();

  const pageSize = Number(rows) || 5;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  const resolveFormDates = () => {
    if (fromDate || toDate) {
      return { from_date: fromDate || undefined, to_date: toDate || undefined };
    }
    if (datePreset !== 'custom') {
      const range = resolveDateRangePreset(datePreset);
      if (range) return range;
    }
    return { from_date: undefined, to_date: undefined };
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const dates = resolveFormDates();
    if (dates.from_date && !fromDate) setFromDate(dates.from_date);
    if (dates.to_date && !toDate) setToDate(dates.to_date);
    setActiveFilters({
      ...dates,
      branch_id: branch,
      client,
      salesperson_id: salesPerson,
      department: department !== 'All' ? department : undefined,
      origin,
      destination,
      shipper_id: shipper !== '-Select-' ? shipper : undefined,
      consignee_id: consignee !== '-Select-' ? consignee : undefined,
      created_user: createdUser !== 'All' ? createdUser : undefined,
      shipment_no: shipmentNo || undefined,
      hbl: hbl || undefined,
      job_no: jobNo || undefined,
      mbl: mbl || undefined,
      status,
      job_type: jobType,
      search: search.trim() || undefined,
      limit: 100,
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">All Shipments</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(CUSTOMER_SERVICE_PATHS.createJob)}
              className="flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Wand2 size={14} />
              Create
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3"
        >
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
            <DateInput
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setDatePreset('custom');
              }}
            />
          </FilterField>

          <FilterField label="To Date">
            <DateInput
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setDatePreset('custom');
              }}
            />
          </FilterField>

          <FilterField label="Created Branch">
            <SelectInput options={filters.branches} value={branch} onChange={(e) => setBranch(e.target.value)} />
          </FilterField>

          <FilterField label="Client">
            <SelectInput options={filters.clients} value={client} onChange={(e) => setClient(e.target.value)} />
          </FilterField>

          <FilterField label="Sales Person">
            <SelectInput options={filters.salesPersons} value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} />
          </FilterField>

          <FilterField label="Department">
            <SelectInput options={filters.departments} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </FilterField>

          <FilterField label="Origin">
            <SelectInput options={filters.ports} value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </FilterField>

          <FilterField label="Destination">
            <SelectInput options={filters.ports} value={destination} onChange={(e) => setDestination(e.target.value)} />
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
            <SelectInput options={filters.shippers} value={shipper} onChange={(e) => setShipper(e.target.value)} />
          </FilterField>

          <FilterField label="Consignee">
            <SelectInput options={filters.consignees} value={consignee} onChange={(e) => setConsignee(e.target.value)} />
          </FilterField>

          <FilterField label="Created User">
            <SelectInput options={filters.salesPersons} value={createdUser} onChange={(e) => setCreatedUser(e.target.value)} />
          </FilterField>

          <FilterField label="Shipment Status">
            <SelectInput options={['All', ...JOB_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value)} />
          </FilterField>

          <FilterField label="Type">
            <SelectInput options={['All', ...JOB_TYPE_WIZARD_OPTIONS]} value={jobType} onChange={(e) => setJobType(e.target.value)} />
          </FilterField>
        </form>

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
            <button type="submit" onClick={handleSubmit} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
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
            <button type="button" onClick={() => handleSubmit()} className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              <span className="text-[#FF751F]">➜</span>
              Submit
            </button>
            <button
              type="button"
              onClick={() => void toggleTableFullscreen(tableRef)}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Fullscreen table"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-56">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading shipments…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load shipments.')}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 px-5 text-center">
              <Search size={40} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No shipments match your filters.</p>
              <p className="text-xs text-gray-400 mt-1">Try a wider date range or clear status/type filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto" ref={tableRef}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Shipment No.</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Client</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Origin</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Destination</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">ETD</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(customerJobDetailPath(item))}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-2 text-blue-600">{item.shipmentNo}</td>
                      <td className="px-4 py-2 text-gray-700">{item.client}</td>
                      <td className="px-4 py-2 text-gray-700">{item.origin}</td>
                      <td className="px-4 py-2 text-gray-700">{item.destination}</td>
                      <td className="px-4 py-2 text-gray-700">{item.status}</td>
                      <td className="px-4 py-2 text-gray-700">{item.etd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {submitted && !query.isLoading && (
          <div className="px-5 py-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">{query.data?.length ?? 0} shipment(s)</span>
          </div>
        )}
      </div>
    </div>
  );
}
