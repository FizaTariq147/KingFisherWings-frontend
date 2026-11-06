import type {
  JobCreateDraftLocalBackup,
  JobCreateDraftPayload,
} from '../types/jobCreateDraft.types';

export function jobCreateDraftStorageKey(userId: string): string {
  return `kfw:job-create-draft:${userId}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parsePayload(raw: unknown): JobCreateDraftPayload | null {
  const r = asRecord(raw);
  if (!r) return null;
  const version = Number(r.version);
  if (version !== 1) return null;
  const step = Number(r.step);
  const values = asRecord(r.values) ?? {};
  const charges = Array.isArray(r.charges) ? r.charges : [];
  return {
    version: 1,
    step: Number.isFinite(step) && step >= 0 ? Math.floor(step) : 0,
    values: values as JobCreateDraftPayload['values'],
    charges,
  };
}

export function readJobCreateDraftLocal(userId: string): JobCreateDraftLocalBackup | null {
  const uid = userId.trim();
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(jobCreateDraftStorageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const r = asRecord(parsed);
    if (!r) return null;
    const payload = parsePayload(r.payload);
    if (!payload) return null;
    const step =
      typeof r.step === 'number' && Number.isFinite(r.step)
        ? Math.max(0, Math.floor(r.step))
        : payload.step;
    return {
      version: 1,
      updatedAt:
        typeof r.updatedAt === 'number' && Number.isFinite(r.updatedAt)
          ? r.updatedAt
          : Date.now(),
      id: typeof r.id === 'string' && r.id.trim() ? r.id.trim() : undefined,
      job_type:
        typeof r.job_type === 'string' && r.job_type.trim()
          ? r.job_type.trim()
          : undefined,
      branch_id:
        typeof r.branch_id === 'string' && r.branch_id.trim()
          ? r.branch_id.trim()
          : undefined,
      step,
      payload: { ...payload, step },
    };
  } catch {
    return null;
  }
}

export function writeJobCreateDraftLocal(
  userId: string,
  backup: Omit<JobCreateDraftLocalBackup, 'version' | 'updatedAt'> & {
    updatedAt?: number;
  },
): void {
  const uid = userId.trim();
  if (!uid) return;
  try {
    const body: JobCreateDraftLocalBackup = {
      version: 1,
      updatedAt: backup.updatedAt ?? Date.now(),
      id: backup.id,
      job_type: backup.job_type,
      branch_id: backup.branch_id,
      step: backup.step ?? backup.payload.step,
      payload: backup.payload,
    };
    localStorage.setItem(jobCreateDraftStorageKey(uid), JSON.stringify(body));
  } catch {
    // ignore quota / private mode
  }
}

export function clearJobCreateDraftLocal(userId: string): void {
  const uid = userId.trim();
  if (!uid) return;
  try {
    localStorage.removeItem(jobCreateDraftStorageKey(uid));
  } catch {
    // ignore
  }
}
