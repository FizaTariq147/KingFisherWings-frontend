import type { Tenant } from '../types/tenant.types';
import { SUBSCRIPTION_PLANS, TENANT_STATUSES } from '../schemas/tenant.schema';

type SubscriptionPlan = Tenant['subscription_plan'];
type TenantLifecycleStatus = Tenant['status'];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

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

function coerceOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickNestedCompany(raw: Record<string, unknown>): Record<string, unknown> | null {
  return (
    asRecord(raw.company) ||
    asRecord(raw.Company) ||
    asRecord(raw.default_company) ||
    asRecord(raw.defaultCompany) ||
    null
  );
}

function pickCompanyName(raw: Record<string, unknown>): string {
  const nested = pickNestedCompany(raw);
  return coerceStringField(
    raw.company_name ??
      raw.companyName ??
      nested?.name ??
      nested?.company_name ??
      nested?.display_name,
  );
}

function pickCompanyCode(raw: Record<string, unknown>): string {
  const nested = pickNestedCompany(raw);
  return coerceStringField(
    raw.company_code ?? raw.companyCode ?? nested?.code ?? nested?.company_code,
  );
}

function pickTotalUsers(raw: Record<string, unknown>): number | undefined {
  const stats = asRecord(raw.stats) || asRecord(raw.statistics) || asRecord(raw._count);
  const fromScalar = coerceOptionalNumber(
    raw.total_users ??
      raw.users_count ??
      raw.user_count ??
      raw.totalUsers ??
      raw.usersCount ??
      raw.userCount ??
      raw.created_users ??
      raw.createdUsers ??
      raw.created_users_count ??
      raw.createdUsersCount ??
      stats?.users ??
      stats?.user ??
      stats?.total_users ??
      stats?.Users,
  );
  if (fromScalar != null) return fromScalar;

  for (const key of ['users', 'Users', 'tenant_users', 'tenantUsers', 'created_users', 'createdUsers']) {
    const value = raw[key];
    if (Array.isArray(value)) {
      const live = value.filter((item) => {
        const row = asRecord(item);
        return row && !(row.deleted_at || row.deletedAt);
      });
      if (live.length > 0 || value.length === 0) return live.length;
    }
  }
  return undefined;
}

function pickDeletedAt(raw: Record<string, unknown>): string | null {
  const value = raw.deleted_at ?? raw.deletedAt;
  if (typeof value === 'string' && value) return value;
  if (raw.is_deleted === true || raw.isDeleted === true) {
    return new Date().toISOString();
  }
  return null;
}

function coerceIsActive(raw: Record<string, unknown>): boolean {
  const flag = raw.is_active ?? raw.isActive;
  if (typeof flag === 'boolean') return flag;
  if (flag === 'true' || flag === 1 || flag === '1') return true;
  if (flag === 'false' || flag === 0 || flag === '0') return false;

  const status = coerceStringField(raw.status).toUpperCase();
  if (status === 'INACTIVE' || status === 'SUSPENDED' || status === 'DISABLED') return false;
  if (status === 'ACTIVE' || status === 'TRIAL') return true;

  // Default live tenants to active when the API omits the flag.
  return true;
}

/** Map API tenant records to the frontend Tenant shape. */
export function normalizeTenant(raw: Record<string, unknown>): Tenant {
  const slug = coerceStringField(raw.slug).replace(/^\/|\/$/g, '');
  const nested = pickNestedCompany(raw);
  const deletedAt = pickDeletedAt(raw);

  return {
    ...(raw as unknown as Tenant),
    slug,
    name: coerceStringField(raw.name ?? raw.display_name),
    display_name: coerceStringField(
      raw.display_name ?? raw.displayName ?? raw.name,
    ),
    subscription_plan: coercePlan(raw.subscription_plan),
    status: coerceLifecycleStatus(raw.status),
    is_active: deletedAt ? false : coerceIsActive(raw),
    deleted_at: deletedAt,
    company_code: pickCompanyCode(raw),
    company_name: pickCompanyName(raw),
    company_legal_name: coerceStringField(
      raw.company_legal_name ?? raw.companyLegalName ?? nested?.legal_name,
    ),
    company_registration_number: coerceStringField(
      raw.company_registration_number ??
        raw.companyRegistrationNumber ??
        nested?.registration_number,
    ),
    total_users: pickTotalUsers(raw),
    total_branches: coerceOptionalNumber(
      raw.total_branches ?? raw.branches_count ?? raw.branch_count,
    ),
    storage_used_gb: coerceOptionalNumber(
      raw.storage_used_gb ?? raw.storage_usage_gb ?? raw.used_storage_gb,
    ),
  };
}

export function normalizeTenants(raw: unknown): Tenant[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeTenant(item as Record<string, unknown>));
}
