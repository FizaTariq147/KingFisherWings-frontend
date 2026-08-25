import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { JobForm } from '../components/JobForm';
import {
  JOB_SEGMENTS,
  JOB_TYPE_WIZARD_OPTIONS,
  JOB_TYPES,
  type JobSegmentKey,
  type JobType,
} from '../constants/job.constants';
import { useCreateJob } from '../hooks/useJobs';
import type { CreateJobFormValues } from '../types/job.types';
import { jobDetailPath, jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';

function defaultTypeForSegment(segment: JobSegmentKey | null): JobType {
  if (!segment) return 'AIR_EXPORT';
  return JOB_SEGMENTS[segment].defaultCreateType;
}

function parseJobTypeParam(raw: string | null): JobType | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  return (JOB_TYPES as readonly string[]).includes(upper) ? (upper as JobType) : null;
}

export default function JobCreatePage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const segment = segmentFromPath(pathname);
  const isGenericCreate = pathname === '/jobs/new' || !segment;
  const create = useCreateJob();

  const queryType = parseJobTypeParam(searchParams.get('job_type'));
  const defaultJobType = queryType ?? defaultTypeForSegment(segment);

  const backPath = isGenericCreate ? '/dashboard' : jobRoutePrefix(segment!);
  const backLabel = isGenericCreate
    ? 'Back to dashboard'
    : `Back to ${JOB_SEGMENTS[segment!].label.toLowerCase()} jobs`;

  return (
    <div className="space-y-4">
      <PageBackLink to={backPath} label={backLabel} />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create job</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Select a job type, then shipper and shipment details. Milestones are seeded automatically
          for air and FCL exports.
        </p>
      </div>
      <JobForm
        mode="create"
        jobTypeOptions={JOB_TYPE_WIZARD_OPTIONS}
        defaultJobType={defaultJobType}
        isSubmitting={create.isPending}
        onCancel={() => navigate(backPath)}
        onSubmit={async (values) => {
          const created = await create.mutateAsync(values as CreateJobFormValues);
          navigate(jobDetailPath(created));
        }}
      />
    </div>
  );
}
