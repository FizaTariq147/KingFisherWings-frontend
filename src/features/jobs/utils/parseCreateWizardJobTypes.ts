import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';
import { JOB_TYPES, type JobType } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';

/**
 * Normalize create-wizard / documentation metadata payloads into writable JobTypes.
 * Accepts `{ writable_job_types }`, `{ services: [{ code|job_type }] }`, or a bare array.
 */
export function parseCreateWizardJobTypes(raw: unknown): JobType[] {
  const root = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const out = new Set<JobType>();

  const push = (value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) return;
    const canon = canonicalizeJobType(value);
    if ((JOB_TYPES as readonly string[]).includes(canon)) out.add(canon);
  };

  const writable = root.writable_job_types ?? root.writableJobTypes;
  if (Array.isArray(writable)) {
    for (const t of writable) push(t);
  }

  const services = root.services ?? root.job_types ?? root.jobTypes;
  if (Array.isArray(services)) {
    for (const row of services) {
      if (typeof row === 'string') {
        push(row);
        continue;
      }
      const rec = asRecord(row);
      if (!rec) continue;
      push(
        pickString(
          rec.code,
          rec.job_type,
          rec.jobType,
          rec.service_type,
          rec.serviceType,
          rec.value,
          rec.id,
        ),
      );
    }
  }

  if (Array.isArray(raw)) {
    for (const t of raw) push(t);
  }

  return [...out];
}
