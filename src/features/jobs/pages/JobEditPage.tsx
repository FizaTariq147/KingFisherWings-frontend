import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import {
  isOpsUnrestrictedRole,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions';
import { JobForm } from '../components/JobForm';
import {
  JOB_TYPE_WIZARD_OPTIONS,
  type JobSegmentKey,
  type JobType,
} from '../constants/job.constants';
import { useJob, useUpdateJob } from '../hooks/useJobs';
import type { UpdateJobFormValues } from '../types/job.types';
import { filterJobTypesByStaffAccess } from '../utils/filterJobTypesByStaffAccess';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';
import { jobToFormValues } from '../utils/prepareJobPayload';

export default function JobEditPage() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const { user, hasRole, hasEnabledModule } = useAuth();
  const segment = (segmentFromPath(pathname) ?? 'air-export') as JobSegmentKey;
  const prefix = jobRoutePrefix(segment);
  const detailPath = `${prefix}/${id}`;
  const { goBack } = useReturnNavigation(detailPath);
  const { data: job, isLoading, isError, error } = useJob(id);
  const update = useUpdateJob(id);

  const roleSlug = resolveAuthRoleSlug(user?.role);
  const isTenantAdmin =
    isTenantUserManagerRole(roleSlug) ||
    TENANT_USER_MANAGER_ROLE_SLUGS.some((s) => hasRole(s));
  const opsUnrestricted =
    Boolean(user?.unrestrictedOps) ||
    isOpsUnrestrictedRole(roleSlug) ||
    isTenantAdmin;

  const allowedJobTypes = useMemo(() => {
    const filtered = filterJobTypesByStaffAccess({
      permissions: user?.permissions ?? [],
      visibleJobTypes: user?.visibleJobTypes,
      writableJobTypes: user?.writableJobTypes,
      unrestrictedOps: opsUnrestricted,
      isTenantAdmin: isTenantAdmin || isOpsUnrestrictedRole(roleSlug),
      isModuleEnabled: hasEnabledModule,
      candidates: JOB_TYPE_WIZARD_OPTIONS,
      mode: 'create',
    });
    const current = job?.job_type as JobType | undefined;
    if (current && !filtered.includes(current)) {
      return [...filtered, current];
    }
    return filtered;
  }, [
    user?.permissions,
    user?.visibleJobTypes,
    user?.writableJobTypes,
    opsUnrestricted,
    isTenantAdmin,
    roleSlug,
    hasEnabledModule,
    job?.job_type,
  ]);

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
      <FormPageHeader title="Edit job" onBack={goBack} backLabel="Back to job" />
      <JobForm
        mode="edit"
        jobTypeOptions={allowedJobTypes}
        defaultValues={jobToFormValues(job) as UpdateJobFormValues}
        isSubmitting={update.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          await update.mutateAsync(values as UpdateJobFormValues);
          goBack();
        }}
      />
    </div>
  );
}
