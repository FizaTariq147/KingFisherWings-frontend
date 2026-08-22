import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Plus, Search, ChevronDown, Maximize2, ArrowUpDown, Pencil, Heart } from 'lucide-react';
import { SelectInput } from '../../components/widgets/FilterField';
import { hrService } from '../../features/hr/services/hr.service';
import { EMPLOYEE_STATUSES, labelEnum } from '../../features/hr/constants/hr.constants';

const columns = [
  '',
  'Branch',
  'Name',
  'Code',
  'Type',
  'Designation',
  'Department',
  'Birth Date',
  'Employment',
  'Gender',
  'Grade',
  'Join Date',
  'Mobile',
  'Status',
];

function Pagination({ count }: { count: number }) {
  return (
    <div className="px-5 py-2 text-sm text-gray-500">{count > 0 ? `1 - ${count}` : ''}</div>
  );
}

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [branchId, setBranchId] = useState('All');
  const [appliedStatus, setAppliedStatus] = useState('All');
  const [appliedBranch, setAppliedBranch] = useState('All');

  const { data: options } = useQuery({
    queryKey: ['hr', 'master-options'],
    queryFn: () => hrService.listMasterOptions(),
    staleTime: 60_000,
  });

  const { data: employees = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['hr', 'employees', search, appliedStatus, appliedBranch],
    queryFn: () =>
      hrService.listEmployees({
        limit: 100,
        search,
        status: appliedStatus === 'All' ? undefined : appliedStatus,
        branch_id: appliedBranch === 'All' ? undefined : appliedBranch,
      }),
  });

  const visible = useMemo(
    () => employees.slice(0, Number(rows) || 10),
    [employees, rows],
  );

  const branchOptions = ['All', ...(options?.branches ?? []).map((item) => item.name)];
  const statusOptions = ['All', ...EMPLOYEE_STATUSES];

  const applyFilters = () => {
    setSearch(searchInput.trim());
    setAppliedStatus(status);
    const match = options?.branches.find((item) => item.name === branchId || item.id === branchId);
    setAppliedBranch(branchId === 'All' ? 'All' : match?.id || branchId);
    void refetch();
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Employees List</h2>
          <button
            type="button"
            onClick={() => navigate('/hr/employee-master/new')}
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            <Plus size={14} />
            Create
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Name</span>
            <div className="flex-1">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name / email / code"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Branch</span>
            <div className="flex-1">
              <SelectInput
                options={branchOptions}
                value={branchId === 'All' ? 'All' : options?.branches.find((b) => b.id === branchId)?.name || 'All'}
                onChange={(e) => {
                  const name = e.target.value;
                  const match = options?.branches.find((item) => item.name === name);
                  setBranchId(name === 'All' ? 'All' : match?.id || 'All');
                }}
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Status</span>
            <div className="flex-1">
              <SelectInput options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button
              type="button"
              onClick={applyFilters}
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
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
            >
              <span className="text-[#FF751F]">➜</span>
              Submit
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-600 p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <Pagination count={visible.length} />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col, i) => (
                  <th key={i} className="text-left font-semibold text-[#0A2942] px-4 py-2.5 whitespace-nowrap">
                    {col === 'Name' ? (
                      <span className="flex items-center gap-1">
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
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14 text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14 text-red-600 text-sm">
                    {error instanceof Error ? error.message : 'Could not load employees.'}
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => navigate(`/hr/employee-master/${emp.id}/edit`)}
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.branch || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={() => navigate(`/hr/employee-master/${emp.id}`)}
                      >
                        {emp.name}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.code || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {emp.type ? labelEnum(emp.type) : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.designation || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.department || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.birthDate || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {emp.employment ? labelEnum(emp.employment) : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {emp.gender ? labelEnum(emp.gender) : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {emp.grade ? labelEnum(emp.grade) : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.joinDate || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.mobile || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded text-white ${
                          emp.status === 'ACTIVE' || emp.status === 'PROBATION' ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination count={visible.length} />
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
