import type { SavedReportType } from '@/features/glSavedReports/constants/savedReport.constants';

export type ReportHubId =
  | 'receivables-aging'
  | 'lane-profitability'
  | 'operator-productivity'
  | 'customs-delay'
  | 'monthly-volume';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'custom';
export type ReportFormat = 'PDF' | 'XLSX' | 'CSV';

export function reportPeriodRange(period: ReportPeriod): { from: string; to: string } | null {
  const end = new Date();
  const to = end.toISOString().slice(0, 10);
  if (period === 'week') {
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { from: start.toISOString().slice(0, 10), to };
  }
  if (period === 'month') {
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { from: start.toISOString().slice(0, 10), to };
  }
  if (period === 'quarter') {
    const qStartMonth = Math.floor(end.getMonth() / 3) * 3;
    const start = new Date(end.getFullYear(), qStartMonth, 1);
    return { from: start.toISOString().slice(0, 10), to };
  }
  return null;
}

/** Map saved-report types to runnable GL/CRM paths (shared with saved report detail). */
export function savedReportRunPath(reportType: SavedReportType | string): string | null {
  switch (reportType) {
    case 'BALANCE_SHEET':
    case 'PROFIT_AND_LOSS':
    case 'CASH_FLOW':
    case 'TRIAL_BALANCE':
    case 'VAT_RETURN':
      return '/gl/reports';
    case 'AR_AGING':
      return '/gl/ar/aging';
    case 'AP_AGING':
      return '/gl/ap/aging';
    case 'MIS_DASHBOARD':
    case 'JOB_PROFITABILITY':
      return '/gl/mis/dashboard';
    default:
      return null;
  }
}

export function buildReportGeneratePath(
  reportId: ReportHubId,
  period: ReportPeriod,
  format: ReportFormat,
): string {
  if (period === 'custom') return '/gl/saved-reports';

  const range = reportPeriodRange(period);
  const params = new URLSearchParams();
  params.set('format', format.toLowerCase());

  switch (reportId) {
    case 'receivables-aging':
      if (range) params.set('as_of', range.to);
      return `/gl/ar/aging?${params}`;
    case 'lane-profitability':
      if (range) {
        params.set('from', range.from);
        params.set('to', range.to);
      }
      return `/sales/sales-dashboard?${params}`;
    case 'operator-productivity':
      if (range) {
        params.set('from_date', range.from);
        params.set('to_date', range.to);
      }
      return `/gl/mis/dashboard?${params}`;
    case 'customs-delay':
      params.set('status', 'CUSTOMS_CLEARANCE');
      if (range) {
        params.set('from_date', range.from);
        params.set('to_date', range.to);
      }
      return `/jobs/sea-import?${params}`;
    case 'monthly-volume':
      if (range) {
        params.set('from_date', range.from);
        params.set('to_date', range.to);
      }
      return `/gl/mis/dashboard?${params}`;
    default:
      return '/gl/reports';
  }
}
