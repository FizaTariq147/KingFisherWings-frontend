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

export {
  OPERATIONS_COSTING_REPORT_FORMATS,
  getOperationsReportByFormatCode,
  operationsLiveReportPathForFormat,
} from '../config/operationsReports';
