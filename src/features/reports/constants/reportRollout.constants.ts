/**
 * Family rollout waves (plan Phase 3).
 * Templates with rolloutPhase <= active wave are shown as "in rollout".
 */
export const REPORT_FAMILY_ROLLOUT = {
  /** Ops list reports */
  phase1: 1,
  /** Sea docs */
  phase2: 2,
  /** Air docs + quotations */
  phase3: 3,
  /** Commercial / invoice formats */
  phase4: 4,
  /** Finance */
  phase5: 5,
  /** WMS */
  phase6: 6,
} as const;

/**
 * Active FE rollout ceiling for "?rollout=active" filter.
 * Full catalog remains browsable via family/phase chips; raise this as backend
 * template packs ship: 1 ops → 2 sea → 3 air → 4 commercial → 5 finance → 6 wms
 */
export const ACTIVE_REPORT_ROLLOUT_PHASE = REPORT_FAMILY_ROLLOUT.phase1;

export const ROLLOUT_PHASE_LABELS: Record<number, string> = {
  1: 'Ops lists',
  2: 'Sea documents',
  3: 'Air documents',
  4: 'Commercial / invoices',
  5: 'Finance & GL',
  6: 'WMS',
};
