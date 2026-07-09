import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserPlus, Search, ChevronDown, Pencil, Filter, X, ChevronRight as SortIcon, ArrowUpDown, Heart } from 'lucide-react';
import { userService } from '../../features/management/services/userService';
import type { UserRow } from '../../features/management/types/user.types';

const columns = ['', 'Name', 'Display Name', 'Status', 'Company', 'Type', 'Remarks', 'Login', 'Email', 'Activity', 'Voucher Rights'];

function Pagination({ count }: { count: number }) {
  return <div className="px-5 py-2 text-sm text-gray-500">{count > 0 ? `1 - ${count}` : ''}</div>;
}

export default function UserAccessPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subscriptionKey, setSubscriptionKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([userService.getUsers(), userService.getSubscriptionKey()]).then(([userData, key]) => {
      if (active) {
        setUsers(userData);
        setSubscriptionKey(key);
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
          <h2 className="text-[17px] font-medium text-gray-800">List of Users</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button className="flex items-center gap-1.5 bg-green-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <UserPlus size={14} />
              New User Request
            </button>
          </div>
        </div>

        {/* Subscription key */}
        <div className="px-5 py-2.5 border-b border-gray-200">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Fresa Subscription Key : </span>
            {subscriptionKey || '—'}
          </p>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200">
          <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
            <Search size={13} />
            <ChevronDown size={12} />
          </button>
          <input
            type="text"
            placeholder="Search: Name"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
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

        {/* Active filter chip */}
        {filterActive && (
          <div className="bg-[#F5F7FA] flex items-start px-3 py-2 gap-2">
            <button className="mt-1 text-gray-500">
              <ChevronDown size={14} />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 text-[#0A2942] focus:ring-[#FF751F]"
              />
              <div className="flex items-center gap-2 border border-gray-300 rounded bg-white px-2 py-1.5">
                <span className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-white shrink-0">
                  <Filter size={13} />
                </span>
                <span className="text-sm text-blue-600">Status not in 'BLOCK'</span>
              </div>
              <button onClick={() => setFilterActive(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Top pagination */}
        <Pagination count={users.length} />

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col, i) => (
                  <th key={i} className="text-left font-semibold text-[#0A2942] px-4 py-2.5 whitespace-nowrap">
                    {col === 'Status' ? (
                      <span className="flex items-center gap-1 cursor-pointer">
                        {col} <ArrowUpDown size={12} />
                      </span>
                    ) : (
                      col
                    )}
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Pencil size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <a href="#" className="text-blue-600 hover:underline">{user.name}</a>
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{user.displayName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded text-white ${
                          user.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{user.company}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{user.type}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{user.remarks}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{user.login}</td>
                    <td className="px-4 py-2 text-center">
                      <Search size={14} className="text-gray-400 mx-auto cursor-pointer" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Search size={14} className="text-gray-400 mx-auto cursor-pointer" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button className="border border-blue-400 rounded px-2 py-1 text-blue-500 hover:bg-blue-50">
                        <SortIcon size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom pagination */}
        <Pagination count={users.length} />

        {/* Note */}
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">Note: Administrators are having user creation rights</p>
        </div>
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