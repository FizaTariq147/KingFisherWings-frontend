import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { JobForm } from '../components/JobForm';
import {
  JOB_SEGMENTS,
  JOB_TYPE_WIZARD_OPTIONS,
  type JobSegmentKey,
  type JobType,
} from '../constants/job.constants';
import { useCreateJob } from '../hooks/useJobs';
import type { CreateJobFormValues } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobDetailPath, jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';

function defaultTypeForSegment(segment: JobSegmentKey | null): JobType {
  if (!segment) return 'AIR_EXPORT';
  return JOB_SEGMENTS[segment].defaultCreateType;
}

export default function JobCreatePage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segment = segmentFromPath(pathname);
  const isGenericCreate = pathname === '/jobs/new' || !segment;
  const create = useCreateJob();
  const [error, setError] = useState<string | null>(null);

  const backPath = isGenericCreate ? '/dashboard' : jobRoutePrefix(segment!);
  const backLabel = isGenericCreate
    ? 'Back to dashboard'
    : `Back to ${JOB_SEGMENTS[segment!].label.toLowerCase()} jobs`;

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(backPath)}
      >
        ← {backLabel}
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create job</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Select a job type, then shipper and shipment details. Milestones are seeded automatically
          for air and FCL exports.
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}
      <JobForm
        mode="create"
        jobTypeOptions={JOB_TYPE_WIZARD_OPTIONS}
        defaultJobType={defaultTypeForSegment(segment)}
        isSubmitting={create.isPending}
        onCancel={() => navigate(backPath)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateJobFormValues);
            navigate(jobDetailPath(created));
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
