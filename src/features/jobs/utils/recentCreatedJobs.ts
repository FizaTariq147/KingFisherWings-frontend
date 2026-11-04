import type { Job } from '../types/job.types';
import { canonicalizeJobType } from './canonicalizeJobType';

const MAX_RECENT = 40;
const STORAGE_KEY = 'kf.jobs.recentCreated.v2';
/** Keep older key around so in-flight sessions still recover ids. */
const LEGACY_STORAGE_KEY = 'kf.jobs.recentCreated.v1';

type RecentEntry = {
  id: string;
  job_type: string;
  savedAt: number;
  /** Full create response — list/dashboard hydrate without GET /jobs/:id. */
  snapshot?: Job;
};

function snapshotFromJob(job: Job): Job {
  return {
    ...job,
    id: String(job.id),
    job_type: canonicalizeJobType(job.job_type),
    shipper_id: job.shipper_id ?? '',
    status: job.status ?? 'ENQUIRY',
  };
}

function parseEntry(row: unknown): RecentEntry | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const id = String(r.id ?? '').trim();
  if (!id) return null;
  const job_type = canonicalizeJobType(r.job_type ?? (r.snapshot as Job | undefined)?.job_type);
  const savedAt = Number(r.savedAt ?? 0);
  let snapshot: Job | undefined;
  if (r.snapshot && typeof r.snapshot === 'object') {
    const s = r.snapshot as Job;
    if (s.id) snapshot = snapshotFromJob({ ...s, id: String(s.id) });
  }
  return {
    id,
    job_type,
    savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
    snapshot,
  };
}

function readEntries(): RecentEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseEntry).filter((x): x is RecentEntry => Boolean(x));
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_RECENT)));
  } catch {
    /* ignore quota — try without heavy nested fields */
    try {
      const slim = entries.slice(0, MAX_RECENT).map((e) => ({
        id: e.id,
        job_type: e.job_type,
        savedAt: e.savedAt,
        snapshot: e.snapshot
          ? {
              id: e.snapshot.id,
              job_number: e.snapshot.job_number,
              job_type: e.snapshot.job_type,
              status: e.snapshot.status,
              shipper_id: e.snapshot.shipper_id ?? '',
              shipper_name: e.snapshot.shipper_name,
              consignee_id: e.snapshot.consignee_id,
              consignee_name: e.snapshot.consignee_name,
              ops_user_id: e.snapshot.ops_user_id,
              salesperson_id: e.snapshot.salesperson_id,
              created_at: e.snapshot.created_at,
              updated_at: e.snapshot.updated_at,
            }
          : undefined,
      }));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      /* ignore */
    }
  }
}

function allowSet(jobTypes?: readonly string[] | null): Set<string> | null {
  return jobTypes?.length
    ? new Set(jobTypes.map((t) => canonicalizeJobType(t)))
    : null;
}

function entryAllowed(e: RecentEntry, allow: Set<string> | null, now: number, maxAge: number) {
  if (now - e.savedAt > maxAge) return false;
  if (allow && !allow.has(canonicalizeJobType(e.job_type))) return false;
  return true;
}

/** Remember a job the current session created (list/dashboard hydration fallback). */
export function rememberCreatedJob(job: Job) {
  const id = String(job.id ?? '').trim();
  if (!id) return;
  const next: RecentEntry = {
    id,
    job_type: canonicalizeJobType(job.job_type),
    savedAt: Date.now(),
    snapshot: snapshotFromJob(job),
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
  const allow = allowSet(opts?.jobTypes);
  return readEntries()
    .filter((e) => entryAllowed(e, allow, now, maxAge))
    .map((e) => e.id);
}

/** Session-created job rows for list/dashboard when GET /jobs ACL omits them. */
export function listRecentCreatedJobSnapshots(opts?: {
  jobTypes?: readonly string[] | null;
  maxAgeMs?: number;
}): Job[] {
  const maxAge = opts?.maxAgeMs ?? 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const allow = allowSet(opts?.jobTypes);
  return readEntries()
    .filter((e) => entryAllowed(e, allow, now, maxAge))
    .map((e) => e.snapshot)
    .filter((j): j is Job => Boolean(j?.id));
}
