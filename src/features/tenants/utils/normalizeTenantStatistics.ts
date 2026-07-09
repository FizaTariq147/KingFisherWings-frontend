import type { TenantStatistics } from '../types/tenant.types';

export const EMPTY_TENANT_STATISTICS: TenantStatistics = {
  total: 0,
  active: 0,
  inactive: 0,
  trial: 0,
  mrr: 0,
};

/** Coerce API statistics — backend may omit fields or use different keys. */
export function normalizeTenantStatistics(
  raw?: Partial<TenantStatistics> | Record<string, unknown> | null,
): TenantStatistics {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_TENANT_STATISTICS };

  const n = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);

  return {
    total: n(raw.total),
    active: n(raw.active),
    inactive: n(raw.inactive),
    trial: n(raw.trial),
    mrr: n(raw.mrr),
  };
}
