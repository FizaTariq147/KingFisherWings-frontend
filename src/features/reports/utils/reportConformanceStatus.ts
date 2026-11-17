/**
 * Conformance status for the pixel-exact pipeline.
 * Nothing is accepted until the verification harness and a sign-off both exist.
 */
export type ReportConformanceStatus = 'accepted' | 'in_progress' | 'reference_only';

const IN_PROGRESS = new Set([
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'FCL_QUOTATION_REPORT_FORMAT',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT',
]);

export function reportConformanceStatus(code: string): ReportConformanceStatus {
  const key = code.trim().toUpperCase();
  if (IN_PROGRESS.has(key)) return 'in_progress';
  return 'reference_only';
}

export function reportConformanceLabel(status: ReportConformanceStatus): string {
  if (status === 'accepted') return 'Accepted';
  if (status === 'in_progress') return 'In progress';
  return 'Reference only';
}
