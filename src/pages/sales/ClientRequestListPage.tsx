import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { useSalesClients } from '@/features/sales/hooks/useSales';
import { getErrorMessage } from '@/features/crm/utils/getErrorMessage';

const columns = ['Created By', 'Code', 'Name', 'Status', 'Type', 'Category', 'Port', 'Website', 'Vendor Code', 'Remarks'];

function Pagination({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 px-5 py-2 text-sm text-gray-500">
      <span>{label}</span>
      <button type="button" className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

export default function ClientRequestListPage() {
  const [rows, setRows] = useState('10');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(true);
  const [activeParams, setActiveParams] = useState({ search: '', limit: 200 });

  const query = useSalesClients(activeParams, submitted);
  const pageSize = Number(rows) || 10;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  const handleSearch = () => {
    setActiveParams({ search: search.trim(), limit: 200 });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/sales" label="Back to Sales" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Client List</h2>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200">
          <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
            <Search size={13} />
            <ChevronDown size={12} />
          </button>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
          />
          <button type="button" onClick={handleSearch} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
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

        <Pagination label={query.data?.length ? `1 - ${Math.min(pageSize, query.data.length)}` : '0'} />

        <div className="overflow-x-auto border-t border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-gray-200">
                {columns.map((col) => (
                  <th key={col} className="text-left font-semibold text-[#0A2942] px-4 py-2.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14 text-gray-400 text-sm">
                    Loading clients…
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14 text-red-600 text-sm px-4">
                    {getErrorMessage(query.error, 'Could not load clients.')}
                  </td>
                </tr>
              ) : !pageItems.length ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pageItems.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{client.createdBy}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link to={`/parties/${client.id}`} className="text-blue-600 hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.status}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.type}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.category}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.port}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.website}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.vendorCode}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination label={`${query.data?.length ?? 0} client(s)`} />
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
