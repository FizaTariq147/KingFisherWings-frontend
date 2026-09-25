import type { Job } from '../types/job.types';
import { jobDisplayNumber } from '../utils/jobRoute';

/** Prefer explicit barcode fields, then job number (typical CODE128 payload). */
export function resolveJobBarcodeValue(job: Pick<
  Job,
  'barcode' | 'barcode_value' | 'job_number' | 'id' | 'courier_details'
>): string {
  return (
    job.barcode?.trim() ||
    job.barcode_value?.trim() ||
    job.courier_details?.barcode_value?.trim() ||
    job.job_number?.trim() ||
    job.id
  );
}

export function jobBarcodeLabelTitle(job: Pick<Job, 'job_number' | 'id' | 'job_type'>): string {
  return jobDisplayNumber(job);
}
