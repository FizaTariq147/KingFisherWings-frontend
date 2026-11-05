import type { JobType } from '../constants/job.constants';
import type { Job } from '../types/job.types';
import { canonicalizeJobType } from './canonicalizeJobType';

/** Infer job_type from numbers like JOB/FI/11/26/00004 when list payload omits/mis-labels type. */
export function inferJobTypeFromJobNumber(jobNumber?: string): JobType | undefined {
  const n = String(jobNumber ?? '')
    .trim()
    .toUpperCase();
  if (!n) return undefined;
  if (n.includes('/FI/') || n.includes('-FI-')) return 'SEA_FCL_IMPORT';
  if (n.includes('/FE/') || n.includes('-FE-')) return 'SEA_FCL_EXPORT';
  if (n.includes('/LI/') || n.includes('-LI-')) return 'SEA_LCL_IMPORT';
  if (n.includes('/LE/') || n.includes('-LE-')) return 'SEA_LCL_EXPORT';
  if (n.includes('/AE/') || n.includes('-AE-')) return 'AIR_EXPORT';
  if (n.includes('/AI/') || n.includes('-AI-')) return 'AIR_IMPORT';
  if (n.includes('/RF/') || n.includes('-RF-')) return 'ROAD_FREIGHT';
  if (n.includes('/CC/') || n.includes('-CC-')) return 'CUSTOMS_CLEARANCE';
  if (n.includes('/NV/') || n.includes('-NV-')) return 'NVOCC_EXPORT';
  if (n.includes('/CR/') || n.includes('-CR-')) return 'COURIER';
  return undefined;
}

/**
 * Prefer job-number mid-code when normalize defaulted to AIR_EXPORT or type is missing.
 * Used so staff department / Active shipments filters do not drop Sea/Road rows.
 */
export function effectiveJobListType(job: Pick<Job, 'job_type' | 'job_number'>): JobType {
  const fromNumber = inferJobTypeFromJobNumber(job.job_number);
  const fromField = canonicalizeJobType(String(job.job_type ?? ''));
  if (fromNumber && (fromField === 'AIR_EXPORT' || !job.job_type)) return fromNumber;
  if (fromNumber && fromField !== fromNumber) return fromNumber;
  return fromField;
}
