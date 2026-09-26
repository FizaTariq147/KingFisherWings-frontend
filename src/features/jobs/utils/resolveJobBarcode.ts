import type { Job } from '../types/job.types';
import { jobDisplayNumber } from '../utils/jobRoute';
import { normalizeCode128Value } from '../utils/scannableBarcode';

/** Prefer explicit barcode fields, then job number — always CODE128-safe. */
export function resolveJobBarcodeValue(job: Pick<
  Job,
  'barcode' | 'barcode_value' | 'job_number' | 'id' | 'courier_details'
>): string {
  const raw =
    job.barcode?.trim() ||
    job.barcode_value?.trim() ||
    job.courier_details?.barcode_value?.trim() ||
    job.job_number?.trim() ||
    job.id ||
    '';
  return normalizeCode128Value(raw);
}

export function jobBarcodeLabelTitle(job: Pick<Job, 'job_number' | 'id' | 'job_type'>): string {
  return jobDisplayNumber(job);
}
