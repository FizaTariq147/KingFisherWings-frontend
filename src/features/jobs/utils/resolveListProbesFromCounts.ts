import type { JobType } from '../constants/job.constants';
import { canonicalizeJobType } from './canonicalizeJobType';

/**
 * Merge dashboard-counts `visible_job_types` with staff JWT/sidebar probes.
 *
 * Important: `visible_job_types: null` means admin **only when the user is already
 * unrestricted**. For staff, a null/missing counts field must NOT clear probes —
 * that disabled recovery and left grids empty while job_count stayed correct.
 */
export function resolveListProbesFromCounts(opts: {
  /** null = unrestricted admin from useVisibleJobListScope. */
  staffScopeTypes: JobType[] | null;
  staffProbeTypes: JobType[];
  /** From GET /jobs/dashboard-counts data.visible_job_types. */
  countVisible?: string[] | null;
}): {
  scopeTypes: JobType[] | null;
  probeTypes: JobType[];
} {
  const isStaff = opts.staffScopeTypes !== null;

  if (!isStaff) {
    return { scopeTypes: null, probeTypes: [] };
  }

  const staffProbes =
    opts.staffProbeTypes.length > 0
      ? opts.staffProbeTypes
      : Array.isArray(opts.staffScopeTypes)
        ? opts.staffScopeTypes
        : [];

  // Never treat counts null as admin for staff — keep JWT/sidebar probes.
  if (opts.countVisible === null || opts.countVisible === undefined) {
    return { scopeTypes: staffProbes, probeTypes: staffProbes };
  }

  if (Array.isArray(opts.countVisible) && opts.countVisible.length > 0) {
    const fromCount = [
      ...new Set(opts.countVisible.map((t) => canonicalizeJobType(String(t)))),
    ] as JobType[];
    // Union with staff probes so LAND/COURIER etc. are not lost if counts omit aliases.
    const merged = [...new Set([...fromCount, ...staffProbes])] as JobType[];
    return { scopeTypes: merged, probeTypes: merged };
  }

  // Explicit empty array from BE — still keep staff probes so recovery can run
  // when job_count > 0 (empty visible_job_types with positive count is a BE bug).
  return { scopeTypes: staffProbes, probeTypes: staffProbes };
}
