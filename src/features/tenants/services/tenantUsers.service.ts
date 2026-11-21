import { isUuid } from '@/lib/isUuid';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '../api/tenant.api';
import {
  extractUsersFromTenantPayload,
  normalizeTenantCreatedUser,
  type TenantCreatedUser,
} from '../utils/extractTenantUsers';

export type { TenantCreatedUser };

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
  return [];
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

/**
 * Super Admin only — never call tenant ERP GET /users (403 for platform tokens).
 *
 * Sources:
 * 1) GET /tenants/{id}/users (platform nested route, when BE exposes it)
 * 2) GET /tenants/{id} payload embedded users / owner / admin_user
 */
export async function listUsersForTenant(
  tenantId: string,
): Promise<TenantCreatedUser[]> {
  if (!isUuid(tenantId)) return [];

  // 1) Nested under /tenants (platform) — preferred when available.
  try {
    const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(
      TENANT_API.users(tenantId),
      { params: { page: 1, limit: 100 } },
    );
    const envelope = res.data ?? res;
    const rows = unwrapList(asRecord(envelope)?.data ?? envelope)
      .map(normalizeTenantCreatedUser)
      .filter((u): u is TenantCreatedUser => Boolean(u));
    if (rows.length > 0) return rows;
    // Empty array with 200 → tenant has no users yet.
    if (Array.isArray(asRecord(envelope)?.data) || Array.isArray(envelope)) {
      return rows;
    }
  } catch {
    /* fall through to tenant detail embed */
  }

  // 2) Embedded on GET /tenants/{id}
  const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(
    TENANT_API.byId(tenantId),
  );
  const payload = (res.data?.data ?? res.data ?? res) as unknown;
  return extractUsersFromTenantPayload(payload);
}

/** Count users for a tenant via /tenants only (no ERP /users). */
export async function countUsersForTenant(
  tenantId: string,
): Promise<number | undefined> {
  if (!isUuid(tenantId)) return undefined;

  try {
    const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(
      TENANT_API.users(tenantId),
      { params: { page: 1, limit: 1 } },
    );
    const envelope = res.data ?? res;
    const metaTotal = pickMetaTotal(envelope);
    if (metaTotal != null) return metaTotal;
    const rows = unwrapList(asRecord(envelope)?.data ?? envelope);
    if (Array.isArray(asRecord(envelope)?.data) || Array.isArray(envelope)) {
      return rows.length;
    }
  } catch {
    /* fall through */
  }

  try {
    const users = await listUsersForTenant(tenantId);
    return users.length;
  } catch {
    return undefined;
  }
}
