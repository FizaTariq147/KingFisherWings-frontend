/**
 * Conformance status for the pixel-exact pipeline.
 * Values come from reports/status.json, which is generated from reports/signoff.csv.
 * A code is accepted only when that file says so. Nothing in this module grants acceptance.
 */
import statuses from '../../../../reports/status.json' with { type: 'json' };

export type ReportConformanceStatus = 'accepted' | 'in_progress' | 'reference_only';

const STATUS = statuses as Record<string, ReportConformanceStatus>;

export function reportConformanceStatus(code: string): ReportConformanceStatus {
  const value = STATUS[code.trim().toUpperCase()];
  if (value === 'accepted' || value === 'in_progress' || value === 'reference_only') return value;
  return 'reference_only';
}

export function reportConformanceLabel(status: ReportConformanceStatus): string {
  if (status === 'accepted') return 'Accepted';
  if (status === 'in_progress') return 'In progress';
  return 'Reference only';
}
