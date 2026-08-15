import { useEffect, useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { ListChecks, Wand2, Plus, Search, ChevronDown, Maximize2, Heart } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';
import { useCustomerSailingSchedule } from '@/features/customers/hooks/useCustomerService';
import type { CustomerShipmentFilters } from '@/features/customers/types/customerService.types';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';

export default function SailingSchedulePage() {
  const [rows, setRows] = useState('10');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [carrier, setCarrier] = useState('-Select-');
  const [vesselName, setVesselName] = useState('');
  const [sailingNo, setSailingNo] = useState('');
  const [pol, setPol] = useState('-Select-');
  const [pod, setPod] = useState('-Select-');
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

  const query = useCustomerSailingSchedule(activeFilters, submitted);
  const pageSize = Number(rows) || 10;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  const handleSubmit = () => {
    if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
    setActiveFilters({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      carrier: carrier !== '-Select-' ? carrier : undefined,
      vessel_name: vesselName || undefined,
      sailing_no: sailingNo || undefined,
      pol: pol !== '-Select-' ? pol : undefined,
      pod: pod !== '-Select-' ? pod : undefined,
      search: search.trim() || undefined,
      limit: 300,
      use_etd_dates: true,
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Sailing Schedule List</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1.5 bg-red-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <ListChecks size={14} />
              Report
            </button>
            <button type="button" className="flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Wand2 size={14} />
              Sailing Schedule Upload
            </button>
            <button type="button" className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Date Range">
            <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700">
              <select
                value={datePreset}
                onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                className="w-full bg-transparent focus:outline-none"
              >
                {DATE_RANGE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </FilterField>

          <FilterField label="ETD From Date">
            <DateInput value={fromDate} onChange={(e) => { setFromDate(e.target.value); setDatePreset('custom'); }} />
          </FilterField>

          <FilterField label="ETD To Date">
            <DateInput value={toDate} onChange={(e) => { setToDate(e.target.value); setDatePreset('custom'); }} />
          </FilterField>

          <FilterField label="Carrier">
            <SelectInput options={['-Select-']} value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          </FilterField>

          <FilterField label="Vessel Name">
            <TextInput value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
          </FilterField>

          <FilterField label="Sailing No.">
            <TextInput value={sailingNo} onChange={(e) => setSailingNo(e.target.value)} />
          </FilterField>

          <FilterField label="POL">
            <SelectInput options={['-Select-']} value={pol} onChange={(e) => setPol(e.target.value)} />
          </FilterField>

          <FilterField label="POD">
            <SelectInput options={['-Select-']} value={pod} onChange={(e) => setPod(e.target.value)} />
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
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading sailing schedule…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load sailing schedule.')}
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
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Vessel</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Sailing No.</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Carrier</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">POL</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">POD</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">ETD</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Jobs</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{item.vessel}</td>
                      <td className="px-4 py-2 text-blue-600">{item.sailingNo}</td>
                      <td className="px-4 py-2 text-gray-700">{item.carrier}</td>
                      <td className="px-4 py-2 text-gray-700">{item.pol}</td>
                      <td className="px-4 py-2 text-gray-700">{item.pod}</td>
                      <td className="px-4 py-2 text-gray-700">{item.etd}</td>
                      <td className="px-4 py-2 text-gray-700">{item.jobCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}
