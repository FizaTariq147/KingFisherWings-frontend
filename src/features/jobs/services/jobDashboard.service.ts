import {
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  type JobStatus,
  type JobType,
} from '../constants/job.constants';
import type { Job } from '../types/job.types';
import { jobDisplayNumber } from '../utils/jobRoute';
import { jobService } from './job.service';

const CLOSED_STATUSES: JobStatus[] = ['COMPLETED', 'CANCELLED'];

const AIR_EXPORT_TYPES: JobType[] = ['AIR_EXPORT'];
const SEA_EXPORT_TYPES: JobType[] = ['SEA_FCL_EXPORT', 'SEA_LCL_EXPORT', 'NVOCC_EXPORT'];
const SEA_IMPORT_TYPES: JobType[] = ['SEA_FCL_IMPORT', 'SEA_LCL_IMPORT', 'NVOCC_IMPORT'];

const DASHBOARD_SAMPLE_LIMIT = 120;

function isOpenJob(job: Job): boolean {
  return !CLOSED_STATUSES.includes(job.status);
}

function jobEtd(job: Job): string | undefined {
  return job.etd?.trim() || job.sea_fcl_details?.etd?.trim() || undefined;
}

function modeBucket(jobType: JobType): 'Air Export' | 'Sea Export' | 'Sea Import' | 'Road' | 'Other' {
  if (jobType.startsWith('AIR_')) return 'Air Export';
  if (SEA_EXPORT_TYPES.includes(jobType)) return 'Sea Export';
  if (SEA_IMPORT_TYPES.includes(jobType)) return 'Sea Import';
  if (jobType === 'LAND') return 'Road';
  return 'Other';
}

async function fetchJobSample(limit = DASHBOARD_SAMPLE_LIMIT): Promise<Job[]> {
  const { jobs } = await jobService.list({ page: 1, limit, order: 'desc' });
  return jobs;
}

export interface OpenJobsSummary {
  total: number;
  airExport: number;
  seaExport: number;
  seaImport: number;
}

export interface ShipmentsByModeSummary {
  total: number;
  breakdown: { mode: string; count: number; percent: number }[];
}

export interface RecentJobRow {
  jobNumber: string;
  customer: string;
  mode: string;
  status: string;
  createdAt: string;
}

export interface UpcomingEtdRow {
  jobNumber: string;
  vessel: string;
  etd: string;
  pol: string;
  pod: string;
}

export async function fetchOpenJobsSummary(): Promise<OpenJobsSummary> {
  const jobs = (await fetchJobSample()).filter(isOpenJob);
  return {
    total: jobs.length,
    airExport: jobs.filter((j) => AIR_EXPORT_TYPES.includes(j.job_type)).length,
    seaExport: jobs.filter((j) => SEA_EXPORT_TYPES.includes(j.job_type)).length,
    seaImport: jobs.filter((j) => SEA_IMPORT_TYPES.includes(j.job_type)).length,
  };
}

export async function fetchShipmentsByModeSummary(): Promise<ShipmentsByModeSummary> {
  const jobs = await fetchJobSample();
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const bucket = modeBucket(job.job_type);
    if (bucket === 'Other') continue;
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  const total = jobs.length;
  const breakdown = ['Air Export', 'Sea Export', 'Sea Import', 'Road']
    .map((mode) => {
      const count = counts.get(mode) ?? 0;
      return {
        mode,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .filter((row) => row.count > 0);
  return { total, breakdown };
}

export async function fetchRecentJobs(limit = 5): Promise<RecentJobRow[]> {
  const { jobs } = await jobService.list({ page: 1, limit, order: 'desc' });
  return jobs.map((job) => ({
    jobNumber: jobDisplayNumber(job),
    customer: job.shipper_name?.trim() || job.consignee_name?.trim() || '—',
    mode: JOB_TYPE_LABELS[job.job_type] ?? job.job_type,
    status: JOB_STATUS_LABELS[job.status] ?? job.status,
    createdAt: job.created_at ?? '',
  }));
}

export async function fetchUpcomingEtds(days = 7, limit = 8): Promise<UpcomingEtdRow[]> {
  const jobs = await fetchJobSample();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + days);

  return jobs
    .map((job) => {
      const etdRaw = jobEtd(job);
      if (!etdRaw) return null;
      const etdDate = new Date(etdRaw.slice(0, 10));
      if (Number.isNaN(etdDate.getTime())) return null;
      if (etdDate < now || etdDate > end) return null;
      return {
        jobNumber: jobDisplayNumber(job),
        vessel:
          job.sea_fcl_details?.voyage_number?.trim() ||
          job.sea_fcl_details?.booking_reference?.trim() ||
          '—',
        etd: etdRaw.slice(0, 10),
        pol: job.origin_port_code || '—',
        pod: job.dest_port_code || '—',
      };
    })
    .filter((row): row is UpcomingEtdRow => Boolean(row))
    .sort((a, b) => a.etd.localeCompare(b.etd))
    .slice(0, limit);
}
