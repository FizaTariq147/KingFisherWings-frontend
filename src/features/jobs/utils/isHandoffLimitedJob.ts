import type { Job } from '../types/job.types';

/**
 * Handoff-dept staff see a limited ops surface after department pass:
 * containers + assign trucker + port-token (not full costing / show_all).
 */
export function isHandoffLimitedJob(job: Pick<Job, 'actions' | 'view_mode'> | null | undefined): boolean {
  if (!job) return false;
  const mode = String(job.actions?.view_mode ?? job.view_mode ?? '')
    .trim()
    .toLowerCase();
  return mode === 'handoff_limited' || mode === 'handoff-limited';
}

/** CLOSED hard lock — mutations blocked except closed-overrides + reopen-request path. */
export function isJobHardClosed(job: Pick<Job, 'status'> | null | undefined): boolean {
  return String(job?.status ?? '').toUpperCase() === 'CLOSED';
}
