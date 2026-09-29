import type { CcStageId } from '../types/customsClearance.types';

export type { CcStageId };

/**
 * Backend CC queue/status values (forward-only).
 * Source: live OpenAPI Jobs — Customs Clearance queue `status` enum.
 */
export const CC_API_STATUSES = [
  'PENDING',
  'QUOTED',
  'ACCEPTED',
  'OPS_OPEN',
  'DOCS',
  'CLASSIFIED',
  'FILED',
  'QUERY',
  'ASSESSED',
  'DUTY_PAID',
  'CLEARED',
  'RELEASED',
  'INVOICE_READY',
  'CLOSED',
] as const;

export type CcApiStatus = (typeof CC_API_STATUSES)[number];

export const CC_STAGES: {
  id: CcStageId;
  label: string;
  owner: string;
  detail: string;
}[] = [
  { id: 'open', label: 'Open CC', owner: 'CS', detail: 'Open customs clearance on the job' },
  { id: 'docs', label: 'Docs checklist', owner: 'CS', detail: 'Collect docs → mark docs complete' },
  { id: 'classify', label: 'Classify HS', owner: 'Broker', detail: 'Classify lines → stage classify' },
  { id: 'file', label: 'File entry', owner: 'Broker', detail: 'Declaration + filing → stage file' },
  { id: 'assess', label: 'Assessment', owner: 'Customs', detail: 'Assess + handle queries' },
  { id: 'duty', label: 'Duty paid', owner: 'Accounts', detail: 'Duty payment request → duty paid' },
  { id: 'exam', label: 'Exam (optional)', owner: 'Ops', detail: 'Customs examination if required' },
  { id: 'clear', label: 'Cleared', owner: 'Broker', detail: 'Mark cleared' },
  { id: 'release', label: 'Release / DO', owner: 'Ops', detail: 'Release cargo / delivery order' },
  { id: 'invoice', label: 'Invoice ready', owner: 'Accounts', detail: 'Invoice CC charges' },
  { id: 'close', label: 'Close', owner: 'Mgmt', detail: 'Close job + archive' },
];

export const CC_STAGE_ACTION_ORDER: CcStageId[] = CC_STAGES.map((s) => s.id);

/** Rank aligned to OpenAPI queue status enum (forward-only). */
const CC_API_STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  QUOTED: 1,
  ACCEPTED: 2,
  OPS_OPEN: 3,
  DOCS: 4,
  DOCS_COMPLETE: 4,
  CLASSIFIED: 5,
  FILED: 6,
  QUERY: 6,
  ASSESSED: 7,
  DUTY_PAID: 8,
  CLEARED: 9,
  RELEASED: 10,
  INVOICE_READY: 11,
  CLOSED: 12,
  COMPLETED: 12,
  ARCHIVED: 12,
};

/**
 * API status produced when the rail action succeeds.
 * Used to skip calling an endpoint whose target status is already reached.
 */
export const CC_STAGE_RESULT_STATUS: Partial<Record<CcStageId, string>> = {
  open: 'OPS_OPEN',
  docs: 'DOCS',
  classify: 'CLASSIFIED',
  file: 'FILED',
  assess: 'ASSESSED',
  duty: 'DUTY_PAID',
  clear: 'CLEARED',
  release: 'RELEASED',
  invoice: 'INVOICE_READY',
  close: 'CLOSED',
};

function normalizeCcApiToken(value?: string | null): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

export function ccApiStatusRank(apiStatus?: string | null): number {
  const s = normalizeCcApiToken(apiStatus);
  return CC_API_STATUS_RANK[s] ?? -1;
}

/** Prefer the furthest of stage / status / timestamp-inferred status. */
export function resolveCcApiStatus(
  stage?: string | null,
  status?: string | null,
  fromTimestamps?: string | null,
): string {
  const candidates = [stage, status, fromTimestamps]
    .map((v) => normalizeCcApiToken(v))
    .filter(Boolean);
  if (candidates.length === 0) return '';
  return candidates.reduce((best, cur) => {
    const rb = CC_API_STATUS_RANK[best] ?? -1;
    const rc = CC_API_STATUS_RANK[cur] ?? -1;
    return rc >= rb ? cur : best;
  });
}

/** Infer API status from milestone timestamps when string fields are absent. */
export function inferCcApiStatusFromTimestamps(st?: {
  opened_at?: string;
  docs_complete_at?: string;
  classified_at?: string;
  filed_at?: string;
  assessed_at?: string;
  duty_paid_at?: string;
  cleared_at?: string;
  released_at?: string;
  invoice_ready_at?: string;
  closed_at?: string;
} | null): string {
  if (!st) return '';
  if (st.closed_at) return 'CLOSED';
  if (st.invoice_ready_at) return 'INVOICE_READY';
  if (st.released_at) return 'RELEASED';
  if (st.cleared_at) return 'CLEARED';
  if (st.duty_paid_at) return 'DUTY_PAID';
  if (st.assessed_at) return 'ASSESSED';
  if (st.filed_at) return 'FILED';
  if (st.classified_at) return 'CLASSIFIED';
  if (st.docs_complete_at) return 'DOCS';
  if (st.opened_at) return 'OPS_OPEN';
  return '';
}

/**
 * True when calling this rail action would not move status forward
 * (API already at or past the status that action produces).
 */
export function canRunCcStageAction(
  apiStatus: string | null | undefined,
  stageId: CcStageId,
): boolean {
  const target = CC_STAGE_RESULT_STATUS[stageId];
  if (!target) {
    return statusToCcStage(apiStatus) === stageId;
  }
  return ccApiStatusRank(apiStatus) < ccApiStatusRank(target);
}

export function isCcJobType(jobType?: string | null): boolean {
  return (
    String(jobType ?? '')
      .trim()
      .toUpperCase() === 'CUSTOMS_CLEARANCE'
  );
}

/**
 * Map current API status → next rail step (what Ops should do next).
 * Backend values are post-action (e.g. RELEASED ⇒ next is invoice).
 */
export function statusToCcStage(status?: string | null): CcStageId {
  const s = normalizeCcApiToken(status);

  if (!s || s === 'DRAFT' || s === 'PENDING' || s === 'QUOTED' || s === 'ACCEPTED') {
    return 'open';
  }
  if (s === 'OPS_OPEN') return 'docs';
  if (s === 'DOCS' || s === 'DOCS_COMPLETE') return 'classify';
  if (s === 'CLASSIFIED') return 'file';
  if (s === 'FILED' || s === 'QUERY') return 'assess';
  if (s === 'ASSESSED') return 'duty';
  if (s === 'DUTY_PAID') return 'exam';
  if (s === 'CLEARED') return 'release';
  if (s === 'RELEASED') return 'invoice';
  if (s === 'INVOICE_READY') return 'close';
  if (s === 'CLOSED' || s === 'COMPLETED' || s === 'ARCHIVED') return 'close';

  // Fuzzy only for unknown tokens — never rewind a known post-action status.
  if (s.includes('QUERY')) return 'assess';
  if (s.includes('ASSESSED')) return 'duty';
  if (s.includes('ASSESS')) return 'assess';
  if (s.includes('DUTY') && s.includes('PAID')) return 'exam';
  if (s.includes('DUTY') || s.includes('TAX') || s.includes('PAYMENT')) return 'duty';
  if (s.includes('DOC')) return 'docs';
  if (s.includes('CLASSIF')) return 'classify';
  if (s.includes('FILE') || s.includes('FILING') || s.includes('BOE') || s.includes('SB')) {
    return 'file';
  }
  if (s.includes('EXAM')) return 'exam';
  if (s.includes('CLEAR') && !s.includes('RELEASE')) return 'clear';
  // RELEASED / release-complete ⇒ next is invoice (not release again)
  if (s.includes('RELEASE')) return 'invoice';
  if (s.includes('INVOICE')) return 'invoice';
  if (s.includes('CLOSE') || s.includes('ARCHIVE')) return 'close';
  if (s === 'OPEN' || s.includes('OPS_OPEN')) return 'docs';
  return 'open';
}

/** Mark every rail stage before `current` as done. */
export function stagesCompletedBefore(
  current: CcStageId,
  order: CcStageId[] = CC_STAGE_ACTION_ORDER,
): Partial<Record<CcStageId, boolean>> {
  const idx = order.indexOf(current);
  const map: Partial<Record<CcStageId, boolean>> = {};
  if (idx < 0) return map;
  for (let i = 0; i < idx; i++) map[order[i]] = true;
  return map;
}

export function railDoneFromApiStatus(
  apiStatus: string | null | undefined,
): Partial<Record<CcStageId, boolean>> {
  const next = statusToCcStage(apiStatus);
  const map = stagesCompletedBefore(next);
  if (normalizeCcApiToken(apiStatus) === 'CLOSED') {
    for (const id of CC_STAGE_ACTION_ORDER) map[id] = true;
  }
  return map;
}

export function firstOpenCcStage(
  order: CcStageId[],
  isDone: (id: CcStageId) => boolean,
  derived?: Partial<Record<CcStageId, boolean>>,
): CcStageId {
  for (const id of order) {
    if (derived?.[id] || isDone(id)) continue;
    return id;
  }
  return order[order.length - 1] ?? 'close';
}
