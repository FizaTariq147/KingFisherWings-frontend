import type { JobSegmentKey, JobType } from '../constants/job.constants';
import { JOB_SEGMENTS } from '../constants/job.constants';
import { jobShouldOpenOpsTab } from '../hooks/useStaffBookingForm';
import { canonicalizeJobType } from './canonicalizeJobType';

export function segmentFromPath(pathname: string): JobSegmentKey | null {
  if (pathname.startsWith('/jobs/air-export')) return 'air-export';
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
  if (normalized === 'CUSTOMS_CLEARANCE') return 'customs-clearance';
  if (normalized === 'ROAD_FREIGHT' || normalized === 'LAND' || normalized === 'COURIER') {
    return 'road-freight';
  }
  if (normalized === 'SEA_FCL_IMPORT' || normalized === 'SEA_LCL_IMPORT') return 'sea-import';
  if (normalized.startsWith('SEA_') || normalized === 'NVOCC_EXPORT') return 'sea-export';
  return 'air-export';
}

export function jobDetailPath(
  job: { id: string; job_type: JobType | string },
  opts?: { tab?: string },
): string {
  const jt = canonicalizeJobType(job.job_type);
  const base = `${jobRoutePrefix(segmentForJobType(jt))}/${job.id}`;
  if (opts?.tab) return `${base}?tab=${encodeURIComponent(opts.tab)}`;
  // After customer approve → convert: land on Ops so staff booking forms are visible.
  if (jobShouldOpenOpsTab(jt)) return `${base}?tab=ops`;
  return base;
}

export function jobDisplayNumber(job: { job_number?: string; id: string }): string {
  return job.job_number?.trim() || `Job ${job.id.slice(0, 8)}`;
}

export function jobEditable(status: string): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}
