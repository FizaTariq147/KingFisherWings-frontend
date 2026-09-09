import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import type { JobStatus } from '../constants/job.constants';

export interface JobDashboardCounts {
  byStatus: Partial<Record<JobStatus | string, number>>;
  bars: number[];
  active: number;
  inTransit: number;
  atOrigin: number;
  newJobs: number;
  customsHold: number;
  docsPending: number;
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
