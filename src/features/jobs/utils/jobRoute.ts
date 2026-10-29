import type { JobSegmentKey, JobType } from '../constants/job.constants';
import { JOB_SEGMENTS } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';

export function segmentFromPath(pathname: string): JobSegmentKey | null {
  if (pathname.startsWith('/jobs/air-export')) return 'air-export';
  if (pathname.startsWith('/jobs/air-import')) return 'air-import';
  if (pathname.startsWith('/jobs/sea-export')) return 'sea-export';
  if (pathname.startsWith('/jobs/sea-import')) return 'sea-import';
  if (pathname.startsWith('/jobs/customs-clearance')) return 'customs-clearance';
  if (pathname.startsWith('/jobs/road-freight')) return 'road-freight';
  return null;
}

export function jobRoutePrefix(segment: JobSegmentKey): string {
  return JOB_SEGMENTS[segment].routePrefix;
}

export function segmentForJobType(jobType: JobType | string): JobSegmentKey {
  const normalized = canonicalizeJobType(jobType);
  for (const [key, seg] of Object.entries(JOB_SEGMENTS) as Array<
    [JobSegmentKey, (typeof JOB_SEGMENTS)[JobSegmentKey]]
  >) {
    if (seg.jobTypes.includes(normalized)) return key;
  }
  if (normalized === 'AIR_IMPORT') return 'air-import';
  if (normalized === 'CUSTOMS_CLEARANCE') return 'customs-clearance';
  if (normalized === 'WAREHOUSE') return 'road-freight';
  if (normalized === 'ROAD_FREIGHT' || normalized === 'LAND' || normalized === 'COURIER') {
    return 'road-freight';
  }
  if (
    normalized === 'SEA_FCL_IMPORT' ||
    normalized === 'SEA_LCL_IMPORT' ||
    normalized === 'NVOCC_IMPORT'
  ) {
    return 'sea-import';
  }
  if (normalized.startsWith('SEA_') || normalized === 'NVOCC_EXPORT') return 'sea-export';
  return 'air-export';
}

export function jobDetailPath(
  job: { id: string; job_type: JobType | string },
  opts?: { tab?: string },
): string {
  const jt = canonicalizeJobType(job.job_type);
  const base = `${jobRoutePrefix(segmentForJobType(jt))}/${job.id}`;
  // Default opens Show All on JobDetailPage; pass opts.tab for deep-links (e.g. booking_form).
  if (opts?.tab) return `${base}?tab=${encodeURIComponent(opts.tab)}`;
  return base;
}

/**
 * User-facing job reference — always prefer job number over UUID.
 * Never show a bare UUID; fall back to a short "Job …" stub only when number is missing.
 */
export function jobDisplayNumber(job: {
  job_number?: string | null;
  jobNumber?: string | null;
  id?: string | null;
  job_id?: string | null;
}): string {
  const number = String(job.job_number ?? job.jobNumber ?? '').trim();
  if (number) return number;
  const id = String(job.id ?? job.job_id ?? '').trim();
  if (id) return `Job ${id.slice(0, 8)}`;
  return '—';
}

/** Resolve display text from either a number or an id-only link field. */
export function jobRefLabel(opts: {
  job_number?: string | null;
  jobNumber?: string | null;
  job_id?: string | null;
  jobId?: string | null;
}): string {
  return jobDisplayNumber({
    job_number: opts.job_number ?? opts.jobNumber,
    id: opts.job_id ?? opts.jobId,
  });
}

export function jobEditable(status: string): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}
