/** Operations module REST paths (OpenAPI). */
export const OPERATIONS_API = {
  importCargoDelivery: '/operations/import-cargo-delivery',
  importCargoDeliveryByJob: (jobId: string) =>
    `/operations/import-cargo-delivery/${encodeURIComponent(jobId)}`,
  dashboard: '/operations/dashboard',
  closedJobReport: '/operations/closed-job-report',
  closedJobReportDownload: '/operations/closed-job-report/download',
} as const;
