import { isUuid } from '@/lib/isUuid';
import { isAxiosError } from 'axios';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '../api/tenant.api';
import {
  extractUsersFromTenantPayload,
  normalizeTenantCreatedUser,
  type TenantCreatedUser,
} from '../utils/extractTenantUsers';

export type { TenantCreatedUser };

/** How Super Admin obtained the tenant user roster (never ERP GET /users). */
export type TenantUsersSource = 'tenants_users' | 'tenant_embed' | 'unavailable';

export interface TenantUsersListResult {
  users: TenantCreatedUser[];
  source: TenantUsersSource;
  /** True when nested route 404'd / missing — BE must add GET /tenants/{id}/users. */
  platformRouteMissing?: boolean;
}

/**
 * Live BE currently has no GET /tenants/{id}/users (404). After the first miss,
 * skip further probes for this page session so the Network console is not flooded.
 * Cleared when a probe succeeds (BE shipped the route).
 */
let tenantsUsersRouteMissing = false;

/** Test / manual retry helper — does not clear automatically on navigation. */
export function resetTenantsUsersRouteProbe(): void {
  tenantsUsersRouteMissing = false;
}

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

function pickMeta(payload: unknown): {
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
} {
  const record = asRecord(payload);
  if (!record) return {};
  const meta =
    asRecord(record.meta) || asRecord(asRecord(record.data)?.meta) || null;
  if (!meta) {
    return {
      total: coerceOptionalNumber(record.total),
    };
  }
  return {
    total: coerceOptionalNumber(
      meta.total ?? meta.totalCount ?? meta.count ?? record.total,
    ),
    page: coerceOptionalNumber(meta.page ?? meta.currentPage ?? meta.current_page),
    totalPages: coerceOptionalNumber(
      meta.totalPages ?? meta.total_pages ?? meta.pageCount ?? meta.page_count,
    ),
    limit: coerceOptionalNumber(meta.limit ?? meta.pageSize ?? meta.page_size),
  };
}

function isMissingRouteError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 404 || status === 405;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

/**
 * Prefer platform nested list — same roster Tenant Admin sees at /admin/users
 * (ERP GET /users), but via Super Admin–safe /tenants/{id}/users.
 */
async function fetchAllFromTenantsUsersRoute(
  tenantId: string,
): Promise<{ users: TenantCreatedUser[]; ok: boolean; missingRoute: boolean }> {
  if (tenantsUsersRouteMissing) {
    return { users: [], ok: false, missingRoute: true };
  }

  const collected: TenantCreatedUser[] = [];
  const seen = new Set<string>();

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(
        TENANT_API.users(tenantId),
        { params: { page, limit: PAGE_SIZE } },
      );
      const envelope = res.data ?? res;
      const rows = unwrapList(asRecord(envelope)?.data ?? envelope)
        .map(normalizeTenantCreatedUser)
        .filter((u): u is TenantCreatedUser => Boolean(u));

      for (const user of rows) {
        if (seen.has(user.id)) continue;
        seen.add(user.id);
        collected.push(user);
      }

      const meta = pickMeta(envelope);
      const totalPages =
        meta.totalPages ??
        (meta.total != null
          ? Math.max(1, Math.ceil(meta.total / (meta.limit ?? PAGE_SIZE)))
          : undefined);

      const exhaustedByMeta =
        totalPages != null
          ? page >= totalPages
          : meta.total != null
            ? collected.length >= meta.total
            : rows.length < PAGE_SIZE;

      if (exhaustedByMeta) break;
      if (rows.length === 0) break;
    }

    tenantsUsersRouteMissing = false;
    return { users: collected, ok: true, missingRoute: false };
  } catch (error) {
    if (isMissingRouteError(error)) {
      tenantsUsersRouteMissing = true;
      return { users: [], ok: false, missingRoute: true };
    }
    return { users: [], ok: false, missingRoute: false };
  }
}

async function fetchEmbeddedOnTenantDetail(
  tenantId: string,
): Promise<TenantCreatedUser[]> {
  const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(
    TENANT_API.byId(tenantId),
  );
  const payload = (res.data?.data ?? res.data ?? res) as unknown;
  return extractUsersFromTenantPayload(payload);
}

/**
 * Super Admin only — never call tenant ERP GET /users (403 for platform tokens).
 *
 * Sources (same users Tenant Admin lists at /admin/users once BE exposes #1):
 * 1) GET /tenants/{id}/users (paginated)
 * 2) GET /tenants/{id} embedded users / owner / admin_user
 */
export async function listUsersForTenantDetailed(
  tenantId: string,
): Promise<TenantUsersListResult> {
  if (!isUuid(tenantId)) {
    return { users: [], source: 'unavailable', platformRouteMissing: true };
  }

  const nested = await fetchAllFromTenantsUsersRoute(tenantId);
  if (nested.ok) {
    return {
      users: nested.users,
      source: 'tenants_users',
      platformRouteMissing: false,
    };
  }

  try {
    const embedded = await fetchEmbeddedOnTenantDetail(tenantId);
    return {
      users: embedded,
      source: embedded.length > 0 ? 'tenant_embed' : 'unavailable',
      platformRouteMissing: nested.missingRoute || tenantsUsersRouteMissing,
    };
  } catch {
    return {
      users: [],
      source: 'unavailable',
      platformRouteMissing: nested.missingRoute || tenantsUsersRouteMissing,
    };
  }
}

export async function listUsersForTenant(
  tenantId: string,
): Promise<TenantCreatedUser[]> {
  const result = await listUsersForTenantDetailed(tenantId);
  return result.users;
}

/** Count users for a tenant via /tenants only (no ERP /users). */
export async function countUsersForTenant(
  tenantId: string,
): Promise<number | undefined> {
  if (!isUuid(tenantId)) return undefined;

  if (!tenantsUsersRouteMissing) {
    try {
      const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(
        TENANT_API.users(tenantId),
        { params: { page: 1, limit: 1 } },
      );
      const envelope = res.data ?? res;
      tenantsUsersRouteMissing = false;
      const meta = pickMeta(envelope);
      if (meta.total != null) return meta.total;
      const rows = unwrapList(asRecord(envelope)?.data ?? envelope);
      if (Array.isArray(asRecord(envelope)?.data) || Array.isArray(envelope)) {
        return rows.length;
      }
    } catch (error) {
      if (isMissingRouteError(error)) {
        tenantsUsersRouteMissing = true;
      }
    }
  }

  try {
    const users = await listUsersForTenant(tenantId);
    return users.length;
  } catch {
    return undefined;
  }
}
