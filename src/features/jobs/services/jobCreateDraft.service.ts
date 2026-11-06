import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { JOB_API } from '../api/job.api';
import type {
  JobCreateDraft,
  JobCreateDraftPayload,
  UpsertJobCreateDraftDto,
} from '../types/jobCreateDraft.types';
import { unwrapEntity, unwrapList } from '../utils/normalizeJob';

const SOFT = { skipErrorToast: true } as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parsePayload(raw: unknown): JobCreateDraftPayload | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  const version = Number(r.version);
  if (version !== 1) {
    // Still accept opaque objects; FE only restores v1 shape.
    return {
      version: 1,
      step: typeof r.step === 'number' && Number.isFinite(r.step) ? Math.max(0, Math.floor(r.step)) : 0,
      values: (asRecord(r.values) ?? {}) as JobCreateDraftPayload['values'],
      charges: Array.isArray(r.charges) ? r.charges : [],
    };
  }
  const step = Number(r.step);
  return {
    version: 1,
    step: Number.isFinite(step) && step >= 0 ? Math.floor(step) : 0,
    values: (asRecord(r.values) ?? {}) as JobCreateDraftPayload['values'],
    charges: Array.isArray(r.charges) ? r.charges : [],
  };
}

function normalizeDraft(raw: unknown): JobCreateDraft | null {
  const data = unwrapEntity(raw) ?? raw;
  const r = asRecord(data);
  if (!r) return null;
  const id = String(r.id ?? '').trim();
  if (!id) return null;
  const stepRaw = r.step;
  const step =
    typeof stepRaw === 'number' && Number.isFinite(stepRaw)
      ? Math.max(0, Math.floor(stepRaw))
      : undefined;
  const job_type =
    typeof r.job_type === 'string' && r.job_type.trim()
      ? r.job_type.trim()
      : undefined;
  const branch_id =
    typeof r.branch_id === 'string' && r.branch_id.trim()
      ? r.branch_id.trim()
      : undefined;
  return {
    id,
    job_type,
    branch_id,
    step,
    payload: parsePayload(r.payload),
    updated_at:
      typeof r.updated_at === 'string'
        ? r.updated_at
        : typeof r.updatedAt === 'string'
          ? r.updatedAt
          : undefined,
    created_at:
      typeof r.created_at === 'string'
        ? r.created_at
        : typeof r.createdAt === 'string'
          ? r.createdAt
          : undefined,
  };
}

function isNotFound(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404;
}

export const jobCreateDraftService = {
  async getCurrent(): Promise<JobCreateDraft | null> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.createDraftCurrent, SOFT),
      );
      return normalizeDraft(res.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async upsertCurrent(dto: UpsertJobCreateDraftDto): Promise<JobCreateDraft | null> {
    const res = await withGatewayRetry(() =>
      axiosInstance.put(JOB_API.createDraftCurrent, dto, SOFT),
    );
    return normalizeDraft(res.data);
  },

  async list(): Promise<JobCreateDraft[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(JOB_API.createDrafts, SOFT),
    );
    const { items } = unwrapList(res.data);
    return items.map(normalizeDraft).filter((d): d is JobCreateDraft => Boolean(d));
  },

  async getById(id: string): Promise<JobCreateDraft | null> {
    const trimmed = id.trim();
    if (!trimmed) return null;
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.createDraftById(trimmed), SOFT),
      );
      return normalizeDraft(res.data);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async upsertById(id: string, dto: UpsertJobCreateDraftDto): Promise<JobCreateDraft | null> {
    const trimmed = id.trim();
    if (!trimmed) return null;
    const res = await withGatewayRetry(() =>
      axiosInstance.put(JOB_API.createDraftById(trimmed), dto, SOFT),
    );
    return normalizeDraft(res.data);
  },

  async deleteById(id: string): Promise<void> {
    const trimmed = id.trim();
    if (!trimmed) return;
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(JOB_API.createDraftById(trimmed), SOFT),
      );
    } catch (error) {
      if (isNotFound(error)) return;
      throw error;
    }
  },

  /** Best-effort: resolve current draft id then DELETE :id. */
  async deleteCurrent(): Promise<void> {
    const current = await this.getCurrent();
    if (current?.id) {
      await this.deleteById(current.id);
    }
  },
};
