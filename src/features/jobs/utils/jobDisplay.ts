import { isUuid } from '@/lib/isUuid';
import type { Job } from '../types/job.types';

export function formatJobDate(value?: string): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return trimmed;
}

function displayName(value?: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed || isUuid(trimmed)) return '';
  return trimmed;
}

export function jobPartyLabel(
  job: Job,
  role: 'shipper' | 'consignee',
  partyMap?: Map<string, string>,
): string {
  if (role === 'shipper') {
    const fromName = displayName(job.shipper_name);
    if (fromName) return fromName;
    if (job.shipper_id && partyMap?.has(job.shipper_id)) return partyMap.get(job.shipper_id)!;
    return '—';
  }
  const fromName = displayName(job.consignee_name);
  if (fromName) return fromName;
  if (job.consignee_id && partyMap?.has(job.consignee_id)) {
    return partyMap.get(job.consignee_id)!;
  }
  return '—';
}

export function jobScheduleLabel(job: Job): string {
  return `${formatJobDate(job.etd)} / ${formatJobDate(job.eta)}`;
}

export function jobRouteLabel(job: Job): string {
  const origin =
    displayName(job.origin_port_code) ||
    displayName(job.origin_airport_code) ||
    displayName(job.sea_fcl_details?.place_of_receipt) ||
    displayName(job.sea_lcl_details?.place_of_receipt) ||
    '';
  const dest =
    displayName(job.dest_port_code) ||
    displayName(job.dest_airport_code) ||
    displayName(job.sea_fcl_details?.place_of_delivery) ||
    displayName(job.sea_lcl_details?.place_of_delivery) ||
    '';
  if (!origin && !dest) return '—';
  return `${origin || '—'} → ${dest || '—'}`;
}
