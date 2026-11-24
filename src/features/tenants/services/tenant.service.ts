import { isUuid } from '@/lib/isUuid';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '../api/tenant.api';
import { isDeletedTenant } from '../utils/deletedTenantsRegistry';
import { enrichTenantListMetrics } from '../utils/enrichTenantListMetrics';
import { filterTenantsByStatus, paginateTenants } from '../utils/filterTenants';
import { normalizeTenant, normalizeTenants } from '../utils/normalizeTenant';
import {
  deriveTenantStatisticsFromList,
  normalizeTenantStatistics,
} from '../utils/normalizeTenantStatistics';
import { prepareTenantPayload } from '../utils/prepareTenantPayload';
import { sortTenants } from '../utils/sortTenants';
import type {
  CreateTenantDto,
  PaginationMeta,
  Tenant,
  TenantListParams,
  TenantStatistics,
  UpdateTenantDto,
  UpdateTenantFeaturesDto,
} from '../types/tenant.types';

export interface TenantListResult {
  tenants: Tenant[];
  meta: PaginationMeta;
}

/** Swagger lists `search`; status / include_deleted are used for Deleted tab (cross-device). */
function buildListQueryParams(
  params: TenantListParams,
  extras?: Record<string, string>,
): Record<string, string> {
  const query: Record<string, string> = { ...(extras ?? {}) };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== 'deleted') {
    query.status = params.status;
  }
  return query;
}

async function fetchTenantsFromApi(
  query: Record<string, string>,
): Promise<{ tenants: Tenant[]; meta?: PaginationMeta }> {
  const res = await superAdminApiClient.get<ApiEnvelope<Tenant[], PaginationMeta>>(
    TENANT_API.list,
    { params: query },
  );
  return {
    tenants: normalizeTenants(res.data?.data ?? res.data),
    meta: res.data?.meta,
  };
}

/**
 * Soft-deleted tenants for Deleted trash — server-backed (all devices).
 * Prefer GET /tenants/deleted, then legacy status/include_deleted fallbacks.
 */
async function fetchDeletedTenantsFromApi(
  params: TenantListParams,
): Promise<Tenant[]> {
  const search = params.search?.trim() ? { search: params.search.trim() } : {};

  try {
    const res = await superAdminApiClient.get<ApiEnvelope<Tenant[], PaginationMeta>>(
      TENANT_API.deleted,
      { params: search },
    );
    const tenants = normalizeTenants(res.data?.data ?? res.data);
    if (tenants.length > 0) {
      return tenants.map((tenant) =>
        isDeletedTenant(tenant)
          ? tenant
          : {
              ...tenant,
              deleted_at: tenant.deleted_at || new Date().toISOString(),
              is_active: false,
            },
      );
    }
  } catch {
    /* fall through */
  }

  try {
    const { tenants } = await fetchTenantsFromApi({ ...search, status: 'deleted' });
    const marked = tenants.filter(isDeletedTenant);
    if (marked.length > 0) return marked;
    if (tenants.length > 0) {
      return tenants.map((tenant) =>
        isDeletedTenant(tenant)
          ? tenant
          : {
              ...tenant,
              deleted_at: tenant.deleted_at || new Date().toISOString(),
              is_active: false,
            },
      );
    }
  } catch {
    /* fall through */
  }

  try {
    const { tenants } = await fetchTenantsFromApi({
      ...search,
      include_deleted: 'true',
      with_deleted: 'true',
    });
    return tenants.filter(isDeletedTenant);
  } catch {
    return [];
  }
}

function applyClientListParams(tenants: Tenant[], params: TenantListParams): TenantListResult {
  let filtered = tenants;

  if (params.status) {
    filtered = filterTenantsByStatus(filtered, params.status);
  }

  filtered = sortTenants(filtered, params.sortBy, params.order);

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const { items, meta } = paginateTenants(filtered, page, limit);

  return { tenants: items, meta };
}

export const tenantService = {
  /** POST /tenants */
  async create(dto: CreateTenantDto): Promise<Tenant> {
    const res = await superAdminApiClient.post<ApiEnvelope<Tenant>>(
      TENANT_API.list,
      prepareTenantPayload(dto, { mode: 'create' }),
    );
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /** GET /tenants — live + Deleted from API (no browser storage). */
  async list(params: TenantListParams): Promise<TenantListResult> {
    if (params.status === 'deleted') {
      const deleted = await fetchDeletedTenantsFromApi(params);
      const pageResult = applyClientListParams(deleted, { ...params, status: 'deleted' });
      return {
        ...pageResult,
        tenants: await enrichTenantListMetrics(pageResult.tenants),
      };
    }

    const { tenants: raw, meta: apiMeta } = await fetchTenantsFromApi(
      buildListQueryParams(params),
    );

    const tenants = raw.filter((tenant) => !isDeletedTenant(tenant));

    // Server-side pagination when meta indicates more records than returned.
    const pageResult =
      apiMeta && apiMeta.total > tenants.length
        ? {
            tenants: sortTenants(tenants, params.sortBy, params.order),
            meta: apiMeta,
          }
        : applyClientListParams(tenants, params);

    return {
      ...pageResult,
      tenants: await enrichTenantListMetrics(pageResult.tenants),
    };
  },

  /** GET /tenants/statistics — Total matches Tenants → All list count. */
  async getStatistics(): Promise<TenantStatistics> {
    const [statsRes, listRes] = await Promise.all([
      superAdminApiClient.get<ApiEnvelope<TenantStatistics>>(TENANT_API.statistics),
      fetchTenantsFromApi({}),
    ]);

    const apiStats = normalizeTenantStatistics(statsRes.data?.data);
    const tenants = listRes.tenants.filter((tenant) => !isDeletedTenant(tenant));

    return deriveTenantStatisticsFromList(tenants, apiStats);
  },

  /** GET /tenants/{id} — works for live and soft-deleted (restore) when BE returns them. */
  async getById(id: string): Promise<Tenant> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    const res = await superAdminApiClient.get<ApiEnvelope<Tenant>>(TENANT_API.byId(id));
    const tenant = normalizeTenant(res.data.data as unknown as Record<string, unknown>);
    const [enriched] = await enrichTenantListMetrics([tenant]);
    return enriched;
  },

  /** PATCH /tenants/{id} */
  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(
      TENANT_API.byId(id),
      prepareTenantPayload(dto, { mode: 'update' }),
    );
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /**
   * GET /tenants/product-modules — catalog for Features `enabled_modules`
   * (keys such as operations, shipments, documentation, …).
   */
  async listProductModules(): Promise<Array<{ key: string; label?: string }>> {
    try {
      const res = await superAdminApiClient.get(TENANT_API.productModules);
      const raw = (res.data as { data?: unknown })?.data ?? res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { modules?: unknown })?.modules)
          ? (raw as { modules: unknown[] }).modules
          : Array.isArray((raw as { items?: unknown })?.items)
            ? (raw as { items: unknown[] }).items
            : [];
      return list
        .map((item) => {
          if (typeof item === 'string' && item.trim()) {
            return { key: item.trim(), label: item.trim() };
          }
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            const row = item as Record<string, unknown>;
            const key = String(row.key ?? row.module ?? row.code ?? row.slug ?? '').trim();
            if (!key) return null;
            const label = String(row.label ?? row.name ?? key).trim() || key;
            return { key, label };
          }
          return null;
        })
        .filter((row): row is { key: string; label: string } => Boolean(row));
    } catch {
      return [];
    }
  },

  /**
   * PATCH /tenants/{id}/features
   * Sets quote_requests_bridge and/or enabled_modules (filters permission matrix & reports).
   */
  async updateFeatures(id: string, dto: UpdateTenantFeaturesDto): Promise<Tenant> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    const body: Record<string, unknown> = {};
    if (dto.enabled_modules !== undefined) {
      body.enabled_modules = dto.enabled_modules;
    }
    if (dto.quote_requests_bridge !== undefined) {
      body.quote_requests_bridge = dto.quote_requests_bridge;
    }
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(
      TENANT_API.features(id),
      body,
    );
    const payload = (res.data?.data ?? res.data) as unknown as Record<string, unknown>;
    const tenant = normalizeTenant({ ...payload, id: payload.id || id });
    return { ...tenant, id: tenant.id || id };
  },

  /** DELETE /tenants/{id} — Soft delete tenant (appears on Deleted tab via API). */
  async softDelete(id: string, _snapshot?: Tenant): Promise<void> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    await superAdminApiClient.delete<ApiEnvelope<null>>(TENANT_API.byId(id));
  },

  /** PATCH /tenants/{id}/restore — Restore a soft-deleted tenant. */
  async restore(id: string): Promise<Tenant> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.restore(id));
    const tenant = normalizeTenant((res.data?.data ?? { id }) as unknown as Record<string, unknown>);
    return {
      ...tenant,
      id: tenant.id || id,
      deleted_at: null,
    };
  },

  /**
   * DELETE /tenants/{id}/permanent — irreversible hard-delete (soft-deleted only).
   * BE returns 409 when related records still exist.
   */
  async permanentDelete(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    await superAdminApiClient.delete(TENANT_API.permanent(id));
  },

  /** PATCH /tenants/{id}/activate */
  async activate(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.activate(id));
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /** PATCH /tenants/{id}/deactivate */
  async deactivate(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.deactivate(id));
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /**
   * POST /tenants/{id}/sync-permissions
   * Reconcile one tenant against the current permission/role catalog
   * (needed after new GL modules add permissions like gl.manage_coa).
   */
  async syncPermissions(id: string): Promise<unknown> {
    const res = await superAdminApiClient.post(TENANT_API.syncPermissions(id));
    return res.data;
  },

  /** POST /tenants/sync-permissions — all tenants. */
  async syncPermissionsAll(): Promise<unknown> {
    const res = await superAdminApiClient.post(TENANT_API.syncPermissionsAll);
    return res.data;
  },
};

