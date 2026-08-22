import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { hrService } from '@/features/hr/services/hr.service';
import { LEAVE_TYPES, labelEnum } from '@/features/hr/constants/hr.constants';
import {
  leaveRequestSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';
import type { LeaveRequestRecord, LeaveType } from '@/features/hr/types/hr.types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type DisplayStatus = 'Approved' | 'Pending' | 'Rejected';

function leaveBarStyle(type: string): string {
  const value = type.toUpperCase();
  if (value.includes('SICK')) return 'bg-amber-500 border-amber-600';
  if (value.includes('EMERGENCY')) return 'bg-red-500 border-red-600';
  if (value.includes('UNPAID')) return 'bg-gray-500 border-gray-600';
  if (value.includes('MATERNITY')) return 'bg-violet-500 border-violet-600';
  if (value.includes('HAJJ')) return 'bg-emerald-600 border-emerald-700';
  return 'bg-sky-600 border-sky-700';
}

function leaveChipStyle(type: string): string {
  return `${leaveBarStyle(type)} text-white`;
}

function leaveLegendDot(type: string): string {
  return leaveBarStyle(type).split(' ')[0];
}

function displayStatus(status: string): DisplayStatus {
  const value = status.toUpperCase();
  if (value.includes('APPROV')) return 'Approved';
  if (value.includes('REJECT') || value.includes('CANCEL') || value.includes('RETURN')) return 'Rejected';
  return 'Pending';
}

const statusStyles: Record<DisplayStatus, { badge: string; dot: string }> = {
  Approved: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  Pending: { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  Rejected: { badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isLeaveDay(date: string, leave: LeaveRequestRecord) {
  return displayStatus(leave.status) !== 'Rejected' && date >= leave.from && date <= leave.to;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(from + 'T12:00:00');
  const end = new Date(to + 'T12:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Split month into Sun–Sat week rows (null = empty cell). */
function buildWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array.from({ length: firstDay }, () => null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

interface WeekBar {
  leave: LeaveRequestRecord;
  startCol: number;
  span: number;
  row: number;
}

function buildWeekBars(
  weeks: (number | null)[][],
  year: number,
  month: number,
  leaves: LeaveRequestRecord[],
): WeekBar[] {
  const bars: WeekBar[] = [];
  const activeLeaves = leaves.filter((l) => displayStatus(l.status) !== 'Rejected');

  weeks.forEach((week, row) => {
    activeLeaves.forEach((leave) => {
      let segStart: number | null = null;
      for (let col = 0; col < 7; col++) {
        const day = week[col];
        const date = day != null ? formatDate(year, month, day) : null;
        const covered = date != null && isLeaveDay(date, leave);

        if (covered && segStart === null) segStart = col;

        const isLastCol = col === 6;
        if ((!covered || isLastCol) && segStart !== null) {
          const endCol = covered && isLastCol ? col : col - 1;
          if (endCol >= segStart) {
            bars.push({ leave, startCol: segStart, span: endCol - segStart + 1, row });
          }
          segStart = null;
        }
      }
    });
  });

  return bars;
}

export default function LeaveCalendar() {
  const today = new Date();
  const queryClient = useQueryClient();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [highlightedLeaveId, setHighlightedLeaveId] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);
  const [rangePreview, setRangePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [applyModal, setApplyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | DisplayStatus>('All');
  const [search, setSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const from = formatDate(year, month, 1);
  const to = formatDate(year, month, getDaysInMonth(year, month));
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'leave-form'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: leaveRequests = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'leave-calendar', from, to],
    queryFn: () => hrService.listLeaveCalendar(from, to),
  });

  const weeks = useMemo(() => buildWeeks(year, month), [year, month]);
  const weekBars = useMemo(
    () => buildWeekBars(weeks, year, month, leaveRequests),
    [weeks, year, month, leaveRequests],
  );

  const selectedRange = useMemo(() => {
    if (!rangeAnchor || !rangePreview) return null;
    const start = compareDates(rangeAnchor, rangePreview) <= 0 ? rangeAnchor : rangePreview;
    const end = compareDates(rangeAnchor, rangePreview) <= 0 ? rangePreview : rangeAnchor;
    return { start, end, days: dateRange(start, end) };
  }, [rangeAnchor, rangePreview]);

  const createLeave = useMutation({
    mutationFn: (payload: {
      employee_id: string;
      leave_type: LeaveType;
      start_date: string;
      end_date: string;
      reason?: string;
    }) => hrService.createLeaveRequest(payload),
    onSuccess: () => {
      setApplyModal(false);
      setReason('');
      setFieldErrors({});
      clearRange();
      void queryClient.invalidateQueries({ queryKey: ['hr', 'leave-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : 'Could not submit leave.'),
  });

  const submitLeave = () => {
    setFormError(null);
    const parsed = parseWithFieldErrors(leaveRequestSchema, {
      employee_id: employeeId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setFormError(parsed.message);
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

  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      action === 'approve' ? hrService.approveLeave(id) : hrService.rejectLeave(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hr', 'leave-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
    },
  });

  const stats = useMemo(
    () => ({
      pending: leaveRequests.filter((item) => displayStatus(item.status) === 'Pending').length,
      approved: leaveRequests.filter((item) => displayStatus(item.status) === 'Approved').length,
      rejected: leaveRequests.filter((item) => displayStatus(item.status) === 'Rejected').length,
    }),
    [leaveRequests],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leaveRequests.filter((item) => {
      if (statusFilter !== 'All' && displayStatus(item.status) !== statusFilter) return false;
      if (selectedDate && !(selectedDate >= item.from && selectedDate <= item.to)) return false;
      if (!q) return true;
      return `${item.employee} ${item.type} ${item.reason}`.toLowerCase().includes(q);
    });
  }, [leaveRequests, statusFilter, search, selectedDate]);

  const clearRange = useCallback(() => {
    setRangeAnchor(null);
    setRangePreview(null);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    if (!highlightedLeaveId) return;
    const el = document.getElementById(`leave-card-${highlightedLeaveId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [highlightedLeaveId, filtered]);

  function prevMonth() {
    setSelectedDate(null);
    clearRange();
    if (month === 0) {
      setMonth(11);
      setYear((v) => v - 1);
    } else setMonth((v) => v - 1);
  }

  function nextMonth() {
    setSelectedDate(null);
    clearRange();
    if (month === 11) {
      setMonth(0);
      setYear((v) => v + 1);
    } else setMonth((v) => v + 1);
  }

  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(todayStr);
    clearRange();
  }

  function getLeavesForDate(dateStr: string) {
    return leaveRequests.filter((item) => isLeaveDay(dateStr, item));
  }

  function openApplyRange(start: string, end: string) {
    setFormError(null);
    setFieldErrors({});
    setStartDate(start);
    setEndDate(end);
    setApplyModal(true);
  }

  function handleDayMouseDown(dateStr: string) {
    setIsDragging(true);
    setRangeAnchor(dateStr);
    setRangePreview(dateStr);
    setSelectedDate(dateStr);
  }

  function handleDayMouseEnter(dateStr: string) {
    if (isDragging && rangeAnchor) setRangePreview(dateStr);
    setHoveredDate(dateStr);
  }

  function handleDayClick(dateStr: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  function isInSelectedRange(dateStr: string): boolean {
    if (!selectedRange) return false;
    return dateStr >= selectedRange.start && dateStr <= selectedRange.end;
  }

  function isRangeEdge(dateStr: string): 'start' | 'end' | false {
    if (!selectedRange) return false;
    if (dateStr === selectedRange.start) return 'start';
    if (dateStr === selectedRange.end) return 'end';
    return false;
  }

  function highlightLeave(leave: LeaveRequestRecord) {
    setHighlightedLeaveId(leave.id);
    setSelectedDate(null);
    if (leave.from >= from && leave.from <= to) {
      const { year: y, month: m, day: d } = parseDateStr(leave.from);
      if (y !== year || m !== month) {
        setYear(y);
        setMonth(m);
      }
      setSelectedDate(leave.from);
    }
  }

  const hoveredLeaves = hoveredDate ? getLeavesForDate(hoveredDate) : [];

  const statCards = [
    { label: 'Pending', value: stats.pending, icon: Clock, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, tone: 'text-red-600 bg-red-50' },
  ] as const;

  const ROW_HEIGHT = 68;
  const BAR_TOP = 26;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageBackLink to="/hr" label="Back to HR" />
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setFieldErrors({});
            setApplyModal(true);
          }}
          className="inline-flex items-center gap-1.5 rounded bg-[#0A2942] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          Apply leave
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A2942] to-[#0d3554] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <CalendarDays size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Leave Calendar</h1>
                <p className="text-sm text-white/70">
                  Drag across days to select a range · Click a leave bar to highlight
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {statCards.map(({ label, value, icon: Icon, tone }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm"
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tone}`}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-none text-white">{value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/60">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 bg-[#F5F7FA] px-5 py-3">
          {LEAVE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors hover:bg-white/80"
              title={labelEnum(type)}
            >
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${leaveLegendDot(type)}`} />
              <span className="text-xs text-gray-600">{labelEnum(type)}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
          <div
            ref={calendarRef}
            className="relative border-b border-gray-200 p-3 lg:border-b-0 lg:border-r"
            onMouseLeave={() => {
              setHoveredDate(null);
              setHoverPos(null);
            }}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-all hover:border-[#0A2942] hover:bg-[#0A2942]/5 active:scale-95"
                >
                  <ChevronLeft size={15} />
                </button>
                <div className="flex items-center gap-1">
                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(Number(e.target.value));
                      clearRange();
                    }}
                    className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs font-semibold text-[#0A2942] focus:border-[#FF751F] focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
                  >
                    {MONTHS.map((name, i) => (
                      <option key={name} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(Number(e.target.value));
                      clearRange();
                    }}
                    className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs font-semibold text-[#0A2942] focus:border-[#FF751F] focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
                  >
                    {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-all hover:border-[#0A2942] hover:bg-[#0A2942]/5 active:scale-95"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedRange && selectedRange.days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => openApplyRange(selectedRange.start, selectedRange.end)}
                    className="rounded-md bg-[#FF751F] px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    Apply {selectedRange.days.length}d
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToToday}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-[#0A2942] transition-colors hover:bg-gray-50"
                >
                  Today
                </button>
                {(selectedRange || selectedDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      clearRange();
                      setSelectedDate(null);
                    }}
                    className="text-xs text-gray-500 hover:text-[#FF751F] hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-gray-500">Loading calendar…</div>
            ) : isError ? (
              <div className="flex h-48 items-center justify-center text-sm text-red-600">
                {error instanceof Error ? error.message : 'Could not load leave calendar.'}
              </div>
            ) : (
              <div className="select-none">
                <div className="mb-0.5 grid grid-cols-7">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="space-y-0.5">
                  {weeks.map((week, rowIndex) => (
                    <div
                      key={`week-${rowIndex}`}
                      className="relative grid grid-cols-7 gap-0.5"
                      style={{ minHeight: ROW_HEIGHT }}
                    >
                      {week.map((day, colIndex) => {
                        if (day == null) {
                          return (
                            <div key={`empty-${rowIndex}-${colIndex}`} className="rounded-md bg-gray-50/40" />
                          );
                        }
                        const dateStr = formatDate(year, month, day);
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedDate;
                        const inRange = isInSelectedRange(dateStr);
                        const rangeEdge = isRangeEdge(dateStr);
                        const dow = new Date(year, month, day).getDay();
                        const isWeekend = dow === 0 || dow === 6;
                        const dayLeaveCount = getLeavesForDate(dateStr).length;

                        return (
                          <div
                            key={dateStr}
                            role="button"
                            tabIndex={0}
                            onMouseDown={() => handleDayMouseDown(dateStr)}
                            onMouseEnter={(e) => {
                              handleDayMouseEnter(dateStr);
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setHoverPos({ x: rect.left + rect.width / 2, y: rect.bottom });
                            }}
                            onClick={(e) => handleDayClick(dateStr, e)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleDayClick(dateStr, e as unknown as React.MouseEvent);
                            }}
                            className={`relative z-10 cursor-pointer rounded-md border p-1 transition-all duration-150 ${
                              inRange
                                ? rangeEdge === 'start' || rangeEdge === 'end'
                                  ? 'border-[#FF751F] bg-orange-100 ring-1 ring-[#FF751F]/40'
                                  : 'border-orange-200 bg-orange-50/90'
                                : isSelected
                                  ? 'border-[#FF751F] bg-orange-50 ring-1 ring-[#FF751F]/30'
                                  : isToday
                                    ? 'border-[#0A2942] bg-sky-50 shadow-sm'
                                    : isWeekend
                                      ? 'border-transparent bg-gray-50/80 hover:border-gray-300 hover:bg-white'
                                      : 'border-transparent hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                                  isToday
                                    ? 'bg-[#0A2942] text-white'
                                    : inRange
                                      ? 'bg-[#FF751F] text-white'
                                      : isSelected
                                        ? 'bg-[#FF751F] text-white'
                                        : 'text-gray-700 group-hover:bg-gray-100'
                                }`}
                              >
                                {day}
                              </span>
                              {dayLeaveCount > 0 && (
                                <span className="rounded-full bg-[#0A2942]/10 px-1 py-px text-[9px] font-bold text-[#0A2942]">
                                  {dayLeaveCount}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Spanning leave bars overlay */}
                      <div
                        className="pointer-events-none absolute inset-x-0 grid grid-cols-7 gap-0.5 px-0"
                        style={{ top: BAR_TOP, height: ROW_HEIGHT - BAR_TOP - 4 }}
                      >
                        {weekBars
                          .filter((b) => b.row === rowIndex)
                          .map((bar, i) => {
                            const status = displayStatus(bar.leave.status);
                            const isHighlighted = highlightedLeaveId === bar.leave.id;
                            return (
                              <button
                                key={`${bar.leave.id}-${rowIndex}-${i}`}
                                type="button"
                                style={{
                                  gridColumn: `${bar.startCol + 1} / span ${bar.span}`,
                                }}
                                className={`pointer-events-auto mx-px flex h-4 items-center truncate rounded border px-1 text-left text-[9px] font-semibold text-white shadow-sm transition-all hover:z-20 hover:brightness-110 active:scale-95 ${leaveBarStyle(bar.leave.type)} ${
                                  isHighlighted ? 'z-20 ring-1 ring-white ring-offset-1 ring-offset-[#FF751F]' : ''
                                } ${status === 'Pending' ? 'opacity-90' : ''}`}
                                title={`${bar.leave.employee} · ${labelEnum(bar.leave.type)} · ${status}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  highlightLeave(bar.leave);
                                }}
                              >
                                <span
                                  className={`mr-1 h-1.5 w-1.5 shrink-0 rounded-full ${statusStyles[status].dot}`}
                                />
                                <span className="truncate">{bar.leave.employee.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hover popover */}
                {hoveredDate && hoverPos && hoveredLeaves.length > 0 && (
                  <div
                    className="pointer-events-none fixed z-50 w-48 -translate-x-1/2 rounded-md border border-gray-200 bg-white p-2 shadow-lg"
                    style={{ left: hoverPos.x, top: hoverPos.y + 6 }}
                  >
                    <p className="mb-2 text-xs font-semibold text-[#0A2942]">{hoveredDate}</p>
                    <ul className="space-y-1.5">
                      {hoveredLeaves.map((leave) => (
                        <li key={leave.id} className="flex items-center gap-2 text-xs">
                          <span className={`h-2 w-2 rounded-full ${leaveLegendDot(leave.type)}`} />
                          <span className="font-medium text-gray-800">{leave.employee}</span>
                          <span className="text-gray-400">· {labelEnum(leave.type)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — unchanged behaviour */}
          <div ref={sidebarRef} className="flex flex-col bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-[#0A2942]">Leave requests</h3>
              {selectedDate && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Filtered to {selectedDate}
                  <button
                    type="button"
                    className="ml-2 text-[#FF751F] hover:underline"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear
                  </button>
                </p>
              )}
            </div>

            <div className="flex gap-1 border-b border-gray-100 px-3 py-2">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-[#0A2942] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="border-b border-gray-100 px-3 py-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee or reason…"
                  className="w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-sm focus:border-[#FF751F] focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
                />
              </div>
            </div>

            <div className="max-h-[420px] flex-1 space-y-2 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays size={32} className="mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No leave requests match this filter.</p>
                </div>
              ) : (
                filtered.map((leave) => {
                  const status = displayStatus(leave.status);
                  const isHighlighted = highlightedLeaveId === leave.id;
                  return (
                    <article
                      id={`leave-card-${leave.id}`}
                      key={leave.id}
                      className={`rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md ${
                        isHighlighted
                          ? 'border-[#FF751F] ring-2 ring-[#FF751F]/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A2942]/10 text-xs font-bold text-[#0A2942]">
                            {initials(leave.employee)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800">{leave.employee}</p>
                            <p className="text-xs text-gray-500">{leave.department || '—'}</p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[status].badge}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${leaveChipStyle(leave.type)}`}>
                          {labelEnum(leave.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {leave.days} day{leave.days === 1 ? '' : 's'}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-gray-600">
                        {leave.from}
                        <span className="mx-1 text-gray-300">→</span>
                        {leave.to}
                      </p>
                      {leave.reason && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-gray-400">{leave.reason}</p>
                      )}

                      {status === 'Pending' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-600 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            disabled={review.isPending}
                            onClick={() => review.mutate({ id: leave.id, action: 'approve' })}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                            disabled={review.isPending}
                            onClick={() => review.mutate({ id: leave.id, action: 'reject' })}
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={applyModal}
        onClose={() => setApplyModal(false)}
        title="Apply for Leave"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApplyModal(false)}>
              Cancel
            </Button>
            <Button disabled={createLeave.isPending} onClick={submitLeave}>
              {createLeave.isPending ? 'Saving…' : 'Submit Request'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {formError}
            </div>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Employee</span>
            <select
              className={`h-9 w-full rounded-md border px-3 text-sm ${fieldErrors.employee_id ? 'border-red-400' : 'border-gray-200'}`}
              value={employeeId}
              onChange={(e) => {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.employee_id;
                  return next;
                });
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
            {fieldErrors.employee_id && (
              <span className="text-xs text-red-600">{fieldErrors.employee_id}</span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Leave Type</span>
            <select
              className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            >
              {LEAVE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {labelEnum(item)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">From Date *</span>
              <input
                type="date"
                className={`h-9 rounded-md border px-3 text-sm ${fieldErrors.start_date ? 'border-red-400' : 'border-gray-200'}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {fieldErrors.start_date && (
                <span className="text-xs text-red-600">{fieldErrors.start_date}</span>
              )}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">To Date *</span>
              <input
                type="date"
                className={`h-9 rounded-md border px-3 text-sm ${fieldErrors.end_date ? 'border-red-400' : 'border-gray-200'}`}
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {fieldErrors.end_date && (
                <span className="text-xs text-red-600">{fieldErrors.end_date}</span>
              )}
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Reason</span>
            <textarea
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe the reason for leave..."
              className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
