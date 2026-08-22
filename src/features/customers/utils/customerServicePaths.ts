import type { JobType } from '@/features/jobs/constants/job.constants';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';

export const CUSTOMER_SERVICE_PATHS = {
  createJob: '/jobs/new',
  createSeaExportJob: '/jobs/sea-export/new',
  createEnquiry: '/sales/enquiries/new',
  enquiryDetail: (id: string) => `/sales/enquiries/${id}`,
} as const;

export function customerJobDetailPath(job: { id: string; jobType: JobType }): string {
  return jobDetailPath({ id: job.id, job_type: job.jobType });
}
