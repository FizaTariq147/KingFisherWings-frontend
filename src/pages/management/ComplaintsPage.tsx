import { useEffect, useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown, Maximize2, Heart } from 'lucide-react';
import { SelectInput, DateInput } from '../../components/widgets/FilterField';
import { useManagementComplaints } from '@/features/management/hooks/useManagement';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  isWithinDateRange,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';

const CATEGORY_OPTIONS = ['All', 'Invoice dispute', 'Pricing', 'Service', 'Other'];

export default function ComplaintsPage() {
  const [rows, setRows] = useState('5');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const query = useManagementComplaints(status === 'All' ? undefined : status);

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

  const items = useMemo(() => {
    let list = query.data ?? [];
    if (category !== 'All') {
      list = list.filter((x) => x.category.toLowerCase() === category.toLowerCase());
    }
    if (fromDate || toDate) {
      list = list.filter((x) => isWithinDateRange(x.createdAt, fromDate, toDate));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q) ||
          (x.invoiceNumber || '').toLowerCase().includes(q) ||
          (x.partyName || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [query.data, category, fromDate, toDate, search]);

  const pageSize = Number(rows) || 5;
  const pageItems = items.slice(0, pageSize);

  return (
    <div className="space-y-3">
      <PageBackLink to="/management" label="Back to Management" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">List of Complaints</h2>
        </div>

        <div className="p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Category</span>
            <div className="w-40">
              <SelectInput
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </label>

          <div className="flex-1 min-w-[240px]">
            <label className="flex items-start gap-3">
              <span className="text-sm text-gray-700 pt-2 shrink-0">Date Range</span>
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
            </label>
          </div>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">From date</span>
            <div className="w-36">
              <DateInput
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset('custom');
                }}
              />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">To date</span>
            <div className="w-36">
              <DateInput
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset('custom');
                }}
              />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Status</span>
            <div className="w-40">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white"
              >
                {['All', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              placeholder="Search: Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button
              type="button"
              className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors"
            >
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
            <button
              type="button"
              onClick={() => {
                if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
                void query.refetch();
              }}
              className="bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
            >
              Refresh
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-600 p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-56">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load complaints.')}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-2">
              <Search size={40} className="text-gray-300" />
              <p className="text-sm text-gray-500">No complaints match the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Category</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Invoice</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-blue-600">{item.name}</td>
                      <td className="px-4 py-2 text-gray-700">{item.category}</td>
                      <td className="px-4 py-2 text-gray-700">{item.invoiceNumber || '—'}</td>
                      <td className="px-4 py-2">
                        <span className="inline-block bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded">
                          {item.status.replaceAll('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-5 py-3">
          <span className="inline-block bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded">
            {query.isLoading ? 'Loading' : query.isError ? 'Error' : `${items.length} record(s)`}
          </span>
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
