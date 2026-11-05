import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import type { JobStatus } from '../constants/job.constants';

export interface JobDashboardCounts {
  byStatus: Partial<Record<JobStatus | string, number>>;
  bars: number[];
  /**
   * Headline total — same as GET /jobs meta.total for this user.
   * Prefer `job_count` from GET /jobs/dashboard-counts (alias of `total`).
   * Do not confuse with `open` (open-status bucket only).
   */
  jobCount: number;
  /** @deprecated Prefer jobCount — kept as alias for older callers. */
  active: number;
  inTransit: number;
  atOrigin: number;
  newJobs: number;
  customsHold: number;
  docsPending: number;
  /** Backend category counts — do not invent DELAYED as a status enum. */
  onHold: number;
  delayed: number;
  delivered: number;
  cancelled: number;
  completed: number;
  inProgress: number;
  /**
   * Open-status bucket only (enquiry…on hold). Can be much smaller than jobCount.
   * Never bind the “total jobs” card / badge to this.
   */
  open: number;
  createdInPeriod?: number;
  byJobType?: Record<string, number>;
  /**
   * Exact scope used by dashboard-counts (same as GET /jobs meta.visible_job_types).
   * `null` = admin / unrestricted; array = staff job-type ACL.
   */
  visibleJobTypes?: string[] | null;
  raw?: Record<string, unknown>;
}

export interface TeamWorkloadRow {
  userId?: string;
  name: string;
  openJobs: number;
  capacity?: number;
  utilizationPct?: number;
  slaPct?: number;
  raw?: Record<string, unknown>;
}

export type JobDashboardPeriodParams = ApiPeriodQuery & {
  branch_id?: string;
  job_type?: string;
};

export function jobDashboardQueryParams(params: JobDashboardPeriodParams = {}): Record<string, string> {
  const q = periodQueryParams(params);
  if (params.branch_id?.trim()) q.branch_id = params.branch_id.trim();
  if (params.job_type?.trim()) q.job_type = params.job_type.trim();
  return q;
}
