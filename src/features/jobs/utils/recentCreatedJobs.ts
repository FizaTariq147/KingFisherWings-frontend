import type { Job } from '../types/job.types';
import { canonicalizeJobType } from './canonicalizeJobType';

const MAX_RECENT = 40;
const STORAGE_KEY = 'kf.jobs.recentCreated.v1';

type RecentEntry = {
  id: string;
  job_type: string;
  savedAt: number;
};

function readEntries(): RecentEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const r = row as Record<string, unknown>;
        const id = String(r.id ?? '').trim();
        const job_type = String(r.job_type ?? '').trim();
        const savedAt = Number(r.savedAt ?? 0);
        if (!id) return null;
        return { id, job_type, savedAt: Number.isFinite(savedAt) ? savedAt : Date.now() };
      })
      .filter((x): x is RecentEntry => Boolean(x));
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_RECENT)));
  } catch {
    /* ignore quota */
  }
}

/** Remember a job the current session created (list/dashboard hydration fallback). */
export function rememberCreatedJob(job: Pick<Job, 'id' | 'job_type'>) {
  const id = String(job.id ?? '').trim();
  if (!id) return;
  const next: RecentEntry = {
    id,
    job_type: canonicalizeJobType(job.job_type),
    savedAt: Date.now(),
  };
  const rest = readEntries().filter((e) => e.id !== id);
  writeEntries([next, ...rest]);
}

export function listRecentCreatedJobIds(opts?: {
  jobTypes?: readonly string[] | null;
  maxAgeMs?: number;
}): string[] {
  const maxAge = opts?.maxAgeMs ?? 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const allow =
    opts?.jobTypes?.length
      ? new Set(opts.jobTypes.map((t) => canonicalizeJobType(t)))
      : null;
  return readEntries()
    .filter((e) => now - e.savedAt <= maxAge)
    .filter((e) => !allow || allow.has(canonicalizeJobType(e.job_type)))
    .map((e) => e.id);
}
