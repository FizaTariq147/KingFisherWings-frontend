import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { JobForm } from '../components/JobForm';
import { JOB_SEGMENTS, JOB_TYPE_WIZARD_OPTIONS, type JobSegmentKey } from '../constants/job.constants';
import { useJob, useUpdateJob } from '../hooks/useJobs';
import type { UpdateJobFormValues } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';
import { jobToFormValues } from '../utils/prepareJobPayload';

export default function JobEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segment = (segmentFromPath(pathname) ?? 'air-export') as JobSegmentKey;
  const segmentConfig = JOB_SEGMENTS[segment];
  const prefix = jobRoutePrefix(segment);
  const { data: job, isLoading, isError, error } = useJob(id);
  const update = useUpdateJob(id);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !job) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Job not found.'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <PageBackLink to={`${prefix}/${id}`} label="Back to job" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit job</h2>
      </div>
      {saveError && (
        <div role="alert" className="text-sm text-[var(--color-danger-600)]">
          {saveError}
        </div>
      )}
      <JobForm
        mode="edit"
        jobTypeOptions={
          JOB_TYPE_WIZARD_OPTIONS.includes(job.job_type)
            ? JOB_TYPE_WIZARD_OPTIONS
            : [...JOB_TYPE_WIZARD_OPTIONS, job.job_type]
        }
        defaultValues={jobToFormValues(job)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${prefix}/${id}`)}
        onSubmit={async (values) => {
          setSaveError(null);
          try {
            await update.mutateAsync(values as UpdateJobFormValues);
            navigate(`${prefix}/${id}`);
          } catch (err) {
            setSaveError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
