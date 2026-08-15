import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Plus, Search, ChevronDown, Heart, X, AlignJustify } from 'lucide-react';
import { useSalesTariffs } from '@/features/sales/hooks/useSales';
import { getErrorMessage } from '@/features/crm/utils/getErrorMessage';

interface TariffItem {
  id: string;
  label: string;
  checked: boolean;
}

const initialItems: TariffItem[] = [
  { id: 'owner', label: 'Owner', checked: true },
  { id: 'client', label: 'Client', checked: true },
];

const columns = ['Owner', 'Client', 'Service', 'Origin', 'Destination', 'Charge', 'Currency', 'Sale Rate', 'Cost Rate', 'Valid From', 'Valid To', 'Status'];

export default function RateChargesPage() {
  const [rows, setRows] = useState('10');
  const [expanded, setExpanded] = useState(true);
  const [items, setItems] = useState<TariffItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeParams, setActiveParams] = useState({ search: '', limit: 200 });

  const query = useSalesTariffs(activeParams, submitted);
  const pageSize = Number(rows) || 10;
  const pageItems = useMemo(() => (query.data ?? []).slice(0, pageSize), [query.data, pageSize]);

  useEffect(() => {
    setSubmitted(true);
    setActiveParams({ search: '', limit: 200 });
  }, []);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSearch = () => {
    setActiveParams({ search: search.trim(), limit: 200 });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/sales" label="Back to Sales" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Tariff Sheet</h2>
          <div className="flex items-center gap-2">
            <Link
              to="/quotations/tariff-master/new"
              className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Plus size={14} />
              Create
            </Link>
          </div>
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
            placeholder="Search tariffs"
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

        <div className="bg-[#F5F7FA]">
          <div className="flex items-start px-3 py-2 gap-2">
            <button type="button" onClick={() => setExpanded(!expanded)} className="mt-2 text-gray-500 hover:text-gray-700">
              <ChevronDown size={14} className={`transition-transform ${expanded ? '' : '-rotate-90'}`} />
            </button>

            {expanded && (
              <div className="flex-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0A2942] focus:ring-[#FF751F]"
                    />
                    <div className="flex items-center gap-2 border border-gray-300 rounded bg-white px-2 py-1.5 flex-1 max-w-xs">
                      <span className="w-6 h-6 rounded bg-[#0A2942] flex items-center justify-center text-white shrink-0">
                        <AlignJustify size={13} />
                      </span>
                      <span className="text-sm text-blue-600">{item.label}</span>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-56 border-t border-gray-200">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading tariffs…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load tariffs.')}
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
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-semibold text-[#0A2942] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">{row.owner}</td>
                      <td className="px-3 py-2">{row.client}</td>
                      <td className="px-3 py-2">{row.service}</td>
                      <td className="px-3 py-2">{row.origin}</td>
                      <td className="px-3 py-2">{row.destination}</td>
                      <td className="px-3 py-2">
                        <Link to={`/quotations/tariff-master/${row.id}`} className="text-blue-600 hover:underline">
                          {row.charge}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{row.currency}</td>
                      <td className="px-3 py-2 text-right">{row.saleRate.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{row.costRate.toFixed(2)}</td>
                      <td className="px-3 py-2">{row.validFrom}</td>
                      <td className="px-3 py-2">{row.validTo}</td>
                      <td className="px-3 py-2">{row.active}</td>
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
