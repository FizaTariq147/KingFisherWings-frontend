import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { UserPlus, Search, ChevronDown, Pencil, Filter, X, ChevronRight as SortIcon, ArrowUpDown, Heart } from 'lucide-react';
import { useManagementUsers, useManagementSubscriptionKey } from '@/features/management/hooks/useManagement';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import { MANAGEMENT_SELECT_CLASS } from '@/features/management/utils/managementFilters';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';

const columns = ['', 'Name', 'Display Name', 'Status', 'Company', 'Type', 'Remarks', 'Login', 'Email', 'Activity', 'Voucher Rights'];

function Pagination({ count, total }: { count: number; total: number }) {
  return (
    <div className="px-5 py-2 text-sm text-gray-500">
      {total > 0 ? `1 - ${count} of ${total}` : ''}
    </div>
  );
}

export default function UserAccessPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');
  const [filterActive, setFilterActive] = useState(true);
  const [departmentId, setDepartmentId] = useState('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [statusSort, setStatusSort] = useState<'asc' | 'desc' | null>(null);

  const { data: departments = [] } = useMasterOptions('departments', MASTER_PATHS.departments, true, true);
  const usersQuery = useManagementUsers(submittedSearch || undefined);
  const subscriptionQuery = useManagementSubscriptionKey();

  const visibleUsers = useMemo(() => {
    let list = usersQuery.data ?? [];
    if (filterActive) list = list.filter((u) => u.status !== 'BLOCK');
    if (departmentId) {
      const dept = departments.find((d) => String(d.id) === departmentId);
      const deptLabel = String(dept?.name ?? dept?.code ?? '').toLowerCase();
      if (deptLabel) {
        list = list.filter((u) => u.remarks.toLowerCase().includes(deptLabel));
      }
    }
    if (statusSort) {
      list = [...list].sort((a, b) => {
        const cmp = a.status.localeCompare(b.status);
        return statusSort === 'asc' ? cmp : -cmp;
      });
    }
    const limit = Number(rows) || 10;
    return { rows: list.slice(0, limit), total: list.length };
  }, [usersQuery.data, rows, filterActive, departmentId, departments, statusSort]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/management" label="Back to Management" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">List of Users</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/users/new')}
              className="flex items-center gap-1.5 bg-green-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <UserPlus size={14} />
              New User Request
            </button>
          </div>
        </div>

        <div className="px-5 py-2.5 border-b border-gray-200">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Fresa Subscription Key : </span>
            {subscriptionQuery.isLoading ? 'Loading…' : subscriptionQuery.data || '—'}
          </p>
        </div>

        <div className="px-5 py-3 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-3">
            <span className="text-sm text-gray-700 shrink-0">Department</span>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className={MANAGEMENT_SELECT_CLASS}
            >
              <option value="">All</option>
              {departments.map((dept) => (
                <option key={String(dept.id)} value={String(dept.id)}>
                  {String(dept.name ?? dept.code ?? dept.id)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200">
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
            onClick={() => setSubmittedSearch(search.trim())}
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

        {filterActive && (
          <div className="bg-[#F5F7FA] flex items-start px-3 py-2 gap-2">
            <button type="button" className="mt-1 text-gray-500">
              <ChevronDown size={14} />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filterActive}
                onChange={(e) => setFilterActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0A2942] focus:ring-[#FF751F]"
              />
              <div className="flex items-center gap-2 border border-gray-300 rounded bg-white px-2 py-1.5">
                <span className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-white shrink-0">
                  <Filter size={13} />
                </span>
                <span className="text-sm text-blue-600">Status not in &apos;BLOCK&apos;</span>
              </div>
              <button type="button" onClick={() => setFilterActive(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <Pagination count={visibleUsers.rows.length} total={visibleUsers.total} />

        {usersQuery.isError ? (
          <div className="px-5 py-3 text-sm text-red-600">{getErrorMessage(usersQuery.error)}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col, i) => (
                  <th key={i} className="text-left font-semibold text-[#0A2942] px-4 py-2.5 whitespace-nowrap">
                    {col === 'Status' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setStatusSort((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'))
                        }
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {col} <ArrowUpDown size={12} />
                      </button>
                    ) : (
                      col
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14 text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : visibleUsers.rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleUsers.rows.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {user.name}
                      </button>
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
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="View user"
                        className="text-gray-400 mx-auto cursor-pointer hover:text-gray-600"
                      >
                        <Search size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        className="border border-blue-400 rounded px-2 py-1 text-blue-500 hover:bg-blue-50"
                      >
                        <SortIcon size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination count={visibleUsers.rows.length} total={visibleUsers.total} />

        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">Note: Administrators are having user creation rights</p>
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
