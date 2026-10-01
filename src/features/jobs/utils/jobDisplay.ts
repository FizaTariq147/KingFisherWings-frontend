import type { Job } from '../types/job.types';

export function formatJobDate(value?: string): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return trimmed;
}

export function jobPartyLabel(job: Job, role: 'shipper' | 'consignee'): string {
  if (role === 'shipper') return job.shipper_name?.trim() || '—';
  return job.consignee_name?.trim() || '—';
}

export function jobScheduleLabel(job: Job): string {
  return `${formatJobDate(job.etd)} / ${formatJobDate(job.eta)}`;
}

export function jobRouteLabel(job: Job): string {
  const origin =
    job.origin_port_code?.trim() ||
    job.origin_airport_code?.trim() ||
    job.sea_fcl_details?.place_of_receipt?.trim() ||
    job.sea_lcl_details?.place_of_receipt?.trim() ||
    '';
  const dest =
    job.dest_port_code?.trim() ||
    job.dest_airport_code?.trim() ||
    job.sea_fcl_details?.place_of_delivery?.trim() ||
    job.sea_lcl_details?.place_of_delivery?.trim() ||
    '';
  if (!origin && !dest) return '—';
  return `${origin || '—'} → ${dest || '—'}`;
}
