/** Traffic-light status from GET /jobs/{id}/cutoffs (OpenAPI). */
export type JobCutoffTrafficStatus = 'GREEN' | 'AMBER' | 'RED' | 'NONE' | string;

export interface JobCutoffLane {
  cutoff?: string;
  hoursRemaining?: number | null;
  status: JobCutoffTrafficStatus;
}

export interface JobCutoffs {
  jobId?: string;
  si: JobCutoffLane;
  vgm: JobCutoffLane;
  cy: JobCutoffLane;
  siSubmittedAt?: string;
  siVersion?: string | number;
  vgmSubmittedAt?: string;
  vgmMethod?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function normalizeLane(raw: unknown, fallbackCutoff?: string): JobCutoffLane {
  const record = asRecord(raw);
  const cutoff =
    pickString(record?.cutoff, record?.cutoff_at, record?.cutoffAt, record?.at) ||
    fallbackCutoff ||
    undefined;
  const status = (
    pickString(record?.status, record?.traffic_status, record?.trafficStatus) || 'NONE'
  )
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const hoursRemaining = pickNumber(
    record?.hours_remaining,
    record?.hoursRemaining,
    record?.hours_left,
    record?.hoursLeft,
  );
  return {
    ...(cutoff ? { cutoff } : {}),
    hoursRemaining,
    status: status || 'NONE',
  };
}

/**
 * Normalize GET /jobs/{id}/cutoffs — SI / VGM / CY traffic-light payload.
 * Live shape: `{ si: { cutoff, hours_remaining, status }, vgm, cy, … }`.
 */
export function normalizeJobCutoffs(raw: unknown): JobCutoffs {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root ?? {};

  const flatSi = pickString(data.si_cutoff, data.siCutoff);
  const flatVgm = pickString(data.vgm_cutoff, data.vgmCutoff);
  const flatCy = pickString(data.cy_cutoff, data.cyCutoff);

  const siVersionRaw = data.si_version ?? data.siVersion;

  return {
    jobId: pickString(data.job_id, data.jobId) || undefined,
    si: normalizeLane(data.si, flatSi),
    vgm: normalizeLane(data.vgm, flatVgm),
    cy: normalizeLane(data.cy, flatCy),
    siSubmittedAt: pickString(data.si_submitted_at, data.siSubmittedAt) || undefined,
    siVersion:
      typeof siVersionRaw === 'number' || typeof siVersionRaw === 'string'
        ? siVersionRaw
        : undefined,
    vgmSubmittedAt: pickString(data.vgm_submitted_at, data.vgmSubmittedAt) || undefined,
    vgmMethod: pickString(data.vgm_method, data.vgmMethod) || undefined,
  };
}
