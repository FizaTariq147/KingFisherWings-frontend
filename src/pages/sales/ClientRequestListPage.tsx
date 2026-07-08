import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { clientService } from '../../features/sales/services/clientService';
import type { ClientRow } from '../../features/sales/types/client.types';

const columns = ['Created By', 'Code', 'Name', 'Status', 'Type', 'Category', 'Port', 'Website', 'Vendor Code', 'Remarks'];

function Pagination() {
  return (
    <div className="flex items-center gap-1 px-5 py-2 text-sm text-gray-500">
      <span>1 - 10</span>
      <button className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

export default function ClientRequestListPage() {
  const [rows, setRows] = useState('10');
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    clientService.getClients().then((data) => {
      if (active) {
        setClients(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Client List</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200">
          <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
            <Search size={13} />
            <ChevronDown size={12} />
          </button>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
          />
          <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
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
          <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
            Options
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Top pagination */}
        <Pagination />

        {/* Data table */}
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
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14 text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.code} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{client.createdBy}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{client.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <a href="#" className="text-blue-600 hover:underline">{client.name}</a>
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

        {/* Bottom pagination */}
        <Pagination />
      </div>

      {/* Floating Favorites button */}
      <div className="mt-4">
        <button className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}