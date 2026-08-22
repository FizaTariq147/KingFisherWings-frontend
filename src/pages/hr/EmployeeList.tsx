import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';
import { hrService } from '../../features/hr/services/hr.service';
import { labelEnum } from '../../features/hr/constants/hr.constants';

const statusVariant: Record<string, 'success' | 'neutral' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PROBATION: 'success',
  ON_LEAVE: 'warning',
  SUSPENDED: 'warning',
  TERMINATED: 'danger',
  INACTIVE: 'neutral',
};

function isExpiringSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const diff = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 90;
}

function isExpired(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function EmployeeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: () => hrService.listEmployees({ limit: 100 }),
  });

  const departments = ['All', ...Array.from(new Set(employees.map((item) => item.department).filter(Boolean)))];

  const filtered = employees.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.designation.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && (item.status === 'ACTIVE' || item.status === 'PROBATION')) ||
      (statusFilter === 'On Leave' && item.status === 'ON_LEAVE') ||
      (statusFilter === 'Inactive' && item.status !== 'ACTIVE' && item.status !== 'PROBATION' && item.status !== 'ON_LEAVE');
    const matchDept = deptFilter === 'All' || item.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const expiringVisa = employees.filter((item) => isExpiringSoon(item.visaExpiry) || isExpired(item.visaExpiry)).length;
  const expiringPassport = employees.filter((item) => isExpiringSoon(item.passportExpiry)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Employees</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{employees.length} total employees</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/hr/employee-master/new')}>+ New Employee</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: employees.length, color: 'text-[var(--color-neutral-800)]' },
          { label: 'Active', value: employees.filter((item) => item.status === 'ACTIVE').length, color: 'text-[var(--color-success-500)]' },
          { label: 'Visa Alerts', value: expiringVisa, color: expiringVisa > 0 ? 'text-[var(--color-danger-500)]' : 'text-[var(--color-success-500)]' },
          { label: 'Passport Alerts', value: expiringPassport, color: expiringPassport > 0 ? 'text-[var(--color-warning-500)]' : 'text-[var(--color-success-500)]' },
        ].map((card) => (
          <Card key={card.label}>
            <p className="text-xs text-[var(--color-neutral-400)] font-medium mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, code, or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        <div className="flex gap-1">
          {(['All', 'Active', 'On Leave', 'Inactive'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
        >
          {departments.map((dept) => <option key={dept}>{dept}</option>)}
        </select>
      </div>

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
                <TableCell mono>{emp.code || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-semibold text-[var(--color-primary-700)] shrink-0">
                      {emp.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-neutral-800)]">{emp.name}</p>
                      <p className="text-xs text-[var(--color-neutral-400)]">{emp.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{emp.designation || '—'}</TableCell>
                <TableCell>{emp.department || '—'}</TableCell>
                <TableCell>{emp.contractType ? labelEnum(emp.contractType) : '—'}</TableCell>
                <TableCell>{emp.nationality || '—'}</TableCell>
                <TableCell>
                  <span className={`text-xs font-mono ${
                    isExpired(emp.visaExpiry)
                      ? 'text-[var(--color-danger-500)] font-semibold'
                      : isExpiringSoon(emp.visaExpiry)
                        ? 'text-[var(--color-warning-500)] font-semibold'
                        : 'text-[var(--color-neutral-600)]'
                  }`}>
                    {emp.visaExpiry || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-mono ${
                    isExpiringSoon(emp.passportExpiry)
                      ? 'text-[var(--color-warning-500)] font-semibold'
                      : 'text-[var(--color-neutral-600)]'
                  }`}>
                    {emp.passportExpiry || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[emp.status] ?? 'neutral'}>{emp.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs text-[var(--color-primary-500)] hover:underline"
                      onClick={() => navigate(`/hr/employee-master/${emp.id}`)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="text-xs text-[var(--color-neutral-400)] hover:underline"
                      onClick={() => navigate(`/hr/employee-master/${emp.id}/edit`)}
                    >
                      Edit
                    </button>
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
    </div>
  );
}
