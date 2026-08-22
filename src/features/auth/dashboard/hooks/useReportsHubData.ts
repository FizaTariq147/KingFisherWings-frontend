import { useMemo } from 'react';
import { useArAging } from '@/features/arApAging/hooks/useArApAging';
import { useOverdueInvoices } from '@/features/invoices/hooks/useInvoices';
import { useSavedReports } from '@/features/glSavedReports/hooks/useSavedReports';
import { SAVED_REPORT_TYPE_LABELS } from '@/features/glSavedReports/constants/savedReport.constants';
import type { SavedReport } from '@/features/glSavedReports/types/savedReport.types';
import { useMisOperational } from '@/features/glMisDashboard/hooks/useGlMis';
import { useCrmReportQuery } from './useCrmReportQuery';
import { useDashboardJobCounts } from './useDashboardJobCounts';
import { isoDate, pickString } from '../utils/dashboardFormat';

export type ReportsHubStats = {
  receivablesCount: number;
  laneCount: number;
  operatorCount: number;
  customsHolds: number;
  jobCount: number;
};

export type ScheduledReportItem = {
  id: string;
  name: string;
  type: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  subtitle: string;
};

function quarterRange(now = new Date()) {
  const to = isoDate(now);
  const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const start = new Date(now.getFullYear(), qStartMonth, 1);
  return { from: isoDate(start), to };
}

function tradeLaneRange(now = new Date()) {
  const end = new Date(now);
  const start = new Date(end);
  start.setDate(end.getDate() - 89);
  return { from: isoDate(start), to: isoDate(end) };
}

function countOperators(rows: Record<string, unknown>[]): number {
  const keys = new Set<string>();
  for (const row of rows) {
    const id =
      pickString(row, ['operator_id', 'user_id', 'ops_user_id', 'employee_id']) ??
      pickString(row, ['operator', 'operator_name', 'user', 'user_name']);
    if (id) keys.add(id);
  }
  return keys.size;
}

function normalizeReportFormat(raw: unknown): 'PDF' | 'XLSX' | 'CSV' {
  const value = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  if (value === 'XLSX' || value === 'CSV' || value === 'PDF') return value;
  return 'PDF';
}

function scheduledSubtitle(report: SavedReport): string {
  const filters = report.filters ?? {};
  const schedule =
    pickString(filters, ['schedule', 'schedule_label', 'frequency', 'cron_label']) ?? '';
  const time = pickString(filters, ['time', 'delivery_time', 'at', 'run_at']) ?? '';
  const email =
    pickString(filters, ['email', 'delivery_email', 'mailbox', 'recipient', 'to_email']) ?? '';

  const parts: string[] = [];
  if (schedule) parts.push(schedule);
  if (time && email) parts.push(`${time} · ${email}`);
  else if (email) parts.push(email);
  else if (time) parts.push(time);

  if (parts.length) return parts.join(' · ');
  if (report.description?.trim()) return report.description.trim();
  if (report.is_shared) {
    return `Shared · ${SAVED_REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}`;
  }
  return `${SAVED_REPORT_TYPE_LABELS[report.report_type] ?? report.report_type} · Saved report`;
}

export function useReportsHubData() {
  const today = isoDate(new Date());
  const laneRange = useMemo(() => tradeLaneRange(), []);
  const opsRange = useMemo(() => quarterRange(), []);

  const agingQuery = useArAging({ as_of: today });
  const overdueQuery = useOverdueInvoices();
  const tradeLaneQuery = useCrmReportQuery('trade_lane', laneRange);
  const operationalQuery = useMisOperational({
    from_date: opsRange.from,
    to_date: opsRange.to,
  });
  const jobCountsQuery = useDashboardJobCounts();
  const savedReportsQuery = useSavedReports();

  const stats = useMemo((): ReportsHubStats => {
    const agingLines = agingQuery.data?.lines ?? [];
    const overdueCount = overdueQuery.data?.length ?? 0;
    const receivablesCount =
      agingLines.filter((line) => (line.total ?? 0) > 0).length || overdueCount;
    const opsRows = operationalQuery.data?.rows ?? [];
    const operatorCount = countOperators(opsRows);

    return {
      receivablesCount,
      laneCount: tradeLaneQuery.data?.rows.length ?? 0,
      operatorCount,
      customsHolds:
        (jobCountsQuery.data?.customsHold ?? 0) + (jobCountsQuery.data?.docsPending ?? 0),
      jobCount: jobCountsQuery.data?.active ?? 0,
    };
  }, [
    agingQuery.data,
    overdueQuery.data,
    tradeLaneQuery.data,
    operationalQuery.data,
    jobCountsQuery.data,
  ]);

  const scheduled = useMemo((): ScheduledReportItem[] => {
    const items = [...(savedReportsQuery.data ?? [])].sort((a, b) => {
      const aTs = Date.parse(a.updated_at || a.created_at || '0');
      const bTs = Date.parse(b.updated_at || b.created_at || '0');
      return bTs - aTs;
    });

    return items.slice(0, 3).map((report) => ({
      id: report.id,
      name: report.name,
      type: SAVED_REPORT_TYPE_LABELS[report.report_type] ?? report.report_type,
      format: normalizeReportFormat(report.filters?.format ?? report.filters?.export_format),
      subtitle: scheduledSubtitle(report),
    }));
  }, [savedReportsQuery.data]);

  const isLoading =
    agingQuery.isLoading ||
    overdueQuery.isLoading ||
    tradeLaneQuery.isLoading ||
    operationalQuery.isLoading ||
    jobCountsQuery.isLoading;

  const isError =
    agingQuery.isError &&
    overdueQuery.isError &&
    tradeLaneQuery.isError &&
    operationalQuery.isError &&
    jobCountsQuery.isError;

  return {
    stats,
    scheduled,
    isLoading,
    isError,
    isScheduledLoading: savedReportsQuery.isLoading,
    isScheduledError: savedReportsQuery.isError,
  };
}
