import type { Tenant } from '../types/tenant.types';

type SubscriptionPlan = Tenant['subscription_plan'];
type TenantLifecycleStatus = Tenant['status'];

function coerceStringField(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['name', 'code', 'value', 'slug', 'label']) {
      if (typeof record[key] === 'string') return record[key] as string;
    }
  }
  return String(value);
}

function coercePlan(value: unknown): SubscriptionPlan {
  const raw = coerceStringField(value, 'starter').toLowerCase();
  if (raw === 'growth' || raw === 'enterprise') return raw;
  return 'starter';
}

function coerceLifecycleStatus(value: unknown): TenantLifecycleStatus {
  const raw = coerceStringField(value, 'trial').toLowerCase();
  return raw === 'active' ? 'active' : 'trial';
}

/** Map API tenant records to the frontend Tenant shape. */
export function normalizeTenant(raw: Record<string, unknown>): Tenant {
  return {
    ...(raw as unknown as Tenant),
    subscription_plan: coercePlan(raw.subscription_plan),
    status: coerceLifecycleStatus(raw.status),
    company_code: coerceStringField(raw.company_code),
    company_name: coerceStringField(raw.company_name),
    company_legal_name: coerceStringField(raw.company_legal_name),
    company_registration_number: coerceStringField(raw.company_registration_number),
  };
}

export function normalizeTenants(raw: unknown): Tenant[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeTenant(item as Record<string, unknown>));
}
