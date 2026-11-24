import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '../api/tenant.api';
import { countUsersForTenant } from '../services/tenantUsers.service';
import type { Tenant } from '../types/tenant.types';
import { normalizeTenant } from './normalizeTenant';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
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

function resolveOwnCompany(tenant: Tenant): { name?: string; code?: string } {
  const raw = tenant as unknown as Record<string, unknown>;
  const nested = pickNestedCompany(raw);

  const name = pickString(
    nested?.name,
    nested?.company_name,
    tenant.company_name,
    tenant.display_name,
    tenant.name,
  );
  const code = pickString(nested?.code, nested?.company_code, tenant.company_code, tenant.code);

  if (!name && !code) return {};
  return {
    name: name || undefined,
    code: code || undefined,
  };
}

function looksLikeUserRow(value: unknown): boolean {
  const row = asRecord(value);
  if (!row) return false;
  return Boolean(
    pickString(row.email) ||
      pickString(row.first_name, row.firstName) ||
      pickString(row.role, row.role_slug, row.roleSlug) ||
      (pickString(row.id) && (row.tenant_id != null || row.tenantId != null)),
  );
}

function countUserLikeArray(value: unknown): number | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const users = value.filter(looksLikeUserRow);
  if (users.length === 0) return undefined;
  return users.filter((user) => {
    const row = asRecord(user);
    return !(row?.deleted_at || row?.deletedAt);
  }).length;
}

function deepFindUserCount(value: unknown, depth = 0): number | undefined {
  if (depth > 4 || value == null) return undefined;
  const record = asRecord(value);
  if (!record) return undefined;

  for (const [key, nested] of Object.entries(record)) {
    if (/user/i.test(key) && /(count|total|created|size|length)/i.test(key)) {
      const n = coerceOptionalNumber(nested);
      if (n != null) return n;
    }
  }

  for (const nested of Object.values(record)) {
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const found = deepFindUserCount(nested, depth + 1);
      if (found != null) return found;
    }
  }
  return undefined;
}

/**
 * Read a user count from a tenant payload (list or detail).
 * Backend field names vary; also accepts an embedded users[] relation.
 */
export function pickTenantUserCountFromPayload(tenant: Tenant): number | undefined {
  const raw = tenant as unknown as Record<string, unknown>;
  const stats = asRecord(raw.stats) || asRecord(raw.statistics) || asRecord(raw._count);

  const fromScalar = coerceOptionalNumber(
    tenant.total_users ??
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

  const fromArrays =
    countUserLikeArray(raw.users) ??
    countUserLikeArray(raw.Users) ??
    countUserLikeArray(raw.tenant_users) ??
    countUserLikeArray(raw.tenantUsers) ??
    countUserLikeArray(raw.created_users) ??
    countUserLikeArray(raw.createdUsers);

  if (fromArrays != null) return fromArrays;

  return deepFindUserCount(raw);
}

async function fetchTenantDetailCount(tenantId: string): Promise<number | undefined> {
  try {
    const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(TENANT_API.byId(tenantId));
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>;
    const tenant = normalizeTenant(raw);
    return pickTenantUserCountFromPayload(tenant);
  } catch {
    return undefined;
  }
}

/**
 * Fill each tenant row with company name + user count for that tenant.
 *
 * Platform Super Admin must not call tenant ERP /users (403).
 * Sources: GET /tenants payload → GET /tenants/{id}/users → GET /tenants/{id} embed.
 */
export async function enrichTenantListMetrics(tenants: Tenant[]): Promise<Tenant[]> {
  if (!tenants.length) return tenants;

  return Promise.all(
    tenants.map(async (tenant) => {
      const company = resolveOwnCompany(tenant);
      let total_users = pickTenantUserCountFromPayload(tenant);

      if (total_users == null) {
        total_users = await countUsersForTenant(tenant.id);
      }

      if (total_users == null) {
        total_users = await fetchTenantDetailCount(tenant.id);
      }

      return {
        ...tenant,
        company_name: company.name || tenant.company_name || '',
        company_code: company.code || tenant.company_code || '',
        total_users,
      };
    }),
  );
}
