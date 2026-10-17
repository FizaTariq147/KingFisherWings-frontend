import type { OpsContinuumTab } from '../types/opsActivity.types';

const ALL_TABS: OpsContinuumTab[] = [
  'comments',
  'follow-ups',
  'attachments',
  'references',
  'tags',
  'links',
  'likes',
  'complaints',
  'history',
];

/** Map path_hints / ops_continuum keys → continuum tabs (endpoint-backed). */
const HINT_TO_TAB: Record<string, OpsContinuumTab> = {
  comments: 'comments',
  comment: 'comments',
  follow_ups: 'follow-ups',
  followups: 'follow-ups',
  'follow-ups': 'follow-ups',
  follow_up: 'follow-ups',
  attachments: 'attachments',
  attachment: 'attachments',
  references: 'references',
  reference: 'references',
  tags: 'tags',
  tag: 'tags',
  links: 'links',
  link: 'links',
  likes: 'likes',
  like: 'likes',
  likes_toggle: 'likes',
  complaints: 'complaints',
  complaint: 'complaints',
  history: 'history',
};

/** Generic continuum hints → every /ops/:type/:id resource (OpenAPI). */
const EXPAND_TO_ALL = new Set([
  'ops_continuum',
  'ops-continuum',
  'continuum',
  'ops',
]);

function normKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/-/g, '_');
}

export function isContinuumHintKey(key: string): boolean {
  const nk = normKey(key);
  if (EXPAND_TO_ALL.has(nk) || EXPAND_TO_ALL.has(nk.replace(/_/g, '-'))) return true;
  return Boolean(HINT_TO_TAB[nk] ?? HINT_TO_TAB[nk.replace(/_/g, '-')]);
}

/**
 * Resolve continuum rail buttons.
 *
 * Always expose every OpenAPI /ops continuum resource (same set on job,
 * shipment, quotation, enquiry). Detail path_hints / ops_continuum / can_*
 * are used for hosting and deep-links elsewhere — not to hide rail icons.
 */
export function resolveOpsContinuumTabs(_opts?: {
  pathHints?: string[];
  opsContinuum?: Record<string, unknown> | null;
  actions?: Record<string, unknown> | null;
}): OpsContinuumTab[] {
  return [...ALL_TABS];
}

export { ALL_TABS as OPS_CONTINUUM_ALL_TABS };
