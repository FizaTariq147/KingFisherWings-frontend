import { useCallback, useEffect, useRef, useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { useAuthStore } from '@/store/authStore';
import { JobForm } from '../components/JobForm';
import type { JobDraftChargeLine } from '../components/job-wizard';
import {
  JOB_SEGMENTS,
  JOB_TYPES,
  type JobSegmentKey,
  type JobType,
} from '../constants/job.constants';
import { JOB_CREATE_WIZARD_STEPS } from '../constants/jobWizard.constants';
import { useCreateWritableJobTypes } from '../hooks/useCreateWritableJobTypes';
import { jobKeys, useCreateJob } from '../hooks/useJobs';
import { jobCreateDraftService } from '../services/jobCreateDraft.service';
import type { CreateJobFormValues } from '../types/job.types';
import type {
  JobCreateDraft,
  JobCreateDraftLocalBackup,
  JobCreateDraftPayload,
  UpsertJobCreateDraftDto,
} from '../types/jobCreateDraft.types';
import type { JobWizardCostingPayload } from '../types/jobWizardCosting.types';
import { pickDefaultJobType } from '../utils/filterJobTypesByStaffAccess';
import {
  clearPendingJobCreateDraft,
  rememberPendingJobCreateDraft,
} from '../utils/flushJobCreateDraft';
import {
  clearJobCreateDraftLocal,
  readJobCreateDraftLocal,
  writeJobCreateDraftLocal,
} from '../utils/jobCreateDraftStorage';
import { jobDetailPath, jobRoutePrefix, segmentFromPath } from '../utils/jobRoute';
import { persistJobWizardCosting } from '../utils/persistJobWizardCosting';

const DRAFT_SAVE_DEBOUNCE_MS = 800;

function defaultTypeForSegment(segment: JobSegmentKey | null): JobType {
  if (!segment) return 'AIR_EXPORT';
  return JOB_SEGMENTS[segment].defaultCreateType;
}

function parseJobTypeParam(raw: string | null): JobType | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  return (JOB_TYPES as readonly string[]).includes(upper) ? (upper as JobType) : null;
}

function clampStep(step: number | undefined): number {
  const n = typeof step === 'number' && Number.isFinite(step) ? Math.floor(step) : 0;
  return Math.max(0, Math.min(n, JOB_CREATE_WIZARD_STEPS.length - 1));
}

function coerceDraftCharges(raw: unknown[] | undefined): JobDraftChargeLine[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out: JobDraftChargeLine[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const localId =
      typeof r.localId === 'string' && r.localId.trim()
        ? r.localId.trim()
        : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    out.push({ ...(r as object), localId } as JobDraftChargeLine);
  }
  return out;
}

type RestoredDraft = {
  id?: string;
  defaultValues: Partial<CreateJobFormValues>;
  initialStep: number;
  initialDraftCharges: JobDraftChargeLine[];
};

function restoredFromServer(draft: JobCreateDraft): RestoredDraft {
  const payload = draft.payload;
  const values: Partial<CreateJobFormValues> = {
    ...(payload?.values ?? {}),
  };
  if (draft.job_type && !values.job_type) {
    values.job_type = draft.job_type as CreateJobFormValues['job_type'];
  }
  if (draft.branch_id && !values.branch_id) {
    values.branch_id = draft.branch_id;
  }
  return {
    id: draft.id,
    defaultValues: values,
    initialStep: clampStep(payload?.step ?? draft.step),
    initialDraftCharges: coerceDraftCharges(payload?.charges),
  };
}

function restoredFromLocal(backup: JobCreateDraftLocalBackup): RestoredDraft {
  const values: Partial<CreateJobFormValues> = {
    ...(backup.payload.values ?? {}),
  };
  if (backup.job_type && !values.job_type) {
    values.job_type = backup.job_type as CreateJobFormValues['job_type'];
  }
  if (backup.branch_id && !values.branch_id) {
    values.branch_id = backup.branch_id;
  }
  return {
    id: backup.id,
    defaultValues: values,
    initialStep: clampStep(backup.payload.step ?? backup.step),
    initialDraftCharges: coerceDraftCharges(backup.payload.charges),
  };
}

type DraftBoot = {
  userId: string;
  restored: RestoredDraft | null;
};

export default function JobCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const segment = segmentFromPath(pathname);
  const isGenericCreate = pathname === '/jobs/new' || !segment;
  const create = useCreateJob();
  const [persistingCosting, setPersistingCosting] = useState(false);
  const allowedJobTypes = useCreateWritableJobTypes('auth');
  const userId = useAuthStore((s) => s.user?.id ?? '');

  const queryType = parseJobTypeParam(searchParams.get('job_type'));
  const preferredType =
    queryType ?? (isGenericCreate ? 'SERVICE_JOB' : defaultTypeForSegment(segment));
  const fallbackJobType = pickDefaultJobType(preferredType, allowedJobTypes);

  const [boot, setBoot] = useState<DraftBoot | null>(null);
  const serverDraftIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftReady = boot !== null && boot.userId === userId;
  const restored = draftReady ? boot.restored : null;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let next: RestoredDraft | null = null;
      try {
        const server = await jobCreateDraftService.getCurrent();
        if (server) next = restoredFromServer(server);
      } catch {
        // fall through to localStorage
      }

      if (!next && userId) {
        const local = readJobCreateDraftLocal(userId);
        if (local) next = restoredFromLocal(local);
      }

      if (cancelled) return;
      if (next?.id) serverDraftIdRef.current = next.id;
      else serverDraftIdRef.current = null;
      setBoot({ userId, restored: next });
    })();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [userId]);

  const defaultValues: Partial<CreateJobFormValues> = {
    ...(restored?.defaultValues ?? {}),
  };
  const jt = String(defaultValues.job_type ?? fallbackJobType ?? '');
  if (allowedJobTypes.length && jt && !allowedJobTypes.includes(jt as JobType)) {
    defaultValues.job_type = fallbackJobType;
  } else if (!defaultValues.job_type) {
    defaultValues.job_type = fallbackJobType;
  }

  const defaultJobType = (defaultValues.job_type as JobType | undefined) ?? fallbackJobType;

  const clearDraftEverywhere = useCallback(async () => {
    const id = serverDraftIdRef.current;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    clearPendingJobCreateDraft();
    if (userId) clearJobCreateDraftLocal(userId);
    serverDraftIdRef.current = null;
    try {
      if (id) {
        await jobCreateDraftService.deleteById(id);
      } else {
        await jobCreateDraftService.deleteCurrent();
      }
    } catch {
      // best effort
    }
  }, [userId]);

  const onWizardDraftChange = useCallback(
    (draft: {
      step: number;
      values: CreateJobFormValues;
      charges: JobDraftChargeLine[];
      job_type?: string;
      branch_id?: string;
    }) => {
      if (!userId) return;

      const payload: JobCreateDraftPayload = {
        version: 1,
        step: draft.step,
        values: draft.values,
        charges: draft.charges,
      };
      const job_type = draft.job_type ?? draft.values.job_type;
      const branchRaw = draft.branch_id ?? draft.values.branch_id;
      const branch_id =
        typeof branchRaw === 'string' && branchRaw.trim() ? branchRaw.trim() : undefined;
      const dto: UpsertJobCreateDraftDto = {
        job_type: job_type || undefined,
        branch_id,
        step: draft.step,
        payload,
      };
      const backup = {
        id: serverDraftIdRef.current ?? undefined,
        job_type: dto.job_type,
        branch_id: dto.branch_id,
        step: draft.step,
        payload,
      };

      rememberPendingJobCreateDraft(userId, dto, backup);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        writeJobCreateDraftLocal(userId, backup);
        void jobCreateDraftService
          .upsertCurrent(dto)
          .then((saved) => {
            if (saved?.id) {
              serverDraftIdRef.current = saved.id;
              writeJobCreateDraftLocal(userId, { ...backup, id: saved.id });
            }
          })
          .catch(() => {
            // local backup already written
          });
      }, DRAFT_SAVE_DEBOUNCE_MS);
    },
    [userId],
  );

  const backPath = isGenericCreate ? '/dashboard' : jobRoutePrefix(segment!);
  const backLabel = isGenericCreate
    ? 'Back to dashboard'
    : `Back to ${JOB_SEGMENTS[segment!].label.toLowerCase()} jobs`;

  return (
    <div className="space-y-4">
      <PageBackLink to={backPath} label={backLabel} />
      <div className="text-center">
        <h2 className={appType.pageTitle}>Create Job</h2>
      </div>
      {allowedJobTypes.length === 0 ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          No job types are available for your departments. Ask an admin to grant Air Import /
          Air Export (or other operations) access.
        </div>
      ) : !draftReady ? (
        <div
          role="status"
          className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-4 py-6 text-center text-sm text-[var(--color-neutral-500)]"
        >
          Loading draft…
        </div>
      ) : (
        <JobForm
          mode="create"
          layout="wizard"
          jobTypeOptions={allowedJobTypes}
          defaultJobType={defaultJobType}
          defaultValues={defaultValues}
          initialStep={restored?.initialStep ?? 0}
          initialDraftCharges={restored?.initialDraftCharges}
          onWizardDraftChange={onWizardDraftChange}
          isSubmitting={create.isPending || persistingCosting}
          onCancel={() => navigate(backPath)}
          onSubmit={async (values, options) => {
            const created = await create.mutateAsync(values as CreateJobFormValues);
            await clearDraftEverywhere();

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
          }}
        />
      )}
    </div>
  );
}
