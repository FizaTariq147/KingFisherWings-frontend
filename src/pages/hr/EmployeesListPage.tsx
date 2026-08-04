import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Plus, Search, ChevronDown, Maximize2, ArrowUpDown, Pencil, Heart } from 'lucide-react';
import { SelectInput } from '../../components/widgets/FilterField';
import { employeeService } from '../../features/hr/services/employeeService';
import type { EmployeeRow } from '../../features/hr/types/employee.types';

const columns = [
  '', 'Branch', 'Name', 'Code', 'Type', 'Designation', 'Department',
  'Birth Date', 'Employment', 'Gender', 'Grade', 'Join Date', 'Mobile', 'Status',
];

function Pagination({ count }: { count: number }) {
  return (
    <div className="px-5 py-2 text-sm text-gray-500">
      {count > 0 ? `1 - ${count}` : ''}
    </div>
  );
}

export default function EmployeesListPage() {
  const [rows, setRows] = useState('10');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    employeeService.getEmployees().then((data) => {
      if (active) {
        setEmployees(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-3">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Employees List</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        {/* Filter grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Name</span>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Branch</span>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="w-20 shrink-0 text-sm text-gray-700 pt-2 text-right">Status</span>
            <div className="flex-1">
              <SelectInput options={['All']} />
            </div>
          </label>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              <span className="text-[#FF751F]">➜</span>
              Submit
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Top pagination */}
        <Pagination count={employees.length} />

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col, i) => (
                  <th key={i} className="text-left font-semibold text-[#0A2942] px-4 py-2.5 whitespace-nowrap">
                    {col === 'Name' ? (
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Pencil size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.branch}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.name}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.code}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.type}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.designation}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.department}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.birthDate}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.employment}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.gender}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.grade}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.joinDate}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{emp.mobile}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded text-white ${
                          emp.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-400'
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

        {/* Bottom pagination */}
        <Pagination count={employees.length} />
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