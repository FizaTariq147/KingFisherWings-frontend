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
