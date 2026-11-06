import type { CreateJobFormValues } from './job.types';

/** Opaque FE wizard JSON stored in UpsertJobCreateDraftDto.payload. */
export type JobCreateDraftPayload = {
  version: 1;
  step: number;
  values: Partial<CreateJobFormValues>;
  charges: unknown[];
};

/** PUT /jobs/create-drafts/current (and :id). */
export type UpsertJobCreateDraftDto = {
  job_type?: string;
  branch_id?: string;
  step?: number;
  payload?: JobCreateDraftPayload;
};

/** Server draft row from GET /jobs/create-drafts/current | :id | list. */
export type JobCreateDraft = {
  id: string;
  job_type?: string;
  branch_id?: string;
  step?: number;
  payload?: JobCreateDraftPayload;
  updated_at?: string;
  created_at?: string;
};

/** localStorage backup shape (`kfw:job-create-draft:${userId}`). */
export type JobCreateDraftLocalBackup = {
  version: 1;
  updatedAt: number;
  id?: string;
  job_type?: string;
  branch_id?: string;
  step?: number;
  payload: JobCreateDraftPayload;
};
