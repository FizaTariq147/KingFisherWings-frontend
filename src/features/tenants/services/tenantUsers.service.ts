import { isUuid } from '@/lib/isUuid';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { USER_API } from '@/features/users/api/user.api';

export interface TenantCreatedUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  status?: string;
  phone?: string;
  last_login_at?: string | null;
  created_at?: string;
  must_change_password?: boolean;
}

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

function pickMetaTotal(payload: unknown): number | undefined {
  const record = asRecord(payload);
  if (!record) return undefined;
  const meta =
    asRecord(record.meta) || asRecord(asRecord(record.data)?.meta) || null;
  return coerceOptionalNumber(
    meta?.total ?? meta?.totalCount ?? meta?.count ?? record.total,
  );
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;
  if (Array.isArray(record.users)) return record.users;
  return [];
}

function normalizeTenantCreatedUser(raw: unknown): TenantCreatedUser | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id || !isUuid(id)) return null;
  if (r.deleted_at || r.deletedAt) return null;

  const first = pickString(r.first_name, r.firstName);
  const last = pickString(r.last_name, r.lastName);
  const full =
    pickString(r.full_name, r.fullName, r.name) ||
    [first, last].filter(Boolean).join(' ').trim();

  return {
    id,
    email: pickString(r.email) || undefined,
    first_name: first || undefined,
    last_name: last || undefined,
    full_name: full || undefined,
    role: pickString(r.role, r.role_slug, r.roleSlug) || undefined,
    status: pickString(r.status) || undefined,
    phone: pickString(r.phone) || undefined,
    last_login_at:
      pickString(r.last_login_at, r.lastLoginAt) ||
      (r.last_login_at === null || r.lastLoginAt === null ? null : undefined),
    created_at: pickString(r.created_at, r.createdAt) || undefined,
    must_change_password:
      r.must_change_password === true ||
      r.mustChangePassword === true ||
      undefined,
  };
}

/**
 * Super Admin: list users belonging to a tenant.
 * Uses GET /users with tenant_id + X-Tenant-Id (platform token has no tenant scope).
 */
export async function listUsersForTenant(
  tenantId: string,
): Promise<TenantCreatedUser[]> {
  if (!isUuid(tenantId)) return [];

  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const users: TenantCreatedUser[] = [];
  const seen = new Set<string>();

  while (page <= totalPages && page <= 50) {
    const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(USER_API.list, {
      params: { page, limit: pageSize, tenant_id: tenantId },
      headers: { 'X-Tenant-Id': tenantId },
    });

    const envelope = res.data ?? res;
    const rows = unwrapList(asRecord(envelope)?.data ?? envelope)
      .map(normalizeTenantCreatedUser)
      .filter((u): u is TenantCreatedUser => Boolean(u));

    for (const user of rows) {
      if (seen.has(user.id)) continue;
      seen.add(user.id);
      users.push(user);
    }

    const metaTotal = pickMetaTotal(envelope);
    if (metaTotal != null && metaTotal >= 0) {
      totalPages = Math.max(1, Math.ceil(metaTotal / pageSize));
    } else {
      totalPages = rows.length < pageSize ? page : page + 1;
    }

    if (rows.length === 0) break;
    page += 1;
  }

  return users;
}

/** Count users for a tenant (prefer pagination meta.total). */
export async function countUsersForTenant(
  tenantId: string,
): Promise<number | undefined> {
  if (!isUuid(tenantId)) return undefined;

  const attempts: Array<{
    params: Record<string, string | number>;
    headers?: Record<string, string>;
  }> = [
    {
      params: { page: 1, limit: 1, tenant_id: tenantId },
      headers: { 'X-Tenant-Id': tenantId },
    },
    {
      params: { page: 1, limit: 1 },
      headers: { 'X-Tenant-Id': tenantId },
    },
    {
      params: { page: 1, limit: 1, tenantId },
      headers: { 'X-Tenant-Id': tenantId },
    },
  ];

  for (const attempt of attempts) {
    try {
      const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(USER_API.list, {
        params: attempt.params,
        headers: attempt.headers,
      });
      const envelope = res.data ?? res;
      const metaTotal = pickMetaTotal(envelope);
      if (metaTotal != null) return metaTotal;

      const rows = unwrapList(asRecord(envelope)?.data ?? envelope);
      // If the API ignored tenant scope and returned a large unscoped page, don't trust length=1.
      if (rows.length === 0) return 0;
    } catch {
      /* try next shape */
    }
  }

  try {
    const users = await listUsersForTenant(tenantId);
    return users.length;
  } catch {
    return undefined;
  }
}
