import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { jobKeys, useCreateJob } from '../hooks/useJobs';
import type { CreateJobFormValues } from '../types/job.types';
import type { JobWizardCostingPayload } from '../types/jobWizardCosting.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobDetailPath, jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';
import { persistJobWizardCosting } from '../utils/persistJobWizardCosting';

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
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const segment = segmentFromPath(pathname);
  const isGenericCreate = pathname === '/jobs/new' || !segment;
  const create = useCreateJob();
  const [persistingCosting, setPersistingCosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryType = parseJobTypeParam(searchParams.get('job_type'));
  const defaultJobType =
    queryType ?? (isGenericCreate ? 'SERVICE_JOB' : defaultTypeForSegment(segment));

  const backPath = isGenericCreate ? '/dashboard' : jobRoutePrefix(segment!);
  const backLabel = isGenericCreate
    ? 'Back to dashboard'
    : `Back to ${JOB_SEGMENTS[segment!].label.toLowerCase()} jobs`;

  return (
    <div className="space-y-4">
      <PageBackLink to={backPath} label={backLabel} />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create Job</h2>
      </div>
      {error ? (
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
      ) : null}
      <JobForm
        mode="create"
        layout="wizard"
        jobTypeOptions={JOB_TYPE_WIZARD_OPTIONS}
        defaultJobType={defaultJobType}
        isSubmitting={create.isPending || persistingCosting}
        onCancel={() => navigate(backPath)}
        onSubmit={async (values, options) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateJobFormValues);
            const costing = options?.costing as JobWizardCostingPayload | undefined;
            let target = created;
            let costingWarnings: string[] | undefined;

            if (costing?.charges.length) {
              setPersistingCosting(true);
              try {
                const { job, warnings } = await persistJobWizardCosting(created.id, costing);
                target = job;
                queryClient.setQueryData(jobKeys.detail(job.id), job);
                void queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) });
                if (warnings.length) costingWarnings = warnings;
              } finally {
                setPersistingCosting(false);
              }
            }

            navigate(jobDetailPath(target), {
              state: costingWarnings?.length ? { costingWarnings } : undefined,
            });
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
