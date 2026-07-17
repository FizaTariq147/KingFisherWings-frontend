import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface LeaveRequest {
  id: string;
  employee: string;
  department: string;
  type: 'Annual Leave' | 'Sick Leave' | 'Emergency' | 'Unpaid';
  from: string;
  to: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
  reason: string;
}

const mockLeaveRequests: LeaveRequest[] = [
  { id: '1', employee: 'Shahzad Zafar',  department: 'Operations', type: 'Annual Leave',  from: '2026-07-01', to: '2026-07-15', days: 15, status: 'Approved', appliedOn: '2026-06-01', reason: 'Family vacation' },
  { id: '2', employee: 'Ahmed Ali',      department: 'Finance',    type: 'Sick Leave',    from: '2026-06-24', to: '2026-06-25', days: 2,  status: 'Pending',  appliedOn: '2026-06-23', reason: 'Medical appointment' },
  { id: '3', employee: 'Omar Sheikh',    department: 'Operations', type: 'Annual Leave',  from: '2026-07-10', to: '2026-07-20', days: 11, status: 'Pending',  appliedOn: '2026-06-15', reason: 'Annual vacation' },
  { id: '4', employee: 'Sara Hassan',    department: 'HR',         type: 'Emergency',     from: '2026-06-22', to: '2026-06-23', days: 2,  status: 'Approved', appliedOn: '2026-06-22', reason: 'Family emergency' },
  { id: '5', employee: 'Khalid Mansoor', department: 'Sales',      type: 'Annual Leave',  from: '2026-08-01', to: '2026-08-10', days: 10, status: 'Rejected', appliedOn: '2026-06-10', reason: 'Personal travel' },
  { id: '6', employee: 'Fatima Al Ali', department: 'Accounts',   type: 'Sick Leave',    from: '2026-06-26', to: '2026-06-26', days: 1,  status: 'Pending',  appliedOn: '2026-06-25', reason: 'Unwell' },
];

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const typeColors: Record<LeaveRequest['type'], string> = {
  'Annual Leave': 'bg-[var(--color-primary-500)]',
  'Sick Leave':   'bg-[var(--color-warning-500)]',
  'Emergency':    'bg-[var(--color-danger-500)]',
  'Unpaid':       'bg-[var(--color-neutral-400)]',
};

const statusVariant: Record<LeaveRequest['status'], 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending:  'warning',
  Rejected: 'danger',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isLeaveDay(date: string, leave: LeaveRequest) {
  return leave.status !== 'Rejected' && date >= leave.from && date <= leave.to;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function LeaveCalendar() {
  const today        = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [applyModal, setApplyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests'],
    queryFn: async () => mockLeaveRequests,
  });

  const filtered = leaveRequests.filter((l) =>
    statusFilter === 'All' || l.status === statusFilter
  );

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function getLeavesForDay(day: number) {
    const date = formatDate(year, month, day);
    return leaveRequests.filter((l) => isLeaveDay(date, l));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Leave Calendar</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{leaveRequests.length} total leave requests</p>
        </div>
        <Button onClick={() => setApplyModal(true)}>+ Apply Leave</Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color} inline-block`} />
            <span className="text-xs text-[var(--color-neutral-600)]">{type}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="col-span-2">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-[var(--color-neutral-200)] flex items-center justify-center text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
            >
              ←
            </button>
            <h2 className="text-base font-semibold text-[var(--color-neutral-800)]">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-[var(--color-neutral-200)] flex items-center justify-center text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
            >
              →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-[var(--color-neutral-400)] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day         = i + 1;
              const dateStr     = formatDate(year, month, day);
              const dayLeaves   = getLeavesForDay(day);
              const isToday     = dateStr === formatDate(today.getFullYear(), today.getMonth(), today.getDate());
              const isWeekend   = new Date(year, month, day).getDay() === 5 || new Date(year, month, day).getDay() === 6;

              return (
                <div
                  key={day}
                  className={`min-h-16 p-1 rounded-lg border transition-colors ${
                    isToday
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : isWeekend
                      ? 'border-transparent bg-[var(--color-neutral-50)]'
                      : 'border-transparent hover:bg-[var(--color-neutral-50)]'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${
                    isToday
                      ? 'text-[var(--color-primary-600)]'
                      : isWeekend
                      ? 'text-[var(--color-neutral-300)]'
                      : 'text-[var(--color-neutral-600)]'
                  }`}>
                    {day}
                  </p>
                  <div className="space-y-0.5">
                    {dayLeaves.slice(0, 2).map((l) => (
                      <div
                        key={l.id}
                        className={`${typeColors[l.type]} rounded px-1 py-0.5`}
                        title={`${l.employee} — ${l.type}`}
                      >
                        <p className="text-white text-xs truncate leading-tight">
                          {l.employee.split(' ')[0]}
                        </p>
                      </div>
                    ))}
                    {dayLeaves.length > 2 && (
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        +{dayLeaves.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Leave Request List */}
        <div className="space-y-3">
          <Card>
            <div className="grid grid-cols-3 text-center gap-1">
              {[
                { label: 'Pending',  count: leaveRequests.filter((l) => l.status === 'Pending').length,  color: 'text-[var(--color-warning-500)]' },
                { label: 'Approved', count: leaveRequests.filter((l) => l.status === 'Approved').length, color: 'text-[var(--color-success-500)]' },
                { label: 'Rejected', count: leaveRequests.filter((l) => l.status === 'Rejected').length, color: 'text-[var(--color-danger-500)]' },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-[var(--color-neutral-400)]">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Status Filter */}
          <div className="flex gap-1">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[var(--color-primary-500)] text-white'
                    : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Request Cards */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filtered.map((leave) => (
              <Card key={leave.id} padding="sm">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-semibold text-[var(--color-primary-700)]">
                      {leave.employee[0]}
                    </div>
                    <p className="text-xs font-semibold text-[var(--color-neutral-800)]">{leave.employee}</p>
                  </div>
                  <Badge variant={statusVariant[leave.status]}>{leave.status}</Badge>
                </div>
                <p className="text-xs text-[var(--color-neutral-500)] mb-1">{leave.type} · {leave.days} day(s)</p>
                <p className="text-xs font-mono text-[var(--color-neutral-400)]">{leave.from} → {leave.to}</p>
                <p className="text-xs text-[var(--color-neutral-400)] mt-1 truncate">{leave.reason}</p>
                {leave.status === 'Pending' && (
                  <div className="flex gap-1 mt-2">
                    <button className="flex-1 py-1 rounded text-xs font-medium bg-[var(--color-success-100)] text-[var(--color-success-700)] hover:bg-[var(--color-success-500)] hover:text-white transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 py-1 rounded text-xs font-medium bg-[var(--color-danger-100)] text-[var(--color-danger-700)] hover:bg-[var(--color-danger-500)] hover:text-white transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        open={applyModal}
        onClose={() => setApplyModal(false)}
        title="Apply for Leave"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApplyModal(false)}>Cancel</Button>
            <Button onClick={() => setApplyModal(false)}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">Leave Type</span>
            <select className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
              <option>Annual Leave</option>
              <option>Sick Leave</option>
              <option>Emergency</option>
              <option>Unpaid</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[var(--color-neutral-600)]">From Date</span>
              <input type="date" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[var(--color-neutral-600)]">To Date</span>
              <input type="date" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">Reason</span>
            <textarea
              rows={3}
              placeholder="Briefly describe the reason for leave..."
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}