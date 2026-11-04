import { JOB_TYPES, type JobType } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';

/**
 * Ops visibility from /auth/me (after matrix save + re-login).
 * - `null` / `undefined` → unrestricted (legacy / no matrix) — do not send job_types
 * - `[]` → locked — no ops jobs
 * - non-empty → only these canonical job types
 */
export function normalizeVisibleJobTypeScope(
  visibleJobTypes: string[] | null | undefined,
): { kind: 'unrestricted' } | { kind: 'locked' } | { kind: 'scoped'; types: JobType[] } {
  if (visibleJobTypes === null || visibleJobTypes === undefined) {
    return { kind: 'unrestricted' };
  }
  if (!visibleJobTypes.length) {
    return { kind: 'locked' };
  }
  const types = [
    ...new Set(
      visibleJobTypes
        .map((t) => canonicalizeJobType(t))
        .filter((t) => (JOB_TYPES as readonly string[]).includes(t)),
    ),
  ] as JobType[];
  if (!types.length) return { kind: 'locked' };
  return { kind: 'scoped', types };
}

/** Whether a section job_type is allowed for list/open. */
export function canSeeJobTypeInScope(
  jobType: string | null | undefined,
  visibleJobTypes: string[] | null | undefined,
): boolean {
  const scope = normalizeVisibleJobTypeScope(visibleJobTypes);
  if (scope.kind === 'unrestricted') return true;
  if (scope.kind === 'locked') return false;
  return scope.types.includes(canonicalizeJobType(jobType ?? ''));
}
