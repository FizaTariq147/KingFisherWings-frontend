import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Wand2, Search, ChevronDown, Maximize2 } from 'lucide-react';
import { useCustomerEnquiries } from '@/features/customers/hooks/useCustomerService';
import type { CustomerEnquiryFilters } from '@/features/customers/types/customerService.types';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import { ENQUIRY_STATUSES } from '@/features/crm/constants/crm.constants';

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-2">{label}</span>
      {children}
    </label>
  );
}

function SelectInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700" {...props} />;
}

function DateInput({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700"
    />
  );
}

export default function EnquirySheetPage() {
  const [rows, setRows] = useState('10');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branch, setBranch] = useState('All');
  const [client, setClient] = useState('All');
  const [salesPerson, setSalesPerson] = useState('All');
  const [department, setDepartment] = useState('All');
  const [origin, setOrigin] = useState('All');
  const [destination, setDestination] = useState('All');
  const [enquiryNo, setEnquiryNo] = useState('');
  const [createdUser, setCreatedUser] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loadStartedAt, setLoadStartedAt] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<CustomerEnquiryFilters>({});

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

  const query = useCustomerEnquiries(activeFilters, submitted);
  const pageSize = Number(rows) || 10;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  const salesSummary = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of query.data ?? []) {
      const key = row.salesPerson || 'Unassigned';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [query.data]);

  const elapsedSeconds =
    loadStartedAt && !query.isLoading ? ((Date.now() - loadStartedAt) / 1000).toFixed(2) : '0.00';

  const handleSubmit = () => {
    if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
    setLoadStartedAt(Date.now());
    setActiveFilters({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branch,
      client,
      salesperson_id: salesPerson,
      department: department !== 'All' ? department : undefined,
      origin: origin !== 'All' ? origin : undefined,
      destination: destination !== 'All' ? destination : undefined,
      enquiry_no: enquiryNo || undefined,
      created_user: createdUser || undefined,
      status,
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
          <h2 className="text-[17px] font-medium text-gray-800">All Enquiry</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Wand2 size={14} />
              Create
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Date Range">
            <div className="flex gap-2">
              <div className="w-24 shrink-0">
                <SelectInput options={['Enquiry', 'Booking', 'ETD']} value="Enquiry" onChange={() => undefined} />
              </div>
              <div className="flex-1 relative">
                <select
                  value={datePreset}
                  onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                  className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700"
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

          <FilterField label="Branch">
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

          <FilterField label="Enquiry No">
            <TextInput value={enquiryNo} onChange={(e) => setEnquiryNo(e.target.value)} />
          </FilterField>

          <FilterField label="Created User">
            <TextInput value={createdUser} onChange={(e) => setCreatedUser(e.target.value)} />
          </FilterField>

          <FilterField label="Enquiry Status">
            <SelectInput options={['All', ...ENQUIRY_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value)} />
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
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading enquiries…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load enquiries.')}
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
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Enquiry No.</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Client</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Service</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Origin</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Destination</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-blue-600">{item.enquiryNo}</td>
                      <td className="px-4 py-2 text-gray-700">{item.client}</td>
                      <td className="px-4 py-2 text-gray-700">{item.serviceType}</td>
                      <td className="px-4 py-2 text-gray-700">{item.origin}</td>
                      <td className="px-4 py-2 text-gray-700">{item.destination}</td>
                      <td className="px-4 py-2 text-gray-700">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200">
          <button type="button" className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
            Salesperson Wise Summary
          </button>
          <button type="button" className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
            Department Wise Summary
          </button>
          {submitted && salesSummary.length > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              Top salesperson: {salesSummary[0][0]} ({salesSummary[0][1]})
            </span>
          )}
        </div>
        <div className="px-5 pb-4">
          <p className="text-xs text-gray-500">This report took {elapsedSeconds} seconds.</p>
        </div>
      </div>
    </div>
  );
}
