/** Operations module REST paths (OpenAPI). */
export const OPERATIONS_API = {
  importCargoDelivery: '/operations/import-cargo-delivery',
  importCargoDeliveryByJob: (jobId: string) =>
    `/operations/import-cargo-delivery/${encodeURIComponent(jobId)}`,
  dashboard: '/operations/dashboard',
  closedJobReport: '/operations/closed-job-report',
  closedJobReportDownload: '/operations/closed-job-report/download',
  /** Waves 1–3 finance / ops reports on top of costing */
  jobNotInvoicedDo: '/operations/job-not-invoiced-do',
  jobNotInvoicedDoDownload: '/operations/job-not-invoiced-do/download',
  jobFinanceReport: '/operations/job-finance-report',
  jobFinanceReportDownload: '/operations/job-finance-report/download',
  exceptions: '/operations/exceptions',
  exceptionsDownload: '/operations/exceptions/download',
  kpiStatus: '/operations/kpi-status',
  kpiStatusDownload: '/operations/kpi-status/download',
  jobListSummary: '/operations/job-list-summary',
  jobListSummaryDownload: '/operations/job-list-summary/download',
  voyageJobsShipments: '/operations/voyage-jobs-shipments',
} as const;

/** Report format codes for POST /reports/generate (Waves 1–3 costing parity). */
export const OPERATIONS_COSTING_REPORT_FORMATS = [
  'AR_JOB_NOT_INVOICE_REPORT_FORMAT',
  'JOB_FINANCE_BY_SHIPMENT_DATE_REPORT_FORMAT',
  'EXCEPTION_REPORT_FORMAT',
  'KPI_STATUS_BY_COMPLETED_DATE_REPORT_FORMAT',
  'JOB_LIST_SUMMARY_REPORT_FORMAT',
] as const;

export type OperationsCostingReportFormat =
  (typeof OPERATIONS_COSTING_REPORT_FORMATS)[number];
