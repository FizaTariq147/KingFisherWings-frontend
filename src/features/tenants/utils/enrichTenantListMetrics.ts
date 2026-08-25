import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { USER_API } from '@/features/users/api/user.api';
import { TENANT_API } from '../api/tenant.api';
import type { Tenant } from '../types/tenant.types';
import { normalizeTenant } from './normalizeTenant';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;
  if (Array.isArray(record.users)) return record.users;
  if (Array.isArray(record.tenants)) return record.tenants;
  return [];
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

function pickMetaTotal(payload: unknown): number | undefined {
  const record = asRecord(payload);
  if (!record) return undefined;

  const meta =
    asRecord(record.meta) ||
    asRecord(asRecord(record.data)?.meta) ||
    null;

  return coerceOptionalNumber(
    meta?.total ?? meta?.totalCount ?? meta?.count ?? record.total,
  );
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

function pickUserTenantId(user: Record<string, unknown>): string {
  return pickString(user.tenant_id, user.tenantId, asRecord(user.tenant)?.id);
}

/**
 * Super Admin JWT has no tenant scope, and X-Tenant-Id is ignored by /users.
 * If the platform token can list users globally, group counts by tenant_id.
 * Returns null when the call fails or the list is empty / unusable.
 */
async function fetchGlobalUserCountsByTenant(): Promise<Map<string, number> | null> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const counts = new Map<string, number>();
  const seenIds = new Set<string>();

  try {
    while (page <= totalPages && page <= 100) {
      const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(USER_API.list, {
        params: { page, limit: pageSize },
      });

      const envelope = res.data ?? res;
      const list = unwrapList(asRecord(envelope)?.data ?? envelope)
        .map((item) => asRecord(item))
        .filter(Boolean) as Record<string, unknown>[];

      if (page === 1 && list.length === 0) {
        const metaTotal = pickMetaTotal(envelope);
        // Empty first page → Super Admin cannot read tenant users this way.
        if (metaTotal == null || metaTotal === 0) return null;
      }

      for (const user of list) {
        if (user.deleted_at || user.deletedAt) continue;
        const id = pickString(user.id);
        if (id) {
          if (seenIds.has(id)) continue;
          seenIds.add(id);
        }
        const tenantId = pickUserTenantId(user);
        if (!tenantId) continue;
        counts.set(tenantId, (counts.get(tenantId) ?? 0) + 1);
      }

      const metaTotal = pickMetaTotal(envelope);
      if (metaTotal != null && metaTotal >= 0) {
        totalPages = Math.max(1, Math.ceil(metaTotal / pageSize));
      } else {
        totalPages = list.length < pageSize ? page : page + 1;
      }

      if (list.length === 0) break;
      page += 1;
    }
  } catch {
    return null;
  }

  return counts.size > 0 ? counts : null;
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
 * Maps only to documented Super Admin APIs:
 * - GET /tenants and GET /tenants/{id} payload fields
 * - GET /users (paginated) grouped by tenant_id when the platform token can list users
 */
export async function enrichTenantListMetrics(tenants: Tenant[]): Promise<Tenant[]> {
  if (!tenants.length) return tenants;

  const needsCounts = tenants.some((t) => pickTenantUserCountFromPayload(t) == null);
  const globalCounts = needsCounts ? await fetchGlobalUserCountsByTenant() : null;

  return Promise.all(
    tenants.map(async (tenant) => {
      const company = resolveOwnCompany(tenant);
      let total_users = pickTenantUserCountFromPayload(tenant);

      if (total_users == null && globalCounts) {
        total_users = globalCounts.get(tenant.id) ?? 0;
      }

      if (total_users == null) {
        total_users = await fetchTenantDetailCount(tenant.id);
      }

      return {
        ...tenant,
        company_name: company.name || tenant.company_name || '',
        company_code: company.code || tenant.company_code || '',
        total_users: total_users ?? (globalCounts ? 0 : tenant.total_users),
      };
    }),
  );
}
