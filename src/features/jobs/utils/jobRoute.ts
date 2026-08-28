import type { JobSegmentKey, JobType } from '../constants/job.constants';
import { JOB_SEGMENTS } from '../constants/job.constants';

export function segmentFromPath(pathname: string): JobSegmentKey | null {
  if (pathname.startsWith('/jobs/air-export')) return 'air-export';
  if (pathname.startsWith('/jobs/sea-export')) return 'sea-export';
  if (pathname.startsWith('/jobs/sea-import')) return 'sea-import';
  return null;
}

export function jobRoutePrefix(segment: JobSegmentKey): string {
  return JOB_SEGMENTS[segment].routePrefix;
}

export function segmentForJobType(jobType: JobType): JobSegmentKey {
  for (const [key, seg] of Object.entries(JOB_SEGMENTS) as Array<
    [JobSegmentKey, (typeof JOB_SEGMENTS)[JobSegmentKey]]
  >) {
    if (seg.jobTypes.includes(jobType)) return key;
  }
  // Non-segment types (SERVICE_JOB, LAND, COURIER, …) — detail page loads by id.
  if (jobType === 'SEA_FCL_IMPORT' || jobType === 'SEA_LCL_IMPORT') return 'sea-import';
  if (jobType.startsWith('SEA_') || jobType === 'NVOCC_EXPORT') return 'sea-export';
  return 'air-export';
}

export function jobDetailPath(job: { id: string; job_type: JobType }): string {
  return `${jobRoutePrefix(segmentForJobType(job.job_type))}/${job.id}`;
}

export function jobDisplayNumber(job: { job_number?: string; id: string }): string {
  return job.job_number?.trim() || `Job ${job.id.slice(0, 8)}`;
}

export function jobEditable(status: string): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}
