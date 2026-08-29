import { useEffect, useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { HardDrive, Search, ChevronDown, Heart } from 'lucide-react';
import { useManagementPerformance } from '@/features/management/hooks/useManagement';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  MANAGEMENT_SELECT_CLASS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import { orderPerformanceMetricKeys } from '@/features/management/utils/normalizeManagement';

export default function UserWisePerformancePage() {
  const [rows, setRows] = useState('10');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [submitted, setSubmitted] = useState(true);

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    [fromDate, toDate],
  );
  const query = useManagementPerformance(params, submitted);
  const pageSize = Number(rows) || 10;
  const loading = query.isLoading || query.isFetching;

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
    setSubmitted(true);
  }, []);

  const filteredItems = useMemo(() => {
    const list = query.data ?? [];
    if (!appliedSearch.trim()) return list;
    const term = appliedSearch.trim().toLowerCase();
    return list.filter(
      (row) =>
        row.userName.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        (row.role || '').toLowerCase().includes(term) ||
        Object.entries(row.metrics).some(([key, value]) =>
          `${key} ${String(value)}`.toLowerCase().includes(term),
        ),
    );
  }, [query.data, appliedSearch]);

  const items = filteredItems.slice(0, pageSize);
  const metricKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of filteredItems) {
      Object.keys(row.metrics).forEach((key) => keys.add(key));
    }
    return orderPerformanceMetricKeys(Array.from(keys));
  }, [filteredItems]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (submitted) void query.refetch();
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/management" label="Back to Management" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">User wise performance</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 disabled:opacity-60 text-white text-sm px-5 py-1.5 rounded transition-opacity"
            >
              <span className="text-[#FF751F]">➜</span>
              {loading ? 'Loading…' : 'Submit'}
            </button>
            <button type="button" className="flex items-center gap-1.5 bg-pink-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <HardDrive size={14} />
              Monthly Attachment Storage
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2 shrink-0">Date Range</span>
            <div className="w-44 relative">
              <select
                value={datePreset}
                onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                className={`${MANAGEMENT_SELECT_CLASS} appearance-none pr-8`}
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

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">From Date</span>
            <div className="w-40">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset('custom');
                }}
                className={MANAGEMENT_SELECT_CLASS}
              />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">To Date</span>
            <div className="w-40">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset('custom');
                }}
                className={MANAGEMENT_SELECT_CLASS}
              />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-t border-b border-gray-200">
          <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
            <Search size={13} />
            <ChevronDown size={12} />
          </button>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearch(search.trim());
            }}
            placeholder="Search user, email, role, metrics…"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
          />
          <button
            type="button"
            onClick={() => setAppliedSearch(search.trim())}
            className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors"
          >
            Search
          </button>
          {appliedSearch ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setAppliedSearch('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          ) : null}
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
        </div>

        <div className="min-h-56">
          {loading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading performance data…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load user performance.')}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-2">
              <Search size={40} className="text-gray-300" />
              <p className="text-sm text-gray-500">No users match the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">User</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Email</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Role</th>
                    {metricKeys.map((key) => (
                      <th key={key} className="px-4 py-2 text-left font-semibold text-[#0A2942] whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-blue-600 whitespace-nowrap">{row.userName}</td>
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{row.email}</td>
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{row.role || '—'}</td>
                      {metricKeys.map((key) => (
                        <td key={key} className="px-4 py-2 text-gray-700 whitespace-nowrap tabular-nums">
                          {row.metrics[key] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {submitted && !loading && !query.isError ? (
          <div className="px-5 py-3 border-t border-gray-200">
            <span className="inline-block bg-[#0A2942] text-white text-xs font-medium px-3 py-1.5 rounded">
              {filteredItems.length} user(s)
            </span>
          </div>
        ) : null}
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
