import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReportsPageBackLink } from '@/features/reports/components/ReportsPageBackLink';
import { ScanLine, Search, ChevronDown, Heart } from 'lucide-react';
import { useSalesVisitingCards } from '@/features/sales/hooks/useSales';
import { getErrorMessage } from '@/features/crm/utils/getErrorMessage';

const columns = ['Company', 'Contact', 'Email', 'Phone', 'Source', 'Status', 'Created'];

export default function VisitingCardListPage() {
  const [rows, setRows] = useState('5');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeParams, setActiveParams] = useState({ search: '', limit: 200 });
  const [loadStartedAt, setLoadStartedAt] = useState<number | null>(null);

  const query = useSalesVisitingCards(activeParams, submitted);
  const pageSize = Number(rows) || 5;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  const elapsedSeconds =
    loadStartedAt && !query.isLoading ? ((Date.now() - loadStartedAt) / 1000).toFixed(2) : '0.00';

  const handleSubmit = () => {
    setLoadStartedAt(Date.now());
    setActiveParams({ search: search.trim(), limit: 200 });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <ReportsPageBackLink fallbackTo="/sales" fallbackLabel="Back to Sales" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-800">Visiting Card List</h2>
          <div className="flex items-center gap-2">
            <Link
              to="/sales/lead/new"
              className="flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <ScanLine size={14} />
              Scan Visiting Card
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts"
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

          <button type="button" onClick={handleSubmit} className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        <div className="min-h-56">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading visiting cards…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load visiting card contacts.')}
            </div>
          ) : !submitted || pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-2">
              <Search size={40} className="text-gray-300" />
              <span className="text-sm text-[#0A2942]">No Data Found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-2 text-left font-semibold text-[#0A2942] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Link to={`/sales/lead/${row.id}`} className="text-blue-600 hover:underline">
                          {row.company}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{row.contact}</td>
                      <td className="px-4 py-2 text-gray-700">{row.email}</td>
                      <td className="px-4 py-2 text-gray-700">{row.phone}</td>
                      <td className="px-4 py-2 text-gray-700">{row.source}</td>
                      <td className="px-4 py-2 text-gray-700">{row.status}</td>
                      <td className="px-4 py-2 text-gray-700">{row.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-gray-200">
          <p className="text-xs text-[#0A2942]">This report took {elapsedSeconds} seconds.</p>
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
