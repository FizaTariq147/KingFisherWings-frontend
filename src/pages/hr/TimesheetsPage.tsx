import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { hrService } from '@/features/hr/services/hr.service';
import { TIMESHEET_STATUSES, labelEnum } from '@/features/hr/constants/hr.constants';
import {
  createTimesheetSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';
import type { TimesheetStatus } from '@/features/hr/types/hr.types';

export default function TimesheetsPage() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 8)}01`;
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [workDate, setWorkDate] = useState(today);
  const [hours, setHours] = useState('8');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'timesheets'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: timesheets = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'timesheets', from, to, employeeFilter, statusFilter],
    queryFn: () =>
      hrService.listTimesheets({
        from,
        to,
        employee_id: employeeFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['hr', 'timesheets'] });

  const createTs = useMutation({
    mutationFn: (payload: {
      employee_id: string;
      work_date: string;
      hours: number;
      overtime_hours?: number;
      notes?: string;
    }) => hrService.createTimesheet(payload),
    onSuccess: () => {
      setCreateOpen(false);
      setNotes('');
      setFieldErrors({});
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not create timesheet.'),
  });

  const approve = useMutation({
    mutationFn: (id: string) => hrService.approveTimesheet(id),
    onSuccess: refresh,
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Approve failed.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => hrService.deleteTimesheet(id),
    onSuccess: refresh,
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Delete failed.'),
  });

  const submit = useMutation({
    mutationFn: (id: string) => hrService.updateTimesheet(id, { status: 'SUBMITTED' as TimesheetStatus }),
    onSuccess: refresh,
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Submit failed.'),
  });

  const exportOt = useMutation({
    mutationFn: () => {
      const now = new Date();
      return hrService.exportTimesheetsPayrollOt(now.getFullYear(), now.getMonth() + 1);
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'OT export failed.'),
  });

  const submitTimesheet = () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(createTimesheetSchema, {
      employee_id: employeeId,
      work_date: workDate,
      hours: Number(hours),
      overtime_hours: overtimeHours ? Number(overtimeHours) : undefined,
      notes: notes.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    createTs.mutate({
      employee_id: parsed.data.employee_id,
      work_date: parsed.data.work_date!,
      hours: parsed.data.hours!,
      overtime_hours: parsed.data.overtime_hours,
      notes: parsed.data.notes,
    });
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-gray-800">Timesheets</h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => exportOt.mutate()} disabled={exportOt.isPending}>
            {exportOt.isPending ? 'Exporting…' : 'Export OT to payroll'}
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus size={14} className="mr-1" />
            New entry
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-wrap gap-3">
        <label className="text-sm flex flex-col gap-1">
          From
          <input type="date" className="border rounded px-2 py-1.5" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-sm flex flex-col gap-1">
          To
          <input type="date" className="border rounded px-2 py-1.5" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="text-sm flex flex-col gap-1">
          Employee
          <select
            className="border rounded px-2 py-1.5 min-w-[180px]"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">All</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex flex-col gap-1">
          Status
          <select
            className="border rounded px-2 py-1.5"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {TIMESHEET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelEnum(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading timesheets…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Could not load timesheets.'}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {['Date', 'Employee', 'Hours', 'OT', 'Status', 'Notes', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-4 py-2 font-semibold text-[#0A2942]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timesheets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-gray-500 text-center">
                    No timesheets in this range.
                  </td>
                </tr>
              ) : (
                timesheets.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{row.work_date}</td>
                    <td className="px-4 py-2">{row.employee}</td>
                    <td className="px-4 py-2">{row.hours}</td>
                    <td className="px-4 py-2">{row.overtime_hours}</td>
                    <td className="px-4 py-2">{labelEnum(row.status)}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate">{row.notes || '—'}</td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      {row.status === 'DRAFT' && (
                        <button
                          type="button"
                          className="text-xs text-blue-700 hover:underline"
                          onClick={() => submit.mutate(row.id)}
                        >
                          Submit
                        </button>
                      )}
                      {(row.status === 'SUBMITTED' || row.status === 'DRAFT') && (
                        <button
                          type="button"
                          className="text-xs text-green-700 hover:underline"
                          onClick={() => approve.mutate(row.id)}
                        >
                          Approve
                        </button>
                      )}
                      {row.status !== 'APPROVED' && (
                        <button
                          type="button"
                          className="text-xs text-red-700 hover:underline"
                          onClick={() => remove.mutate(row.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New timesheet entry">
        <div className="space-y-3">
          <label className="text-sm block">
            Employee
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            {fieldErrors.employee_id && (
              <span className="text-red-600 text-xs">{fieldErrors.employee_id}</span>
            )}
          </label>
          <label className="text-sm block">
            Work date
            <input
              type="date"
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
            {fieldErrors.work_date && <span className="text-red-600 text-xs">{fieldErrors.work_date}</span>}
          </label>
          <label className="text-sm block">
            Hours
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            {fieldErrors.hours && <span className="text-red-600 text-xs">{fieldErrors.hours}</span>}
          </label>
          <label className="text-sm block">
            Overtime hours
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(e.target.value)}
            />
          </label>
          <label className="text-sm block">
            Notes
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitTimesheet} disabled={createTs.isPending}>
              {createTs.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
