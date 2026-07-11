import type { Tenant, TenantStatistics } from '../types/tenant.types';

export const EMPTY_TENANT_STATISTICS: TenantStatistics = {
  total: 0,
  active: 0,
  inactive: 0,
  trial: 0,
  mrr: 0,
};

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/** Coerce API statistics — backend may omit fields or use different keys. */
export function normalizeTenantStatistics(
  raw?: Partial<TenantStatistics> | Record<string, unknown> | null,
): TenantStatistics {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_TENANT_STATISTICS };

  const record = raw as Record<string, unknown>;

  return {
    total: asNumber(record.total ?? record.total_tenants ?? record.totalTenants),
    active: asNumber(record.active ?? record.active_tenants ?? record.activeTenants),
    inactive: asNumber(
      record.inactive ?? record.inactive_tenants ?? record.inactiveTenants,
    ),
    trial: asNumber(
      record.trial ??
        record.trial_tenants ??
        record.trialTenants ??
        record.on_trial ??
        record.onTrial ??
        record.trials,
    ),
    mrr: asNumber(record.mrr ?? record.monthly_recurring_revenue ?? record.MRR),
  };
}

/** True when tenant is on a Trial subscription plan and/or Trial lifecycle status. */
export function isTrialTenant(tenant: Tenant): boolean {
  if (tenant.deleted_at) return false;
  const plan = String(tenant.subscription_plan ?? '').toUpperCase();
  const status = String(tenant.status ?? '').toUpperCase();
  return plan === 'TRIAL' || status === 'TRIAL';
}

/** Derive Trial (and fill gaps) from the full tenant list — includes subscription_plan TRIAL. */
export function deriveTenantStatisticsFromList(
  tenants: Tenant[],
  apiStats?: TenantStatistics | null,
): TenantStatistics {
  const base = normalizeTenantStatistics(apiStats);
  const live = tenants.filter((t) => !t.deleted_at);

  const trial = live.filter(isTrialTenant).length;
  const active = live.filter((t) => t.is_active === true).length;
  const inactive = live.filter((t) => t.is_active !== true).length;

  // Prefer list-derived active/inactive/trial so a stale API inactive count
  // (or missing is_active flags) cannot inflate the Inactive card.
  if (live.length > 0) {
    return {
      total: Math.max(base.total, live.length),
      active,
      inactive,
      trial,
      mrr: base.mrr,
    };
  }

  return {
    total: base.total,
    active: base.active,
    inactive: base.inactive,
    trial: base.trial,
    mrr: base.mrr,
  };
}
