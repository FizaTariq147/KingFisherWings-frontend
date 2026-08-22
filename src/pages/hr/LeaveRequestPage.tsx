import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, Search, ChevronDown, Heart } from 'lucide-react';
import { DateInput } from '../../components/widgets/FilterField';
import { hrService } from '../../features/hr/services/hr.service';
import { LEAVE_TYPES, labelEnum } from '../../features/hr/constants/hr.constants';
import {
  leaveRequestSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '../../features/hr/schemas/hr.schema';
import type { LeaveType } from '../../features/hr/types/hr.types';

const tabs = ['Leave Applied / Pending', 'Leave Approved', 'Leave Rejected/Cancelled'];

export default function LeaveRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState('10');
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'leave-form'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: requests = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'leave-requests', fromDate, toDate],
    queryFn: () =>
      hrService.listLeaveRequests({
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  });

  const createLeave = useMutation({
    mutationFn: (payload: {
      employee_id: string;
      leave_type: LeaveType;
      start_date: string;
      end_date: string;
      reason?: string;
    }) => hrService.createLeaveRequest(payload),
    onSuccess: () => {
      setCreateOpen(false);
      setReason('');
      setFieldErrors({});
      void queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not create leave request.'),
  });

  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      action === 'approve' ? hrService.approveLeave(id) : hrService.rejectLeave(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] }),
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not update leave request.'),
  });

  const clearField = (key: string) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const submitLeave = () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(leaveRequestSchema, {
      employee_id: employeeId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    createLeave.mutate({
      employee_id: parsed.data.employee_id,
      leave_type: parsed.data.leave_type,
      start_date: parsed.data.start_date!,
      end_date: parsed.data.end_date!,
      reason: parsed.data.reason,
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((row) => {
      const status = row.status.toUpperCase();
      if (activeTab.includes('Pending') && !status.includes('PEND') && !status.includes('APPL')) return false;
      if (activeTab.includes('Approved') && !status.includes('APPROV')) return false;
      if (activeTab.includes('Rejected') && !status.includes('REJECT') && !status.includes('CANCEL') && !status.includes('RETURN')) {
        return false;
      }
      if (fromDate && row.from && row.from < fromDate) return false;
      if (toDate && row.to && row.to > toDate) return false;
      if (!q) return true;
      return `${row.employee} ${row.type} ${row.reason}`.toLowerCase().includes(q);
    });
  }, [requests, activeTab, search, fromDate, toDate]);

  const visible = filtered.slice(0, Number(rows) || 10);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PageBackLink to="/hr" label="Back to HR" />
        <button
          type="button"
          onClick={() => navigate('/hr/leave')}
          className="text-sm text-[#0A2942] underline"
        >
          Leave calendar
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Leave form List</h2>
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setFieldErrors({});
              setCreateOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            <Plus size={14} />
            Create
          </button>
        </div>

        {actionError && !createOpen && <p className="px-5 pt-3 text-sm text-red-600">{actionError}</p>}

        <div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
            <label className="flex items-start gap-3">
              <span className="text-sm text-gray-700 pt-2">From Date</span>
              <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </label>
            <label className="flex items-start gap-3">
              <span className="text-sm text-gray-700 pt-2">To Date</span>
              <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="flex bg-[#0A2942]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF751F]" />}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leave"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <span className="text-sm text-gray-500 ml-2">Rows</span>
            <select
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option>5</option>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>

        <div className="min-h-56">
          {isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-500">Loading leave requests…</div>
          ) : isError ? (
            <div className="flex items-center justify-center h-56 text-sm text-red-600">
              {error instanceof Error ? error.message : 'Could not load leave requests.'}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Employee', 'Type', 'From', 'To', 'Status', 'Reason', 'Actions'].map((col) => (
                    <th key={col} className="text-left font-semibold text-[#0A2942] px-4 py-2.5">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{row.employee}</td>
                    <td className="px-4 py-2">{labelEnum(row.type)}</td>
                    <td className="px-4 py-2">{row.from}</td>
                    <td className="px-4 py-2">{row.to}</td>
                    <td className="px-4 py-2">{row.status}</td>
                    <td className="px-4 py-2">{row.reason || '—'}</td>
                    <td className="px-4 py-2">
                      {row.status.toUpperCase().includes('PEND') && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="text-xs text-green-700 hover:underline"
                            onClick={() => review.mutate({ id: row.id, action: 'approve' })}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-700 hover:underline"
                            onClick={() => review.mutate({ id: row.id, action: 'reject' })}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create leave request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={createLeave.isPending} onClick={submitLeave}>
              {createLeave.isPending ? 'Saving…' : 'Submit'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {actionError && createOpen ? <p className="text-sm text-red-600">{actionError}</p> : null}
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Employee *</span>
            <select
              className={`w-full h-9 border rounded px-3 ${fieldErrors.employee_id ? 'border-red-400' : ''}`}
              value={employeeId}
              onChange={(e) => {
                clearField('employee_id');
                setEmployeeId(e.target.value);
              }}
            >
              <option value="">Select</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            {fieldErrors.employee_id ? (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.employee_id}</span>
            ) : null}
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Leave type *</span>
            <select
              className={`w-full h-9 border rounded px-3 ${fieldErrors.leave_type ? 'border-red-400' : ''}`}
              value={leaveType}
              onChange={(e) => {
                clearField('leave_type');
                setLeaveType(e.target.value as LeaveType);
              }}
            >
              {LEAVE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {labelEnum(item)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="block text-xs text-gray-600 mb-1">From *</span>
              <input
                type="date"
                className={`w-full h-9 border rounded px-3 ${fieldErrors.start_date ? 'border-red-400' : ''}`}
                value={startDate}
                onChange={(e) => {
                  clearField('start_date');
                  setStartDate(e.target.value);
                }}
              />
              {fieldErrors.start_date ? (
                <span className="mt-1 block text-xs text-red-600">{fieldErrors.start_date}</span>
              ) : null}
            </label>
            <label className="block text-sm">
              <span className="block text-xs text-gray-600 mb-1">To *</span>
              <input
                type="date"
                className={`w-full h-9 border rounded px-3 ${fieldErrors.end_date ? 'border-red-400' : ''}`}
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  clearField('end_date');
                  setEndDate(e.target.value);
                }}
              />
              {fieldErrors.end_date ? (
                <span className="mt-1 block text-xs text-red-600">{fieldErrors.end_date}</span>
              ) : null}
            </label>
          </div>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Reason</span>
            <textarea
              className={`w-full border rounded px-3 py-2 ${fieldErrors.reason ? 'border-red-400' : ''}`}
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => {
                clearField('reason');
                setReason(e.target.value);
              }}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
