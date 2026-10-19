import type { OperationsReportKey } from '../types/operations.types';

/**
 * Live Operations reports (OpenAPI `/operations/*`) and their FRESA format codes
 * used by `POST …/download` and the Reports catalogue.
 */
export type OperationsReportDef = {
  key: OperationsReportKey;
  title: string;
  description: string;
  path: string;
  /** Format code for XLSX download / catalogue deep-link (voyage has list API only). */
  formatCode?: string;
  hasDownload: boolean;
};

export const OPERATIONS_REPORTS: readonly OperationsReportDef[] = [
  {
    key: 'job-not-invoiced-do',
    title: 'Job not invoiced (DO)',
    description: 'DO-released jobs with uninvoiced sale charges and aging.',
    path: '/operations/reports/job-not-invoiced-do',
    formatCode: 'AR_JOB_NOT_INVOICE_REPORT_FORMAT',
    hasDownload: true,
  },
  {
    key: 'job-finance-report',
    title: 'Job finance by shipment date',
    description: 'Revenue, cost, GP and uninvoiced sale by shipment / job date.',
    path: '/operations/reports/job-finance-report',
    formatCode: 'JOB_FINANCE_BY_SHIPMENT_DATE_REPORT_FORMAT',
    hasDownload: true,
  },
  {
    key: 'exceptions',
    title: 'Exceptions',
    description: 'ATD without BL, missing ATA, DO uninvoiced, overdue close, and more.',
    path: '/operations/reports/exceptions',
    formatCode: 'EXCEPTION_REPORT_FORMAT',
    hasDownload: true,
  },
  {
    key: 'kpi-status',
    title: 'KPI status',
    description: 'Jobs in range with KPI completion flags.',
    path: '/operations/reports/kpi-status',
    formatCode: 'KPI_STATUS_BY_COMPLETED_DATE_REPORT_FORMAT',
    hasDownload: true,
  },
  {
    key: 'job-list-summary',
    title: 'Job list summary',
    description: 'Summary columns with chargeable units; job / shipment / voucher date basis.',
    path: '/operations/reports/job-list-summary',
    formatCode: 'JOB_LIST_SUMMARY_REPORT_FORMAT',
    hasDownload: true,
  },
  {
    key: 'voyage-jobs-shipments',
    title: 'Voyage jobs & shipments',
    description: 'Combined job + shipment list filtered by voyage / vessel.',
    path: '/operations/reports/voyage-jobs-shipments',
    hasDownload: false,
  },
  {
    key: 'closed-job-report',
    title: 'Closed job report',
    description: 'Closed jobs in the selected date window.',
    path: '/operations/reports/closed-job-report',
    formatCode: 'CLOSED_JOB_LIST_REPORT_FORMAT',
    hasDownload: true,
  },
] as const;

const BY_FORMAT = new Map(
  OPERATIONS_REPORTS.filter((r) => r.formatCode).map((r) => [
    r.formatCode!.toUpperCase(),
    r,
  ]),
);

const BY_KEY = new Map(OPERATIONS_REPORTS.map((r) => [r.key, r]));

/** Format codes that download via OpenAPI POST /operations/.../download. */
export const OPERATIONS_COSTING_REPORT_FORMATS = OPERATIONS_REPORTS.filter(
  (r) => r.formatCode,
).map((r) => r.formatCode!) as readonly string[];

export function getOperationsReportByKey(
  key: string,
): OperationsReportDef | undefined {
  return BY_KEY.get(key as OperationsReportKey);
}

/** Map a FRESA format code to the live Operations report screen. */
export function getOperationsReportByFormatCode(
  code: string,
): OperationsReportDef | undefined {
  return BY_FORMAT.get(code.trim().toUpperCase());
}

export function operationsLiveReportPathForFormat(code: string): string | null {
  return getOperationsReportByFormatCode(code)?.path ?? null;
}
