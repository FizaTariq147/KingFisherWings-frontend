import type { Tenant } from '../types/tenant.types';
import { SUBSCRIPTION_PLANS, TENANT_STATUSES } from '../schemas/tenant.schema';

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

function coerceEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const raw = coerceStringField(value, fallback).toUpperCase() as T;
  return allowed.includes(raw) ? raw : fallback;
}

function coercePlan(value: unknown): SubscriptionPlan {
  return coerceEnum(value, SUBSCRIPTION_PLANS, 'TRIAL');
}

function coerceLifecycleStatus(value: unknown): TenantLifecycleStatus {
  return coerceEnum(value, TENANT_STATUSES, 'TRIAL');
}

/** Map API tenant records to the frontend Tenant shape. */
export function normalizeTenant(raw: Record<string, unknown>): Tenant {
  const slug = coerceStringField(raw.slug).replace(/^\/|\/$/g, '');

  return {
    ...(raw as unknown as Tenant),
    slug,
    subscription_plan: coercePlan(raw.subscription_plan),
    status: coerceLifecycleStatus(raw.status),
    company_code: coerceStringField(raw.company_code),
    company_name: coerceStringField(raw.company_name),
    company_legal_name: coerceStringField(raw.company_legal_name),
    company_registration_number: coerceStringField(raw.company_registration_number),
    total_users: coerceOptionalNumber(
      raw.total_users ?? raw.users_count ?? raw.user_count,
    ),
    total_branches: coerceOptionalNumber(
      raw.total_branches ?? raw.branches_count ?? raw.branch_count,
    ),
    storage_used_gb: coerceOptionalNumber(
      raw.storage_used_gb ?? raw.storage_usage_gb ?? raw.used_storage_gb,
    ),
  };
}

function coerceOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function normalizeTenants(raw: unknown): Tenant[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeTenant(item as Record<string, unknown>));
}
