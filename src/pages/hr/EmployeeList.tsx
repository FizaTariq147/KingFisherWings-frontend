import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  nationality: string;
  joinDate: string;
  contractType: 'Full Time' | 'Part Time' | 'Contract';
  visaExpiry: string;
  passportExpiry: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

const mockEmployees: Employee[] = [
  { id: '1',  code: 'EMP-001', name: 'Shahzad Zafar',   designation: 'Operations Manager',    department: 'Operations', email: 'shahzad@kfw.ae',   phone: '+971 50 123 4567', nationality: 'Pakistani',   joinDate: '2021-03-01', contractType: 'Full Time', visaExpiry: '2027-02-28', passportExpiry: '2028-06-15', status: 'Active' },
  { id: '2',  code: 'EMP-002', name: 'Ahmed Ali',        designation: 'Finance Manager',        department: 'Finance',    email: 'ahmed@kfw.ae',     phone: '+971 50 234 5678', nationality: 'Egyptian',    joinDate: '2020-07-15', contractType: 'Full Time', visaExpiry: '2026-08-01', passportExpiry: '2027-09-20', status: 'Active' },
  { id: '3',  code: 'EMP-003', name: 'Omar Sheikh',      designation: 'Customer Service',       department: 'Operations', email: 'omar@kfw.ae',      phone: '+971 55 345 6789', nationality: 'Jordanian',   joinDate: '2022-01-10', contractType: 'Full Time', visaExpiry: '2027-01-09', passportExpiry: '2029-03-15', status: 'Active' },
  { id: '4',  code: 'EMP-004', name: 'Sara Hassan',      designation: 'HR Officer',             department: 'HR',         email: 'sara@kfw.ae',      phone: '+971 52 456 7890', nationality: 'Lebanese',    joinDate: '2021-09-20', contractType: 'Full Time', visaExpiry: '2026-09-19', passportExpiry: '2028-12-01', status: 'Active' },
  { id: '5',  code: 'EMP-005', name: 'Khalid Mansoor',   designation: 'Sales Executive',        department: 'Sales',      email: 'khalid@kfw.ae',    phone: '+971 54 567 8901', nationality: 'Pakistani',   joinDate: '2022-06-01', contractType: 'Full Time', visaExpiry: '2027-05-31', passportExpiry: '2026-11-30', status: 'On Leave' },
  { id: '6',  code: 'EMP-006', name: 'Fatima Al Ali',    designation: 'Accounts Executive',     department: 'Finance',    email: 'fatima@kfw.ae',    phone: '+971 56 678 9012', nationality: 'Emirati',     joinDate: '2023-02-15', contractType: 'Full Time', visaExpiry: '2028-02-14', passportExpiry: '2030-05-20', status: 'Active' },
  { id: '7',  code: 'EMP-007', name: 'Ravi Kumar',       designation: 'Documentation Officer',  department: 'Operations', email: 'ravi@kfw.ae',      phone: '+971 50 789 0123', nationality: 'Indian',      joinDate: '2020-11-01', contractType: 'Full Time', visaExpiry: '2025-10-31', passportExpiry: '2027-04-10', status: 'Active' },
  { id: '8',  code: 'EMP-008', name: 'Maria Santos',     designation: 'Admin Assistant',        department: 'Admin',      email: 'maria@kfw.ae',     phone: '+971 55 890 1234', nationality: 'Filipino',    joinDate: '2021-05-20', contractType: 'Full Time', visaExpiry: '2026-05-19', passportExpiry: '2028-08-25', status: 'Active' },
  { id: '9',  code: 'EMP-009', name: 'James Okafor',     designation: 'Warehouse Supervisor',   department: 'WMS',        email: 'james@kfw.ae',     phone: '+971 52 901 2345', nationality: 'Nigerian',    joinDate: '2022-09-01', contractType: 'Full Time', visaExpiry: '2027-08-31', passportExpiry: '2029-01-15', status: 'Active' },
  { id: '10', code: 'EMP-010', name: 'Priya Nair',       designation: 'IT Executive',           department: 'IT',         email: 'priya@kfw.ae',     phone: '+971 54 012 3456', nationality: 'Indian',      joinDate: '2023-05-10', contractType: 'Contract',  visaExpiry: '2025-05-09', passportExpiry: '2027-07-30', status: 'Inactive' },
];

const statusVariant: Record<Employee['status'], 'success' | 'neutral' | 'warning'> = {
  Active:    'success',
  Inactive:  'neutral',
  'On Leave': 'warning',
};

const contractColors: Record<Employee['contractType'], string> = {
  'Full Time': 'text-blue-700 bg-blue-50',
  'Part Time': 'text-purple-700 bg-purple-50',
  'Contract':  'text-orange-700 bg-orange-50',
};

function isExpiringSoon(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 90;
}

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function EmployeeList() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter]     = useState('All');

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => mockEmployees,
  });

  const departments = ['All', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchDept   = deptFilter   === 'All' || e.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const expiringVisa     = employees.filter((e) => isExpiringSoon(e.visaExpiry) || isExpired(e.visaExpiry)).length;
  const expiringPassport = employees.filter((e) => isExpiringSoon(e.passportExpiry)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Employees</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{employees.length} total employees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">⬇ Export</Button>
          <Button>+ New Employee</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: employees.length,                                              color: 'text-[var(--color-neutral-800)]' },
          { label: 'Active',          value: employees.filter((e) => e.status === 'Active').length,         color: 'text-[var(--color-success-500)]' },
          { label: 'Visa Alerts',     value: expiringVisa,                                                  color: expiringVisa > 0 ? 'text-[var(--color-danger-500)]' : 'text-[var(--color-success-500)]' },
          { label: 'Passport Alerts', value: expiringPassport,                                              color: expiringPassport > 0 ? 'text-[var(--color-warning-500)]' : 'text-[var(--color-success-500)]' },
        ].map((card) => (
          <Card key={card.label}>
            <p className="text-xs text-[var(--color-neutral-400)] font-medium mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, code, or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />

        {/* Status Filter */}
        <div className="flex gap-1">
          {(['All', 'Active', 'On Leave', 'Inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        >
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Visa Expiry</TableHead>
              <TableHead>Passport Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell mono>{emp.code}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-semibold text-[var(--color-primary-700)] shrink-0">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-neutral-800)]">{emp.name}</p>
                      <p className="text-xs text-[var(--color-neutral-400)]">{emp.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{emp.designation}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${contractColors[emp.contractType]}`}>
                    {emp.contractType}
                  </span>
                </TableCell>
                <TableCell>{emp.nationality}</TableCell>
                <TableCell>
                  <span className={`text-xs font-mono ${
                    isExpired(emp.visaExpiry)
                      ? 'text-[var(--color-danger-500)] font-semibold'
                      : isExpiringSoon(emp.visaExpiry)
                      ? 'text-[var(--color-warning-500)] font-semibold'
                      : 'text-[var(--color-neutral-600)]'
                  }`}>
                    {emp.visaExpiry}
                    {isExpired(emp.visaExpiry) && ' ⚠️'}
                    {!isExpired(emp.visaExpiry) && isExpiringSoon(emp.visaExpiry) && ' ⏰'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-mono ${
                    isExpiringSoon(emp.passportExpiry)
                      ? 'text-[var(--color-warning-500)] font-semibold'
                      : 'text-[var(--color-neutral-600)]'
                  }`}>
                    {emp.passportExpiry}
                    {isExpiringSoon(emp.passportExpiry) && ' ⏰'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[emp.status]}>{emp.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/hr/employees/${emp.id}`}
                      className="text-xs text-[var(--color-primary-500)] hover:underline"
                    >
                      View
                    </a>
                    <button className="text-xs text-[var(--color-neutral-400)] hover:underline">Edit</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <td colSpan={10} className="text-center text-[var(--color-neutral-400)] py-8">
                  No employees found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
        <span>Showing {filtered.length} of {employees.length} employees</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">←</button>
          <button className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white">1</button>
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">→</button>
        </div>
      </div>
    </div>
  );
}