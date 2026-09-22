import type { CcStageId } from '../types/customsClearance.types';

export type { CcStageId };

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

export function isCcJobType(jobType?: string | null): boolean {
  return String(jobType ?? '')
    .trim()
    .toUpperCase() === 'CUSTOMS_CLEARANCE';
}

/** Map API status/stage string → rail stage id. */
export function statusToCcStage(status?: string | null): CcStageId {
  const s = String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!s || s === 'DRAFT' || s === 'OPEN' || s.includes('OPEN')) return 'open';
  if (s.includes('DOC')) return 'docs';
  if (s.includes('CLASSIF')) return 'classify';
  if (s.includes('FILE') || s.includes('FILING') || s.includes('BOE') || s.includes('SB'))
    return 'file';
  if (s.includes('ASSESS') || s.includes('QUER')) return 'assess';
  if (s.includes('DUTY') || s.includes('TAX') || s.includes('PAYMENT')) return 'duty';
  if (s.includes('EXAM')) return 'exam';
  if (s.includes('CLEAR') && !s.includes('RELEASE')) return 'clear';
  if (s.includes('RELEASE') || s.includes('_DO')) return 'release';
  if (s.includes('INVOICE')) return 'invoice';
  if (s.includes('CLOSE') || s.includes('ARCHIVE') || s === 'COMPLETED') return 'close';
  return 'open';
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
