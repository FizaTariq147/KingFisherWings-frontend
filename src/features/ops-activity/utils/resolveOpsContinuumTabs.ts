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

const ACTION_FLAGS: { tab: OpsContinuumTab; flags: string[] }[] = [
  { tab: 'comments', flags: ['can_comments', 'can_comment'] },
  { tab: 'follow-ups', flags: ['can_follow_ups', 'can_followups', 'can_follow_up'] },
  { tab: 'attachments', flags: ['can_attachments', 'can_attachment'] },
  { tab: 'references', flags: ['can_references', 'can_reference'] },
  { tab: 'tags', flags: ['can_tags', 'can_tag'] },
  { tab: 'links', flags: ['can_links', 'can_link'] },
  { tab: 'likes', flags: ['can_likes', 'can_like'] },
  { tab: 'complaints', flags: ['can_complaints', 'can_complaint'] },
  { tab: 'history', flags: ['can_history', 'can_ops_history'] },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/-/g, '_');
}

/**
 * Resolve which continuum buttons to show from detail contract.
 * Uses path_hints + ops_continuum + can_* when present; otherwise all endpoint tabs.
 */
export function resolveOpsContinuumTabs(opts: {
  pathHints?: string[];
  opsContinuum?: Record<string, unknown> | null;
  actions?: Record<string, unknown> | null;
}): OpsContinuumTab[] {
  const selected = new Set<OpsContinuumTab>();

  for (const hint of opts.pathHints ?? []) {
    const key = normKey(hint);
    if (EXPAND_TO_ALL.has(key) || EXPAND_TO_ALL.has(key.replace(/_/g, '-'))) {
      for (const t of ALL_TABS) selected.add(t);
      continue;
    }
    const tab = HINT_TO_TAB[key] ?? HINT_TO_TAB[key.replace(/_/g, '-')];
    if (tab) selected.add(tab);
  }

  const continuum = opts.opsContinuum;
  if (continuum) {
    const enabledFlag =
      continuum.enabled === true ||
      continuum.enabled === 'true' ||
      continuum.available === true;
    if (enabledFlag) {
      for (const t of ALL_TABS) selected.add(t);
    }
    for (const key of Object.keys(continuum)) {
      const nk = normKey(key);
      const tab = HINT_TO_TAB[nk];
      const val = continuum[key];
      if (tab && (val === true || val === 'true' || typeof val === 'string' || Array.isArray(val))) {
        selected.add(tab);
      }
    }
    const resources = continuum.resources ?? continuum.tabs ?? continuum.actions;
    if (Array.isArray(resources)) {
      for (const item of resources) {
        if (typeof item === 'string') {
          const tab = HINT_TO_TAB[normKey(item)];
          if (tab) selected.add(tab);
        } else {
          const rec = asRecord(item);
          const key = String(rec?.key ?? rec?.id ?? rec?.name ?? '').trim();
          const tab = HINT_TO_TAB[normKey(key)];
          if (tab) selected.add(tab);
        }
      }
    }
  }

  const actions = opts.actions;
  if (actions) {
    let anyExplicit = false;
    for (const { tab, flags } of ACTION_FLAGS) {
      for (const f of flags) {
        if (typeof actions[f] === 'boolean') {
          anyExplicit = true;
          if (actions[f] === true) selected.add(tab);
        }
      }
    }
    if (anyExplicit && selected.size === 0) {
      // All can_* were false — still allow history at minimum if present elsewhere
    }
  }

  if (selected.size === 0) return [...ALL_TABS];
  return ALL_TABS.filter((t) => selected.has(t));
}

export { ALL_TABS as OPS_CONTINUUM_ALL_TABS };
